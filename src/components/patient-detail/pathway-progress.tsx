import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import type {
  PatientCareAssignment,
  CarePathway,
  VideoModule,
  VideoProgress,
} from "@/types/database";

interface PathwayProgressProps {
  assignment: PatientCareAssignment;
  pathway: CarePathway;
  videoModules: VideoModule[];
  videoProgress: VideoProgress[];
}

const moduleTypeLabels: Record<string, string> = {
  what_to_do: "What to Do",
  what_to_watch_for: "Watch For",
  what_if_wrong: "What If",
};

// Hardcoded demo modules when no real data exists
interface DemoModule {
  id: string;
  title: string;
  type: string;
  watchPct: number;
  watchCount: number;
  isCompleted: boolean;
  isHighlighted: boolean;
}

const DEMO_MODULES: DemoModule[] = [
  { id: "d1", title: "Welcome & Overview", type: "what_to_do", watchPct: 100, watchCount: 1, isCompleted: true, isHighlighted: false },
  { id: "d2", title: "Understanding Your Medications", type: "what_to_do", watchPct: 100, watchCount: 2, isCompleted: true, isHighlighted: false },
  { id: "d3", title: "Medication Safety", type: "what_to_watch_for", watchPct: 100, watchCount: 3, isCompleted: true, isHighlighted: true },
  { id: "d4", title: "Activity & Exercise Guidelines", type: "what_to_do", watchPct: 62, watchCount: 1, isCompleted: false, isHighlighted: false },
  { id: "d5", title: "When to Seek Help", type: "what_if_wrong", watchPct: 0, watchCount: 0, isCompleted: false, isHighlighted: false },
];

export function PathwayProgress({
  assignment,
  pathway,
  videoModules,
  videoProgress,
}: PathwayProgressProps) {
  const dayNumber = differenceInDays(new Date(), new Date(assignment.start_date)) + 1;
  const totalDays = pathway.duration_days;
  const progressPct = Math.min(Math.round((dayNumber / totalDays) * 100), 100);

  const useDemo = videoModules.length === 0;

  const progressMap = new Map(
    videoProgress.map((vp) => [vp.video_module_id, vp])
  );

  const completedCount = useDemo
    ? DEMO_MODULES.filter((m) => m.isCompleted).length
    : videoProgress.filter((vp) => vp.is_completed).length;

  const totalModules = useDemo ? DEMO_MODULES.length : videoModules.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pathway Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Day {Math.max(dayNumber, 1)} of {totalDays}
            </span>
            <span>
              {completedCount}/{totalModules} videos completed
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {useDemo
            ? DEMO_MODULES.map((demo) => (
                <div
                  key={demo.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                    demo.isHighlighted
                      ? "border-amber-300 bg-amber-50 border-l-4 border-l-amber-500"
                      : ""
                  }`}
                >
                  {demo.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                  ) : demo.watchPct > 0 ? (
                    <Circle className="h-4 w-4 shrink-0 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{demo.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {moduleTypeLabels[demo.type] ?? demo.type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {demo.watchPct}% watched
                      </span>
                      {demo.watchCount > 0 && (
                        <span className="text-muted-foreground">
                          ({demo.watchCount}x)
                        </span>
                      )}
                      {demo.isHighlighted && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          3x replayed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            : videoModules.map((mod) => {
                const vp = progressMap.get(mod.id);
                const watchPct = vp
                  ? Math.min(
                      Math.round(
                        (vp.furthest_position_seconds / mod.duration_seconds) *
                          100
                      ),
                      100
                    )
                  : 0;

                return (
                  <div
                    key={mod.id}
                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                  >
                    {vp?.is_completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{mod.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {moduleTypeLabels[mod.module_type] ?? mod.module_type}
                        </Badge>
                        <span className="text-muted-foreground">
                          {watchPct}% watched
                        </span>
                        {vp && vp.watch_count > 0 && (
                          <span className="text-muted-foreground">
                            ({vp.watch_count}x)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
