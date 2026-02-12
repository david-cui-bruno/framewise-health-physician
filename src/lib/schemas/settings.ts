import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  specialty: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const practiceSchema = z.object({
  practice_name: z.string().optional(),
  practice_address: z.string().optional(),
  practice_phone: z.string().optional(),
});

export type PracticeInput = z.infer<typeof practiceSchema>;

export const defaultPathwaySchema = z.object({
  default_pathway_id: z.string().uuid().nullable(),
});

export type DefaultPathwayInput = z.infer<typeof defaultPathwaySchema>;

export const notificationPrefsSchema = z.object({
  onboarding_complete: z.boolean(),
  all_videos_complete: z.boolean(),
  qa_concern: z.boolean(),
});

export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
