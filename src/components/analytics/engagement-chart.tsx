"use client";

import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EngagementChartProps {
  data: {
    date: string;
    videoViews: number;
    quizCompletions: number;
  }[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-(--ds-gray-500) dark:text-white/68">
        No engagement data yet.
      </div>
    );
  }

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#E6EAF1";
  const labelColor = "#B7BFCD";

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => {
            const date = new Date(d);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: labelColor }}
          dy={8}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: labelColor }}
          dx={-8}
        />
        <Tooltip
          labelFormatter={(d) => new Date(String(d)).toLocaleDateString()}
          contentStyle={{
            backgroundColor: isDark ? "#121826" : "#FFFFFF",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E6EAF1"}`,
            borderRadius: "12px",
            fontSize: "12px",
            color: isDark ? "rgba(255,255,255,0.92)" : undefined,
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: labelColor }} />
        <Line
          type="monotone"
          dataKey="quizCompletions"
          name="Quiz Completions"
          stroke="var(--ds-primary-500)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="videoViews"
          name="Video Views"
          stroke="var(--ds-success)"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
