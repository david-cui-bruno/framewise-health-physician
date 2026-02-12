"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  CheckCircle2,
  Heart,
  Activity,
  FlaskConical,
  Pill,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CarePathway, Physician } from "@/types/database";
import { confirmAndCreatePatient } from "./actions";
import { useWebRTCSignaling } from "@/hooks/use-webrtc-signaling";
import { ConnectPhoneStep } from "@/components/scanner/connect-phone-step";
import { ScanningStep } from "@/components/scanner/scanning-step";
import { DEMO_EXTRACTED_DATA } from "@/lib/scanner/demo-data";

type ScannerStep = "connect" | "scanning" | "processing" | "review" | "confirm";

const steps: ScannerStep[] = [
  "connect",
  "scanning",
  "processing",
  "review",
  "confirm",
];
const stepLabels: Record<ScannerStep, string> = {
  connect: "Connect",
  scanning: "Scanning",
  processing: "Extracting",
  review: "Review",
  confirm: "Done",
};

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface EditableData {
  name: string;
  email: string;
  care_pathway_id: string;
  discharge_date: string;
  weight_admission_kg: string;
  weight_discharge_kg: string;
  resting_heart_rate_bpm: string;
  heart_rhythm: string;
  blood_pressure: string;
  nyha_class: string;
  ejection_fraction_pct: string;
  lv_assessment_method: string;
  lv_assessment_date: string;
  potassium: string;
  sodium: string;
  urea: string;
  creatinine: string;
  egfr: string;
  medications: Medication[];
  patient_specific_instructions: string;
  care_plan_notes: string;
  follow_up_date: string;
  follow_up_instructions: string;
  diagnosis: string;
}

const emptyData: EditableData = {
  name: "",
  email: "",
  care_pathway_id: "",
  discharge_date: "",
  weight_admission_kg: "",
  weight_discharge_kg: "",
  resting_heart_rate_bpm: "",
  heart_rhythm: "",
  blood_pressure: "",
  nyha_class: "",
  ejection_fraction_pct: "",
  lv_assessment_method: "",
  lv_assessment_date: "",
  potassium: "",
  sodium: "",
  urea: "",
  creatinine: "",
  egfr: "",
  medications: [],
  patient_specific_instructions: "",
  care_plan_notes: "",
  follow_up_date: "",
  follow_up_instructions: "",
  diagnosis: "",
};

export default function ScannerPage() {
  const [currentStep, setCurrentStep] = useState<ScannerStep>("connect");
  const [error, setError] = useState<string | null>(null);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pathways, setPathways] = useState<CarePathway[]>([]);
  const [physician, setPhysician] = useState<Physician | null>(null);
  const [editedData, setEditedData] = useState<EditableData>(emptyData);
  const router = useRouter();
  const supabase = createClient();

  // Phone scanning state
  const [sessionId] = useState(() => crypto.randomUUID());
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [capturedPageCount, setCapturedPageCount] = useState(0);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const scanIdRef = useRef<string | null>(null);

  // WebRTC connection (desktop = receiver)
  const { connectionState } = useWebRTCSignaling({
    sessionId,
    role: "receiver",
    onRemoteStream: useCallback((stream: MediaStream) => {
      setRemoteStream(stream);
      setCurrentStep("scanning");
    }, []),
    onPhoneConnected: useCallback(() => {
      setPhoneConnected(true);
    }, []),
    onPageCaptured: useCallback((pageNumber: number) => {
      setCapturedPageCount(pageNumber);
    }, []),
    onScanDone: useCallback(
      (_totalPages: number) => {
        // Transition to "processing" then load demo data
        setCurrentStep("processing");
        setTimeout(() => {
          const defaultPathwayId =
            physician?.default_pathway_id ?? pathways[0]?.id ?? "";
          setEditedData({
            ...DEMO_EXTRACTED_DATA,
            care_pathway_id: defaultPathwayId,
          });
          setCurrentStep("review");
        }, 2000);
      },
      [physician, pathways]
    ),
  });

  // Load pathways and physician data
  useEffect(() => {
    async function loadData() {
      const [{ data: pathwayData }, { data: physicianData }] =
        await Promise.all([
          supabase
            .from("care_pathways")
            .select("*")
            .eq("is_active", true)
            .returns<CarePathway[]>(),
          supabase
            .from("physicians")
            .select("*")
            .returns<Physician[]>()
            .single(),
        ]);
      setPathways(pathwayData ?? []);
      setPhysician(physicianData);
    }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first pathway when pathways load and none is selected
  useEffect(() => {
    if (pathways.length > 0 && !editedData.care_pathway_id) {
      const defaultId = physician?.default_pathway_id ?? pathways[0].id;
      setEditedData((d) => ({ ...d, care_pathway_id: defaultId }));
    }
  }, [pathways, physician, editedData.care_pathway_id]);

  // Create a discharge_scans row when entering processing
  useEffect(() => {
    if (currentStep !== "processing" || scanIdRef.current || !physician) return;
    (async () => {
      const { data: scan } = await (
        supabase.from("discharge_scans") as any
      )
        .insert({
          physician_id: physician.id,
          image_url: "phone-scan",
          status: "processing",
        })
        .select("id")
        .single() as { data: { id: string } | null; error: any };
      if (scan) scanIdRef.current = scan.id;
    })();
  }, [currentStep, physician, supabase]);

  const update = useCallback(
    <K extends keyof EditableData>(key: K, value: EditableData[K]) => {
      setEditedData((d) => ({ ...d, [key]: value }));
    },
    []
  );

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);

    const medStrings = editedData.medications
      .filter((m) => m.name)
      .map((m) => [m.name, m.dosage, m.frequency].filter(Boolean).join(" - "));

    const clinicalData = {
      weight_admission_kg: editedData.weight_admission_kg || null,
      weight_discharge_kg: editedData.weight_discharge_kg || null,
      resting_heart_rate_bpm: editedData.resting_heart_rate_bpm || null,
      heart_rhythm: editedData.heart_rhythm || null,
      blood_pressure: editedData.blood_pressure || null,
      nyha_class: editedData.nyha_class || null,
      ejection_fraction_pct: editedData.ejection_fraction_pct || null,
      lv_assessment_method: editedData.lv_assessment_method || null,
      lv_assessment_date: editedData.lv_assessment_date || null,
      potassium: editedData.potassium || null,
      sodium: editedData.sodium || null,
      urea: editedData.urea || null,
      creatinine: editedData.creatinine || null,
      egfr: editedData.egfr || null,
      patient_specific_instructions:
        editedData.patient_specific_instructions || null,
      care_plan_notes: editedData.care_plan_notes || null,
      follow_up_instructions: editedData.follow_up_instructions || null,
    };

    const payload = {
      scan_id: scanIdRef.current || undefined,
      name: editedData.name,
      email: editedData.email,
      discharge_date: editedData.discharge_date || undefined,
      diagnosis: editedData.diagnosis || undefined,
      medications: medStrings,
      restrictions: editedData.patient_specific_instructions || undefined,
      follow_up_date: editedData.follow_up_date || undefined,
      care_pathway_id: editedData.care_pathway_id,
      clinical_data: clinicalData,
    };
    console.log("[handleConfirm] payload:", JSON.stringify(payload, null, 2));

    const result = await confirmAndCreatePatient(payload);
    console.log("[handleConfirm] result:", JSON.stringify(result, null, 2));

    setIsSubmitting(false);

    if ("error" in result && result.error) {
      const messages = Object.values(result.error).flat();
      console.error("[handleConfirm] error messages:", messages);
      setError(messages.join(", "));
      return;
    }

    if ("patientId" in result && result.patientId) {
      setCreatedPatientId(result.patientId);
      setCurrentStep("confirm");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Add Patient via Discharge Scan</h1>

      {/* Step indicator */}
      <div className="flex gap-1">
        {steps.map((step, i) => (
          <div key={step} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                i <= steps.indexOf(currentStep) ? "bg-primary" : "bg-muted"
              }`}
            />
            <p
              className={`mt-1 text-xs ${
                i <= steps.indexOf(currentStep)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {stepLabels[step]}
            </p>
          </div>
        ))}
      </div>

      {/* ===== CONNECT STEP ===== */}
      {currentStep === "connect" && (
        <ConnectPhoneStep
          sessionId={sessionId}
          phoneConnected={phoneConnected}
        />
      )}

      {/* ===== SCANNING STEP ===== */}
      {currentStep === "scanning" && (
        <ScanningStep
          remoteStream={remoteStream}
          capturedPageCount={capturedPageCount}
          connectionState={connectionState}
        />
      )}

      {/* ===== PROCESSING STEP ===== */}
      {currentStep === "processing" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Analyzing discharge document with AI...
            </p>
            <p className="text-xs text-muted-foreground">
              Extracting clinical assessment, labs, medications, and
              instructions
            </p>
          </CardContent>
        </Card>
      )}

      {/* ===== REVIEW STEP ===== */}
      {currentStep === "review" && (
        <div className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={editedData.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={editedData.diagnosis}
                    onChange={(e) => update("diagnosis", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="discharge_date">Discharge Date</Label>
                  <Input
                    id="discharge_date"
                    type="date"
                    value={editedData.discharge_date}
                    onChange={(e) =>
                      update("discharge_date", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Clinical Assessment at Discharge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Admission Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedData.weight_admission_kg}
                    onChange={(e) =>
                      update("weight_admission_kg", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Discharge Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedData.weight_discharge_kg}
                    onChange={(e) =>
                      update("weight_discharge_kg", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={editedData.resting_heart_rate_bpm}
                    onChange={(e) =>
                      update("resting_heart_rate_bpm", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Rhythm</Label>
                  <Select
                    value={editedData.heart_rhythm}
                    onValueChange={(v) => update("heart_rhythm", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sinus">Sinus</SelectItem>
                      <SelectItem value="Atrial Fibrillation">
                        Atrial Fibrillation
                      </SelectItem>
                      <SelectItem value="Not Known">Not Known</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Blood Pressure (mmHg)</Label>
                  <Input
                    placeholder="120/80"
                    value={editedData.blood_pressure}
                    onChange={(e) =>
                      update("blood_pressure", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label>NYHA Class</Label>
                <div className="mt-1 flex gap-2">
                  {["I", "II", "III", "IV"].map((cls) => (
                    <Button
                      key={cls}
                      type="button"
                      variant={
                        editedData.nyha_class === cls ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => update("nyha_class", cls)}
                    >
                      Class {cls}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LV Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4" />
                LV Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Ejection Fraction (%)</Label>
                  <Input
                    type="number"
                    value={editedData.ejection_fraction_pct}
                    onChange={(e) =>
                      update("ejection_fraction_pct", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Method</Label>
                  <Input
                    value={editedData.lv_assessment_method}
                    onChange={(e) =>
                      update("lv_assessment_method", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Assessment Date</Label>
                  <Input
                    type="date"
                    value={editedData.lv_assessment_date}
                    onChange={(e) =>
                      update("lv_assessment_date", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Labs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4" />
                Latest Labs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <Label>Potassium</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedData.potassium}
                    onChange={(e) => update("potassium", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sodium</Label>
                  <Input
                    type="number"
                    value={editedData.sodium}
                    onChange={(e) => update("sodium", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Urea</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedData.urea}
                    onChange={(e) => update("urea", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Creatinine</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedData.creatinine}
                    onChange={(e) => update("creatinine", e.target.value)}
                  />
                </div>
                <div>
                  <Label>eGFR</Label>
                  <Input
                    type="number"
                    value={editedData.egfr}
                    onChange={(e) => update("egfr", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4" />
                Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {editedData.medications.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Name</span>
                  <span>Dosage</span>
                  <span>Frequency</span>
                  <span className="w-8" />
                </div>
              )}
              {editedData.medications.map((med, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2"
                >
                  <Input
                    placeholder="Medication name"
                    value={med.name}
                    onChange={(e) => {
                      const meds = [...editedData.medications];
                      meds[i] = { ...meds[i], name: e.target.value };
                      update("medications", meds);
                    }}
                  />
                  <Input
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => {
                      const meds = [...editedData.medications];
                      meds[i] = { ...meds[i], dosage: e.target.value };
                      update("medications", meds);
                    }}
                  />
                  <Input
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={(e) => {
                      const meds = [...editedData.medications];
                      meds[i] = { ...meds[i], frequency: e.target.value };
                      update("medications", meds);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-8"
                    onClick={() => {
                      update(
                        "medications",
                        editedData.medications.filter((_, idx) => idx !== i)
                      );
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update("medications", [
                    ...editedData.medications,
                    { name: "", dosage: "", frequency: "" },
                  ])
                }
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Medication
              </Button>
            </CardContent>
          </Card>

          {/* Instructions & Follow-up */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Instructions & Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Patient-Specific Instructions</Label>
                <Textarea
                  rows={3}
                  value={editedData.patient_specific_instructions}
                  onChange={(e) =>
                    update("patient_specific_instructions", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Care Plan Notes</Label>
                <Textarea
                  rows={2}
                  value={editedData.care_plan_notes}
                  onChange={(e) =>
                    update("care_plan_notes", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={editedData.follow_up_date}
                    onChange={(e) =>
                      update("follow_up_date", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Follow-up Instructions</Label>
                  <Input
                    value={editedData.follow_up_instructions}
                    onChange={(e) =>
                      update("follow_up_instructions", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Care Pathway & Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <Label htmlFor="care_pathway">Care Pathway *</Label>
                <Select
                  value={editedData.care_pathway_id}
                  onValueChange={(v) => update("care_pathway_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a care pathway" />
                  </SelectTrigger>
                  <SelectContent>
                    {pathways.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirm}
                  disabled={
                    isSubmitting ||
                    !editedData.name ||
                    !editedData.care_pathway_id
                  }
                >
                  {isSubmitting ? "Creating..." : "Confirm & Create Patient"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== CONFIRM STEP ===== */}
      {currentStep === "confirm" && (
        <Card>
          <CardContent className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="font-medium">Patient created successfully!</p>
            <p className="text-sm text-muted-foreground">
              The patient will receive a magic link to begin their care
              pathway.
            </p>
            <div className="flex justify-center gap-2">
              {createdPatientId && (
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/patients/${createdPatientId}`)
                  }
                >
                  View Patient
                </Button>
              )}
              <Button onClick={() => router.push("/patients")}>
                Back to Patients
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
