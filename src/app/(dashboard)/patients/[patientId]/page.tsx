import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { PathwayProgress } from "@/components/patient-detail/pathway-progress";
import { QuizPerformance } from "@/components/patient-detail/quiz-performance";
import { EngagementTimeline } from "@/components/patient-detail/engagement-timeline";
import { FlaggedQA } from "@/components/patient-detail/flagged-qa";
import { AIInsights } from "@/components/patient-detail/ai-insights";
import type {
  Patient,
  PatientCareAssignment,
  CarePathway,
  VideoModule,
  VideoProgress,
  QuizQuestion,
  QuizResponse,
  QASearchLog,
} from "@/types/database";

type AssignmentWithPathway = PatientCareAssignment & {
  care_pathways: CarePathway | null;
};

interface PatientDetailPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { patientId } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .returns<Patient[]>()
    .single();

  if (!patient) {
    notFound();
  }

  const { data: assignment } = await supabase
    .from("patient_care_assignments")
    .select("*, care_pathways(*)")
    .eq("patient_id", patientId)
    .returns<AssignmentWithPathway[]>()
    .single();

  const pathwayId = assignment?.care_pathway_id;

  // Fetch all engagement data in parallel
  const [
    { data: videoModules },
    { data: videoProgress },
    { data: quizResponses },
    { data: quizQuestions },
    { data: searchLogs },
  ] = await Promise.all([
    pathwayId
      ? supabase
          .from("video_modules")
          .select("*")
          .eq("care_pathway_id", pathwayId)
          .eq("is_active", true)
          .order("sort_order")
          .returns<VideoModule[]>()
      : Promise.resolve({ data: [] as VideoModule[] }),
    supabase
      .from("video_progress")
      .select("*")
      .eq("patient_id", patientId)
      .returns<VideoProgress[]>(),
    supabase
      .from("quiz_responses")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .returns<QuizResponse[]>(),
    pathwayId
      ? supabase
          .from("quiz_questions")
          .select("*")
          .eq("is_active", true)
          .returns<QuizQuestion[]>()
      : Promise.resolve({ data: [] as QuizQuestion[] }),
    supabase
      .from("qa_search_log")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .returns<QASearchLog[]>(),
  ]);

  // Filter quiz questions to only those belonging to this pathway's modules
  const moduleIds = new Set((videoModules ?? []).map((m) => m.id));
  const filteredQuizQuestions = (quizQuestions ?? []).filter((q) =>
    moduleIds.has(q.video_module_id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {patient.display_name ?? "Patient"}
        </h1>
        <Badge variant={assignment?.is_active ? "default" : "secondary"}>
          {assignment?.is_active ? "Active" : "Completed"}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        {assignment?.care_pathways && (
          <span>Pathway: {assignment.care_pathways.name}</span>
        )}
        {patient.discharge_date && (
          <span className="ml-4">
            Discharged: {patient.discharge_date}
          </span>
        )}
      </div>

      <AIInsights />

      <div className="grid gap-6 md:grid-cols-2">
        {assignment && assignment.care_pathways ? (
          <PathwayProgress
            assignment={assignment}
            pathway={assignment.care_pathways}
            videoModules={videoModules ?? []}
            videoProgress={videoProgress ?? []}
          />
        ) : (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No care pathway assigned.
          </div>
        )}

        <QuizPerformance
          videoModules={videoModules ?? []}
          quizQuestions={filteredQuizQuestions}
          quizResponses={quizResponses ?? []}
        />

        <EngagementTimeline
          videoProgress={videoProgress ?? []}
          quizResponses={quizResponses ?? []}
          searchLogs={searchLogs ?? []}
        />

        <FlaggedQA searchLogs={searchLogs ?? []} />
      </div>
    </div>
  );
}
