interface TopSearchesProps {
  searches: {
    query: string;
    count: number;
    unresolved: number;
  }[];
  unresolvedCount: number;
}

export function TopSearches({ searches, unresolvedCount }: TopSearchesProps) {
  if (searches.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-(--ds-gray-500) dark:text-white/68">
        No search data yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unresolvedCount > 0 && (
        <div className="rounded-xl border border-(--ds-danger)/20 bg-(--ds-danger-bg) p-3 text-sm">
          <span className="font-medium text-(--ds-danger)">
            {unresolvedCount} unresolved
          </span>{" "}
          <span className="text-(--ds-gray-600) dark:text-white/68">
            patient searches returned no results
          </span>
        </div>
      )}

      <div className="space-y-2">
        {searches.map((s) => (
          <div
            key={s.query}
            className="flex items-center justify-between rounded-xl border border-(--ds-gray-200) p-3 text-sm dark:border-white/8"
          >
            <span className="min-w-0 truncate text-(--ds-gray-700) dark:text-white/92">
              &quot;{s.query}&quot;
            </span>
            <div className="flex shrink-0 items-center gap-2 pl-3">
              <span className="text-(--ds-gray-500) dark:text-white/68">
                {s.count}x
              </span>
              {s.unresolved > 0 && (
                <span className="rounded-full bg-(--ds-danger-bg) px-2.5 py-0.5 text-xs font-medium text-(--ds-danger)">
                  {s.unresolved} unresolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
