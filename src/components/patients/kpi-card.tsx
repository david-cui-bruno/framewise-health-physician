import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}

export function KpiCard({ icon: Icon, label, value, className = "" }: KpiCardProps) {
  return (
    <div
      className={`rounded-3xl bg-(--ds-gray-0) p-5 shadow-(--ds-card-shadow) transition-shadow hover:shadow-(--ds-card-shadow-hover) dark:bg-[#121826] ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-(--ds-gray-100) dark:bg-white/6">
          <Icon className="h-5 w-5 text-(--ds-gray-500) dark:text-white/68" />
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-(--ds-primary-500) text-white transition-colors hover:bg-(--ds-primary-600)">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-4 text-[44px] font-semibold leading-[52px] tracking-tight text-(--ds-gray-700) dark:text-white/92">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-(--ds-gray-500) dark:text-white/68">
        {label}
      </p>
    </div>
  );
}
