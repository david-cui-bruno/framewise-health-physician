"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPhysician } from "@/lib/queries/physician";
import {
  profileSchema,
  practiceSchema,
  defaultPathwaySchema,
  notificationPrefsSchema,
  type ProfileInput,
  type PracticeInput,
  type DefaultPathwayInput,
  type NotificationPrefsInput,
} from "@/lib/schemas/settings";

// Note: Supabase Database interface without Relationships causes `never` on insert/update.
// We cast query builders via `as any` after validating shape with Zod.

export async function updateProfile(input: ProfileInput) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const physician = await getCurrentPhysician();
  const supabase = await createClient();

  const { error } = await (supabase.from("physicians") as any)
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      specialty: parsed.data.specialty || null,
    })
    .eq("id", physician.id);

  if (error) return { error: { name: [error.message] } };

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePractice(input: PracticeInput) {
  const parsed = practiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const physician = await getCurrentPhysician();
  const supabase = await createClient();

  const { error } = await (supabase.from("physicians") as any)
    .update({
      practice_name: parsed.data.practice_name || null,
      practice_address: parsed.data.practice_address || null,
      practice_phone: parsed.data.practice_phone || null,
    })
    .eq("id", physician.id);

  if (error) return { error: { practice_name: [error.message] } };

  revalidatePath("/settings");
  return { success: true };
}

export async function updateDefaultPathway(input: DefaultPathwayInput) {
  const parsed = defaultPathwaySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const physician = await getCurrentPhysician();
  const supabase = await createClient();

  const { error } = await (supabase.from("physicians") as any)
    .update({ default_pathway_id: parsed.data.default_pathway_id })
    .eq("id", physician.id);

  if (error) return { error: { default_pathway_id: [error.message] } };

  revalidatePath("/settings");
  return { success: true };
}

export async function updateNotificationPrefs(input: NotificationPrefsInput) {
  const parsed = notificationPrefsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const physician = await getCurrentPhysician();
  const supabase = await createClient();

  const { error } = await (supabase.from("physician_notification_prefs") as any)
    .upsert(
      {
        physician_id: physician.id,
        onboarding_complete: parsed.data.onboarding_complete,
        all_videos_complete: parsed.data.all_videos_complete,
        qa_concern: parsed.data.qa_concern,
      },
      { onConflict: "physician_id" }
    );

  if (error) return { error: { onboarding_complete: [error.message] } };

  revalidatePath("/settings");
  return { success: true };
}
