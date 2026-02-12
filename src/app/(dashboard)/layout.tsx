import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: physician } = await supabase
    .from("physicians")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-(--ds-gray-50) dark:bg-(--ds-gray-900)">
      <AppSidebar physician={physician} />
      <main className="pb-20 lg:ml-[88px] lg:pb-0">{children}</main>
    </div>
  );
}
