"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search, Plus } from "lucide-react";

export function PageHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const currentSearch = searchParams.get("search") ?? "";

  function handleSearchChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.push(`/patients?${params.toString()}`);
      });
    }, 300);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-4xl font-semibold tracking-tight text-(--ds-gray-700) dark:text-white/92">
        Patients
      </h1>

      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-[340px]">
          <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-(--ds-gray-400)" />
          <input
            type="text"
            placeholder="Search"
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-(--ds-gray-200) bg-(--ds-gray-0) pl-10 pr-4 text-sm text-(--ds-gray-700) placeholder:text-(--ds-gray-400) transition-shadow focus:outline-none focus:shadow-(--ds-focus-ring) dark:border-white/8 dark:bg-[#121826] dark:text-white/92 dark:placeholder:text-white/48"
          />
        </div>

        {/* Add new button — full on md+, icon-only on mobile */}
        <Link href="/scanner" className="shrink-0">
          <button className="hidden h-11 items-center gap-2.5 rounded-xl bg-(--ds-primary-500) px-4 text-sm font-medium text-white transition-colors hover:bg-(--ds-primary-600) md:flex">
            Add new
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Plus className="h-4 w-4" />
            </span>
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-(--ds-primary-500) text-white transition-colors hover:bg-(--ds-primary-600) md:hidden">
            <Plus className="h-5 w-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
