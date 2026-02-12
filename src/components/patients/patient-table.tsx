"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/patients/progress-bar";

export interface PatientRow {
  id: string;
  patientId: string;
  name: string;
  date: string;
  diagnosis: string;
  insurance: string;
  progress: number;
  isDisabled?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ActionButton({
  icon: Icon,
  variant = "default",
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger";
  href?: string;
}) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-full transition-colors";
  const styles =
    variant === "danger"
      ? `${base} bg-(--ds-gray-100) text-(--ds-gray-500) hover:bg-(--ds-danger-bg) hover:text-(--ds-danger) dark:bg-white/6 dark:text-white/68 dark:hover:bg-red-500/10 dark:hover:text-red-400`
      : `${base} bg-(--ds-gray-100) text-(--ds-gray-500) hover:bg-(--ds-gray-200) hover:text-(--ds-gray-700) dark:bg-white/6 dark:text-white/68 dark:hover:bg-white/10 dark:hover:text-white/92`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        <Icon className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <button className={styles}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function PatientTable({ rows }: { rows: PatientRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  function toggleRow(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--ds-gray-200) dark:border-white/8">
              <th className="w-11 py-3 pl-5">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="py-3 pl-3 text-left text-xs font-medium uppercase tracking-wider text-(--ds-gray-400) dark:text-white/48">
                Full name
              </th>
              <th className="py-3 pl-3 text-left text-xs font-medium uppercase tracking-wider text-(--ds-gray-400) dark:text-white/48">
                Date
              </th>
              <th className="py-3 pl-3 text-left text-xs font-medium uppercase tracking-wider text-(--ds-gray-400) dark:text-white/48">
                Diagnosis
              </th>
              <th className="py-3 pl-3 text-left text-xs font-medium uppercase tracking-wider text-(--ds-gray-400) dark:text-white/48">
                Insurance number
              </th>
              <th className="w-[180px] py-3 pl-3 text-left text-xs font-medium uppercase tracking-wider text-(--ds-gray-400) dark:text-white/48">
                Progress
              </th>
              <th className="w-[140px] py-3 pr-5 text-right text-xs font-medium uppercase tracking-wider text-(--ds-gray-400) dark:text-white/48">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-(--ds-gray-200) transition-colors hover:bg-(--ds-gray-100) dark:border-white/8 dark:hover:bg-white/[0.04] ${
                  row.isDisabled ? "opacity-35" : ""
                }`}
              >
                <td className="py-3 pl-5">
                  <Checkbox
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggleRow(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                </td>
                <td className="py-3 pl-3">
                  <Link
                    href={`/patients/${row.patientId}`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-(--ds-gray-200) text-xs font-medium text-(--ds-gray-600) dark:bg-white/10 dark:text-white/68">
                        {getInitials(row.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-(--ds-gray-700) dark:text-white/92">
                      {row.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 pl-3 text-sm text-(--ds-gray-500) dark:text-white/68">
                  {row.date}
                </td>
                <td className="py-3 pl-3 text-sm text-(--ds-gray-500) dark:text-white/68">
                  {row.diagnosis}
                </td>
                <td className="py-3 pl-3 text-sm text-(--ds-gray-500) dark:text-white/68">
                  {row.insurance}
                </td>
                <td className="w-[180px] py-3 pl-3">
                  <ProgressBar value={row.progress} />
                </td>
                <td className="py-3 pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <ActionButton
                      icon={Pencil}
                      href={`/patients/${row.patientId}`}
                    />
                    <ActionButton icon={Trash2} variant="danger" />
                    <button className="flex h-9 w-9 items-center justify-center rounded-full text-(--ds-gray-400) transition-colors hover:text-(--ds-gray-700) dark:text-white/48 dark:hover:text-white/92">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-sm text-(--ds-gray-500) dark:text-white/68"
                >
                  No patients match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
