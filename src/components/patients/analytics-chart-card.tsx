"use client";

import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DEMO_DATA = [
  { month: "Jan", patients: 12 },
  { month: "Feb", patients: 19 },
  { month: "March", patients: 15 },
  { month: "Apr", patients: 28 },
  { month: "May", patients: 24 },
  { month: "Jun", patients: 35 },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl bg-(--ds-gray-0) px-4 py-3 shadow-(--ds-card-shadow) dark:bg-[#121826]">
      <p className="text-2xl font-semibold text-(--ds-gray-700) dark:text-white/92">
        426
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="rounded-full bg-(--ds-primary-50) px-2.5 py-0.5 text-xs font-medium text-(--ds-primary-600) dark:bg-[rgba(96,165,250,0.18)] dark:text-(--ds-primary-300)">
          +5.4%
        </span>
        <span className="text-xs text-(--ds-gray-500) dark:text-white/68">
          Last 6 months
        </span>
      </div>
    </div>
  );
}

export function AnalyticsChartCard({ className = "" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#E6EAF1";
  const labelColor = "#B7BFCD";

  return (
    <div
      className={`rounded-3xl bg-(--ds-gray-0) p-5 shadow-(--ds-card-shadow) dark:bg-[#121826] ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-(--ds-gray-700) dark:text-white/92">
          Analytics
        </h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-(--ds-gray-50) px-3 py-1.5 text-xs font-medium text-(--ds-gray-700) dark:bg-white/6 dark:text-white/92">
            <span className="h-1.5 w-1.5 rounded-full bg-(--ds-primary-500)" />
            Patients
          </span>
          <span className="flex items-center gap-1 rounded-full bg-(--ds-gray-50) px-3 py-1.5 text-xs font-medium text-(--ds-gray-500) dark:bg-white/6 dark:text-white/68">
            Last 6 months
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={DEMO_DATA}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDark ? "rgba(96,165,250,0.20)" : "rgba(67,140,242,0.22)"}
              />
              <stop
                offset="100%"
                stopColor={isDark ? "rgba(96,165,250,0.00)" : "rgba(67,140,242,0.00)"}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeDasharray="" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: labelColor }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: labelColor }}
            dx={-8}
            domain={[0, 40]}
            ticks={[0, 10, 20, 30, 40]}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="patients"
            stroke="var(--ds-primary-500)"
            strokeWidth={3}
            fill="url(#chartGradient)"
            activeDot={{
              r: 7,
              stroke: "var(--ds-primary-500)",
              strokeWidth: 3,
              fill: isDark ? "#121826" : "#FFFFFF",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
