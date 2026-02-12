interface ProgressBarProps {
  value: number;
}

function getColor(value: number) {
  if (value >= 80) return "bg-(--ds-success)";
  if (value >= 50) return "bg-(--ds-info)";
  return "bg-(--ds-warning)";
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-(--ds-gray-200) dark:bg-white/10">
        <div
          className={`h-1.5 rounded-full transition-all ${getColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-9 text-right text-sm font-medium text-(--ds-gray-500) dark:text-white/68">
        {clamped}%
      </span>
    </div>
  );
}
