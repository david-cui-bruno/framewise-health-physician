"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const tabs = [
  { value: "all", label: "All", count: "724" },
  { value: "new", label: "New" },
  { value: "severe", label: "Severe" },
  { value: "average", label: "Average" },
  { value: "discharged", label: "Discharged" },
];

export function PatientTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const currentStatus = searchParams.get("status") ?? "all";

  function handleTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    startTransition(() => {
      router.push(`/patients?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-6 overflow-x-auto px-5 pt-5">
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTab(tab.value)}
            className={`flex shrink-0 items-center gap-2 pb-3 text-sm transition-colors ${
              isActive
                ? "font-semibold text-(--ds-gray-700) dark:text-white/92"
                : "font-medium text-(--ds-gray-500) hover:text-(--ds-gray-700) dark:text-white/68 dark:hover:text-white/92"
            }`}
          >
            {tab.label}
            {tab.count && isActive && (
              <span className="rounded-full bg-(--ds-primary-50) px-2.5 py-0.5 text-xs font-medium text-(--ds-primary-600) dark:bg-[rgba(96,165,250,0.18)] dark:text-(--ds-primary-300)">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
