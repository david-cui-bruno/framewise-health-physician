import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  CheckCircle2,
  HelpCircle,
  Search,
  AlertTriangle,
} from "lucide-react";
import type {
  VideoProgress,
  QuizResponse,
  QASearchLog,
} from "@/types/database";

interface EngagementTimelineProps {
  videoProgress: VideoProgress[];
  quizResponses: QuizResponse[];
  searchLogs: QASearchLog[];
}

interface TimelineEvent {
  id: string;
  type: "video_start" | "video_complete" | "quiz" | "search" | "search_unresolved";
  label: string;
  timestamp: string;
}

// Hardcoded demo events for when no real data exists
function getDemoEvents(): TimelineEvent[] {
  const now = Date.now();
  const hour = 3600000;
  return [
    { id: "demo-1", type: "video_start", label: "Started watching Welcome & Overview", timestamp: new Date(now - 47 * hour).toISOString() },
    { id: "demo-2", type: "video_complete", label: "Completed Welcome & Overview", timestamp: new Date(now - 46 * hour).toISOString() },
    { id: "demo-3", type: "quiz", label: "Quiz: correct answer — Welcome & Overview", timestamp: new Date(now - 45.5 * hour).toISOString() },
    { id: "demo-4", type: "video_start", label: "Started watching Understanding Your Medications", timestamp: new Date(now - 30 * hour).toISOString() },
    { id: "demo-5", type: "video_complete", label: "Completed Understanding Your Medications", timestamp: new Date(now - 29 * hour).toISOString() },
    { id: "demo-6", type: "quiz", label: "Quiz: correct answer — Understanding Your Medications", timestamp: new Date(now - 28.5 * hour).toISOString() },
    { id: "demo-7", type: "video_start", label: "Started watching Medication Safety", timestamp: new Date(now - 8 * hour).toISOString() },
    { id: "demo-8", type: "video_complete", label: "Replayed Medication Safety (2nd time)", timestamp: new Date(now - 5 * hour).toISOString() },
    { id: "demo-9", type: "video_complete", label: "Replayed Medication Safety (3rd time)", timestamp: new Date(now - 2 * hour).toISOString() },
    { id: "demo-10", type: "search", label: "Searched: \"what does low blood pressure mean\"", timestamp: new Date(now - 1.5 * hour).toISOString() },
    { id: "demo-11", type: "quiz", label: "Quiz: incorrect answer — Medication Safety", timestamp: new Date(now - 1 * hour).toISOString() },
    { id: "demo-12", type: "video_start", label: "Started watching Activity & Exercise Guidelines", timestamp: new Date(now - 0.5 * hour).toISOString() },
  ];
}

export function EngagementTimeline({
  videoProgress,
  quizResponses,
  searchLogs,
}: EngagementTimelineProps) {
  const isEmpty =
    videoProgress.length === 0 &&
    quizResponses.length === 0 &&
    searchLogs.length === 0;

  const events: TimelineEvent[] = [];

  if (isEmpty) {
    events.push(...getDemoEvents());
  } else {
    for (const vp of videoProgress) {
      if (vp.first_watched_at) {
        events.push({
          id: `vp-start-${vp.id}`,
          type: "video_start",
          label: "Started watching a video",
          timestamp: vp.first_watched_at,
        });
      }
      if (vp.completed_at) {
        events.push({
          id: `vp-done-${vp.id}`,
          type: "video_complete",
          label: "Completed a video",
          timestamp: vp.completed_at,
        });
      }
    }

    for (const qr of quizResponses) {
      events.push({
        id: `qr-${qr.id}`,
        type: "quiz",
        label: qr.is_correct ? "Quiz: correct answer" : "Quiz: incorrect answer",
        timestamp: qr.created_at,
      });
    }

    for (const sl of searchLogs) {
      events.push({
        id: `sl-${sl.id}`,
        type: sl.results_returned === 0 ? "search_unresolved" : "search",
        label:
          sl.results_returned === 0
            ? `Unresolved search: "${sl.search_query}"`
            : `Searched: "${sl.search_query}"`,
        timestamp: sl.created_at,
      });
    }
  }

  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const recentEvents = events.slice(0, 20);

  const iconMap = {
    video_start: <Play className="h-3.5 w-3.5" />,
    video_complete: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
    quiz: <HelpCircle className="h-3.5 w-3.5 text-blue-600" />,
    search: <Search className="h-3.5 w-3.5" />,
    search_unresolved: <AlertTriangle className="h-3.5 w-3.5 text-red-600" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5">{iconMap[event.type]}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {event.type === "search_unresolved" && (
                  <Badge variant="destructive" className="text-xs">
                    Unresolved
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
