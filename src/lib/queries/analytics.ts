import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  VideoProgress,
  QuizResponse,
  QASearchLog,
} from "@/types/database";

type Client = SupabaseClient<Database>;

async function getPhysicianPatientIds(
  supabase: Client,
  physicianId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("patient_care_assignments")
    .select("patient_id")
    .eq("physician_id", physicianId)
    .returns<{ patient_id: string }[]>();
  return data?.map((a) => a.patient_id) ?? [];
}

export async function getPatientStats(
  supabase: Client,
  physicianId: string
) {
  const { data: assignments } = await supabase
    .from("patient_care_assignments")
    .select("id, is_active")
    .eq("physician_id", physicianId)
    .returns<{ id: string; is_active: boolean }[]>();

  const total = assignments?.length ?? 0;
  const active = assignments?.filter((a) => a.is_active).length ?? 0;
  const completed = total - active;

  return { total, active, completed };
}

export async function getAvgVideoCompletion(
  supabase: Client,
  physicianId: string
) {
  const patientIds = await getPhysicianPatientIds(supabase, physicianId);
  if (patientIds.length === 0) return 0;

  const { data: progress } = await supabase
    .from("video_progress")
    .select("furthest_position_seconds, video_module_id")
    .in("patient_id", patientIds)
    .returns<Pick<VideoProgress, "furthest_position_seconds" | "video_module_id">[]>();

  if (!progress || progress.length === 0) return 0;

  const moduleIds = [...new Set(progress.map((p) => p.video_module_id))];
  const { data: modules } = await supabase
    .from("video_modules")
    .select("id, duration_seconds")
    .in("id", moduleIds)
    .returns<{ id: string; duration_seconds: number }[]>();

  const durationMap = new Map(modules?.map((m) => [m.id, m.duration_seconds]) ?? []);

  let totalPct = 0;
  for (const p of progress) {
    const duration = durationMap.get(p.video_module_id) ?? 1;
    totalPct += Math.min(p.furthest_position_seconds / duration, 1);
  }

  return Math.round((totalPct / progress.length) * 100);
}

export async function getAvgQuizScore(
  supabase: Client,
  physicianId: string
) {
  const patientIds = await getPhysicianPatientIds(supabase, physicianId);
  if (patientIds.length === 0) return 0;

  const { data: responses } = await supabase
    .from("quiz_responses")
    .select("is_correct")
    .in("patient_id", patientIds)
    .returns<Pick<QuizResponse, "is_correct">[]>();

  if (!responses || responses.length === 0) return 0;

  const correct = responses.filter((r) => r.is_correct).length;
  return Math.round((correct / responses.length) * 100);
}

export async function getEngagementOverTime(
  supabase: Client,
  physicianId: string
) {
  const patientIds = await getPhysicianPatientIds(supabase, physicianId);
  if (patientIds.length === 0) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  const [{ data: videoProgress }, { data: quizResponses }] = await Promise.all([
    supabase
      .from("video_progress")
      .select("first_watched_at")
      .in("patient_id", patientIds)
      .gte("first_watched_at", since)
      .returns<{ first_watched_at: string | null }[]>(),
    supabase
      .from("quiz_responses")
      .select("created_at")
      .in("patient_id", patientIds)
      .gte("created_at", since)
      .returns<{ created_at: string }[]>(),
  ]);

  const dayMap = new Map<string, { videoViews: number; quizCompletions: number }>();

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    dayMap.set(key, { videoViews: 0, quizCompletions: 0 });
  }

  for (const vp of videoProgress ?? []) {
    if (!vp.first_watched_at) continue;
    const key = vp.first_watched_at.split("T")[0];
    const entry = dayMap.get(key);
    if (entry) entry.videoViews++;
  }

  for (const qr of quizResponses ?? []) {
    const key = qr.created_at.split("T")[0];
    const entry = dayMap.get(key);
    if (entry) entry.quizCompletions++;
  }

  return Array.from(dayMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));
}

export async function getTopSearches(
  supabase: Client,
  physicianId: string
) {
  const patientIds = await getPhysicianPatientIds(supabase, physicianId);
  if (patientIds.length === 0) return { searches: [], unresolvedCount: 0 };

  const { data: logs } = await supabase
    .from("qa_search_log")
    .select("search_query, results_returned")
    .in("patient_id", patientIds)
    .returns<Pick<QASearchLog, "search_query" | "results_returned">[]>();

  if (!logs || logs.length === 0) return { searches: [], unresolvedCount: 0 };

  const queryCount = new Map<string, { count: number; unresolved: number }>();
  for (const log of logs) {
    const q = log.search_query.toLowerCase().trim();
    const existing = queryCount.get(q) ?? { count: 0, unresolved: 0 };
    existing.count++;
    if (log.results_returned === 0) existing.unresolved++;
    queryCount.set(q, existing);
  }

  const searches = Array.from(queryCount.entries())
    .map(([query, { count, unresolved }]) => ({ query, count, unresolved }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const unresolvedCount = logs.filter((l) => l.results_returned === 0).length;

  return { searches, unresolvedCount };
}
