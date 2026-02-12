import { z } from "zod";

// Matches the clinical data extracted from discharge packets
export const extractedDataSchema = z.object({
  patient_name: z.string().nullable().optional(),
  discharge_date: z.string().nullable().optional(),

  // Clinical Assessment
  weight_admission_kg: z.number().nullable().optional(),
  weight_discharge_kg: z.number().nullable().optional(),
  resting_heart_rate_bpm: z.number().nullable().optional(),
  heart_rhythm: z.string().nullable().optional(), // "Sinus", "Atrial Fibrillation", "Not Known"
  blood_pressure: z.string().nullable().optional(), // e.g. "118/72"
  nyha_class: z.string().nullable().optional(), // "I", "II", "III", "IV"

  // LV Assessment
  ejection_fraction_pct: z.number().nullable().optional(), // e.g. 35
  lv_assessment_method: z.string().nullable().optional(), // e.g. "echocardiogram"
  lv_assessment_date: z.string().nullable().optional(),

  // Labs
  potassium: z.number().nullable().optional(),
  sodium: z.number().nullable().optional(),
  urea: z.number().nullable().optional(),
  creatinine: z.number().nullable().optional(),
  egfr: z.number().nullable().optional(),

  // Medications
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
      })
    )
    .optional(),

  // Instructions & Restrictions
  patient_specific_instructions: z.string().nullable().optional(),
  care_plan_notes: z.string().nullable().optional(),
  follow_up_date: z.string().nullable().optional(),
  follow_up_instructions: z.string().nullable().optional(),

  // Diagnosis (general)
  diagnosis: z.string().nullable().optional(),
});

export type ExtractedData = z.infer<typeof extractedDataSchema>;

export const confirmPatientSchema = z.object({
  scan_id: z.string().optional(),
  name: z.string().min(1, "Patient name is required"),
  email: z.string().optional(),
  discharge_date: z.string().optional(),
  diagnosis: z.string().optional(),
  medications: z.array(z.string()).default([]),
  restrictions: z.string().optional(),
  follow_up_date: z.string().optional(),
  care_pathway_id: z.string().min(1, "Care pathway is required"),
  clinical_data: z.record(z.string(), z.unknown()).optional(),
});

export type ConfirmPatientInput = z.infer<typeof confirmPatientSchema>;
