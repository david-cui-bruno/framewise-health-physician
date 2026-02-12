import { createClient } from "@/lib/supabase/server";
import { getCurrentPhysician } from "@/lib/queries/physician";
import {
  getPatientStats,
  getAvgVideoCompletion,
  getAvgQuizScore,
  getEngagementOverTime,
  getTopSearches,
} from "@/lib/queries/analytics";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { TopSearches } from "@/components/analytics/top-searches";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const physician = await getCurrentPhysician();

  const [stats, avgVideoCompletion, avgQuizScore, engagementData, searchData] =
    await Promise.all([
      getPatientStats(supabase, physician.id),
      getAvgVideoCompletion(supabase, physician.id),
      getAvgQuizScore(supabase, physician.id),
      getEngagementOverTime(supabase, physician.id),
      getTopSearches(supabase, physician.id),
    ]);

  const statCards = [
    {
      title: "Total Patients",
      value: stats.total.toString(),
      sub: `${stats.active} active, ${stats.completed} completed`,
    },
    {
      title: "Avg Video Completion",
      value: `${avgVideoCompletion}%`,
      sub: "across all patients",
    },
    {
      title: "Avg Quiz Score",
      value: `${avgQuizScore}%`,
      sub: "correct answers",
    },
    {
      title: "Unresolved Questions",
      value: searchData.unresolvedCount.toString(),
      sub: "patient searches with no results",
    },
  ];

  return (
    <div className="min-h-screen bg-(--ds-gray-50) dark:bg-(--ds-gray-900)">
      <div className="mx-auto max-w-[1440px] space-y-6 p-6">
        <h1 className="text-4xl font-semibold tracking-tight text-(--ds-gray-700) dark:text-white/92">
          Analytics
        </h1>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="rounded-3xl bg-(--ds-gray-0) p-5 shadow-(--ds-card-shadow) dark:bg-[#121826]"
            >
              <p className="text-sm font-medium text-(--ds-gray-400) dark:text-white/48">
                {stat.title}
              </p>
              <p className="mt-2 text-[44px] font-semibold leading-[52px] tracking-tight text-(--ds-gray-700) dark:text-white/92">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-(--ds-gray-500) dark:text-white/68">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-(--ds-gray-0) p-5 shadow-(--ds-card-shadow) dark:bg-[#121826]">
            <h3 className="mb-4 text-sm font-medium text-(--ds-gray-700) dark:text-white/92">
              Engagement Over Time
            </h3>
            <EngagementChart data={engagementData} />
          </div>

          <div className="rounded-3xl bg-(--ds-gray-0) p-5 shadow-(--ds-card-shadow) dark:bg-[#121826]">
            <h3 className="mb-4 text-sm font-medium text-(--ds-gray-700) dark:text-white/92">
              Top Q&A Searches
            </h3>
            <TopSearches
              searches={searchData.searches}
              unresolvedCount={searchData.unresolvedCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
