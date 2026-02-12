import { createClient } from "@/lib/supabase/server";
import type { Physician } from "@/types/database";

export async function getCurrentPhysician(): Promise<Physician> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: physician, error } = await supabase
    .from("physicians")
    .select("*")
    .eq("user_id", user.id)
    .returns<Physician[]>()
    .single();

  if (error || !physician) {
    throw new Error("Physician profile not found");
  }

  return physician;
}
