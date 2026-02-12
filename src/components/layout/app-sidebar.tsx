"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Bell,
  Settings,
  LogOut,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitch } from "@/components/theme-switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Physician } from "@/types/database";

interface AppSidebarProps {
  physician: Physician | null;
}

const primaryNav = [
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Users, label: "Patients", href: "/patients" },
];

function NavIconButton({
  icon: Icon,
  label,
  href,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-150 ${
            isActive
              ? "bg-[var(--ds-primary-500)] text-white shadow-sm"
              : "text-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-primary-500)] dark:hover:bg-white/[0.06]"
          }`}
        >
          <Icon className="h-5 w-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({ physician }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const initials = physician?.name
    ? physician.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col items-center border-r border-[var(--ds-gray-200)] bg-[var(--ds-gray-0)] py-6 dark:border-white/[0.08] dark:bg-[var(--ds-gray-800)] lg:flex">
        {/* Brand mark */}
        <Link
          href="/"
          className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ds-primary-500)] text-white"
        >
          <Activity className="h-6 w-6" />
        </Link>

        {/* Primary nav */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {primaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <NavIconButton
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive}
              />
            );
          })}
        </nav>

        {/* Secondary / bottom nav */}
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--ds-gray-400)] transition-colors duration-150 hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-primary-500)] dark:hover:bg-white/[0.06]">
                <Bell className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              Notifications
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[var(--ds-gray-200)] transition-shadow hover:ring-[var(--ds-primary-500)] dark:ring-white/[0.08]">
                  <AvatarFallback className="bg-[var(--ds-gray-100)] text-xs font-medium text-[var(--ds-gray-600)] dark:bg-white/[0.06] dark:text-white/[0.68]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              {physician?.name ?? "Profile"}
            </TooltipContent>
          </Tooltip>

          <div className="my-2 h-px w-8 bg-[var(--ds-gray-200)] dark:bg-white/[0.08]" />

          <ThemeSwitch />

          <NavIconButton
            icon={Settings}
            label="Settings"
            href="/settings"
            isActive={pathname.startsWith("/settings")}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--ds-gray-400)] transition-colors duration-150 hover:bg-[var(--ds-danger-bg)] hover:text-[var(--ds-danger)] dark:hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-[var(--ds-gray-200)] bg-[var(--ds-gray-0)] dark:border-white/[0.08] dark:bg-[var(--ds-gray-800)] lg:hidden">
        {primaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 ${
                  isActive
                    ? "text-[var(--ds-primary-500)]"
                    : "text-[var(--ds-gray-400)]"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        <Link
          href="/settings"
          className={`flex flex-col items-center gap-1 px-3 py-1 ${
            pathname.startsWith("/settings")
              ? "text-[var(--ds-primary-500)]"
              : "text-[var(--ds-gray-400)]"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </nav>
    </TooltipProvider>
  );
}
