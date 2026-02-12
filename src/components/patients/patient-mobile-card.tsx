import Link from "next/link";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/patients/progress-bar";
import type { PatientRow } from "@/components/patients/patient-table";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PatientMobileCards({ rows }: { rows: PatientRow[] }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 lg:hidden">
      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-(--ds-gray-500) dark:text-white/68">
          No patients match your filters.
        </p>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          className={`rounded-2xl border border-(--ds-gray-200) bg-(--ds-gray-0) p-4 dark:border-white/8 dark:bg-[#121826] ${
            row.isDisabled ? "opacity-35" : ""
          }`}
        >
          {/* Header: avatar + name */}
          <Link
            href={`/patients/${row.patientId}`}
            className="flex items-center gap-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-(--ds-gray-200) text-xs font-medium text-(--ds-gray-600) dark:bg-white/10 dark:text-white/68">
                {getInitials(row.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-(--ds-gray-700) dark:text-white/92">
              {row.name}
            </span>
          </Link>

          {/* Key/value grid */}
          <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div>
              <p className="text-xs text-(--ds-gray-400) dark:text-white/48">
                Date
              </p>
              <p className="text-(--ds-gray-600) dark:text-white/68">
                {row.date}
              </p>
            </div>
            <div>
              <p className="text-xs text-(--ds-gray-400) dark:text-white/48">
                Insurance
              </p>
              <p className="text-(--ds-gray-600) dark:text-white/68">
                {row.insurance}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-(--ds-gray-400) dark:text-white/48">
                Diagnosis
              </p>
              <p className="text-(--ds-gray-600) dark:text-white/68">
                {row.diagnosis}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <ProgressBar value={row.progress} />
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-(--ds-gray-200) pt-3 dark:border-white/8">
            <Link
              href={`/patients/${row.patientId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-(--ds-gray-100) text-(--ds-gray-500) transition-colors hover:bg-(--ds-gray-200) dark:bg-white/6 dark:text-white/68"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-(--ds-gray-100) text-(--ds-gray-500) transition-colors hover:bg-(--ds-danger-bg) hover:text-(--ds-danger) dark:bg-white/6 dark:text-white/68 dark:hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-(--ds-gray-400) transition-colors hover:text-(--ds-gray-700) dark:text-white/48">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
