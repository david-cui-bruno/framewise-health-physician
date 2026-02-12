import { Users, Calendar, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/patients/page-header";
import { AnalyticsChartCard } from "@/components/patients/analytics-chart-card";
import { KpiCard } from "@/components/patients/kpi-card";
import { PatientTabs } from "@/components/patients/patient-tabs";
import { TableToolbar } from "@/components/patients/table-toolbar";
import { PatientTable, type PatientRow } from "@/components/patients/patient-table";
import { PatientMobileCards } from "@/components/patients/patient-mobile-card";
import type {
  Patient,
  PatientCareAssignment,
  CarePathway,
  VideoProgress,
} from "@/types/database";

type AssignmentWithJoins = PatientCareAssignment & {
  patients: Patient | null;
  care_pathways: CarePathway | null;
};

interface PatientsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const { search, status } = await searchParams;
  const supabase = await createClient();

  const { data: physician } = await supabase
    .from("physicians")
    .select("id")
    .returns<{ id: string }[]>()
    .single();

  let query = supabase
    .from("patient_care_assignments")
    .select("*, patients(*), care_pathways(*)")
    .eq("physician_id", physician?.id ?? "");

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "completed") {
    query = query.eq("is_active", false);
  }

  const { data: assignments } = await query.returns<AssignmentWithJoins[]>();

  // Filter by search term
  let filtered = assignments ?? [];
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((a) =>
      a.patients?.display_name?.toLowerCase().includes(term)
    );
  }

  // Batch fetch video progress for computing completion %
  const patientIds = filtered.map((a) => a.patient_id).filter(Boolean);
  let videoProgressMap = new Map<string, VideoProgress[]>();

  if (patientIds.length > 0) {
    const { data: allVideoProgress } = await supabase
      .from("video_progress")
      .select("*")
      .in("patient_id", patientIds)
      .returns<VideoProgress[]>();

    for (const vp of allVideoProgress ?? []) {
      const existing = videoProgressMap.get(vp.patient_id) ?? [];
      existing.push(vp);
      videoProgressMap.set(vp.patient_id, existing);
    }
  }

  // Map assignments to PatientRow format
  const rows: PatientRow[] = filtered.map((assignment) => {
    const videos = videoProgressMap.get(assignment.patient_id) ?? [];
    const completedVideos = videos.filter((v) => v.is_completed).length;
    const totalVideos = videos.length;
    const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    // Deterministic fake insurance number from patient_id
    const idSuffix = assignment.patient_id.replace(/-/g, "").slice(-4).toUpperCase();

    return {
      id: assignment.id,
      patientId: assignment.patient_id,
      name: assignment.patients?.display_name ?? "Unknown Patient",
      date: assignment.patients?.discharge_date ?? "—",
      diagnosis: assignment.care_pathways?.name ?? "—",
      insurance: `INS-${idSuffix}`,
      progress,
      isDisabled: !assignment.is_active,
    };
  });

  return (
    <div className="min-h-screen bg-(--ds-gray-50) dark:bg-(--ds-gray-900)">
      <div className="mx-auto max-w-[1440px] space-y-6 p-6">
        {/* Page Header */}
        <PageHeader />

        {/* Top Grid: Analytics + KPIs */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          <AnalyticsChartCard className="md:col-span-2 lg:col-span-6" />
          <KpiCard
            icon={Users}
            label="Patients"
            value={String(filtered.length || 724)}
            className="lg:col-span-2"
          />
          <KpiCard
            icon={Calendar}
            label="Appointments"
            value="204"
            className="lg:col-span-2"
          />
          <KpiCard
            icon={Heart}
            label="Treatments"
            value="427"
            className="lg:col-span-2"
          />
        </div>

        {/* Tabs + Toolbar + Table */}
        <div className="rounded-2xl bg-(--ds-gray-0) shadow-(--ds-card-shadow) dark:bg-[#121826]">
          <PatientTabs />
          <TableToolbar />
          <PatientTable rows={rows} />
          <PatientMobileCards rows={rows} />
        </div>
      </div>
    </div>
  );
}
