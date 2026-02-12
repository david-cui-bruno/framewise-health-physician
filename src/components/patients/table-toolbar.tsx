import { Upload, Download, SlidersHorizontal } from "lucide-react";

function GhostButton({
  children,
  icon: Icon,
  iconPosition = "left",
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
}) {
  return (
    <button className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-(--ds-gray-500) transition-colors hover:bg-(--ds-gray-100) hover:text-(--ds-gray-700) dark:text-white/68 dark:hover:bg-white/6 dark:hover:text-white/92">
      {iconPosition === "left" && <Icon className="h-4 w-4" />}
      {children}
      {iconPosition === "right" && <Icon className="h-4 w-4" />}
    </button>
  );
}

export function TableToolbar() {
  return (
    <div className="flex items-center justify-between border-b border-(--ds-gray-200) px-5 py-3 dark:border-white/8">
      <div className="flex items-center gap-1">
        <GhostButton icon={Upload}>Export</GhostButton>
        <GhostButton icon={Download}>Import</GhostButton>
      </div>
      <GhostButton icon={SlidersHorizontal} iconPosition="right">
        Sort by
      </GhostButton>
    </div>
  );
}
