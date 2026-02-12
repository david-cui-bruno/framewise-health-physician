import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { QASearchLog } from "@/types/database";

interface FlaggedQAProps {
  searchLogs: QASearchLog[];
}

export function FlaggedQA({ searchLogs }: FlaggedQAProps) {
  const flagged = searchLogs.filter((log) => log.results_returned === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flagged Q&A Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {flagged.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No flagged searches. All patient questions returned results.
          </p>
        ) : (
          <div className="space-y-3">
            {flagged.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium">&quot;{log.search_query}&quot;</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
