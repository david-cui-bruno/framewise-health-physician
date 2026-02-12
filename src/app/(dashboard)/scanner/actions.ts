"use server";

import { revalidatePath } from "next/cache";
import { getCurrentPhysician } from "@/lib/queries/physician";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { confirmPatientSchema, type ConfirmPatientInput } from "@/lib/schemas/scanner";

// Note: Supabase Database interface without Relationships causes `never` on insert/update.
// We cast query builders via `as any` after validating shape with Zod.

export async function confirmAndCreatePatient(input: ConfirmPatientInput) {
  console.log("[server action] input:", JSON.stringify(input, null, 2));
  const parsed = confirmPatientSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[server action] validation failed:", JSON.stringify(parsed.error.flatten().fieldErrors));
    return { error: parsed.error.flatten().fieldErrors };
  }
  console.log("[server action] validation passed, proceeding...");

  const data = parsed.data;
  const physician = await getCurrentPhysician();
  const admin = createAdminClient();
  const supabase = await createClient();

  // Generate a unique email for the auth user (email is hidden from the form)
  const uniqueEmail = data.email || `patient-${Date.now()}@framewise.health`;

  // Create auth user for the patient
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: uniqueEmail,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { error: { email: [authError?.message ?? "Failed to create user account"] } };
  }

  const patientId = authUser.user.id;

  // Insert patient row (admin bypasses RLS — physician can't insert into patients table)
  const { error: patientError } = await (admin.from("patients") as any).insert({
    id: patientId,
    email: uniqueEmail,
    display_name: data.name,
    discharge_date: data.discharge_date || null,
    medications: data.medications,
    restrictions: data.restrictions || null,
    follow_up_date: data.follow_up_date || null,
  });

  if (patientError) {
    return { error: { name: [patientError.message] } };
  }

  // Create care assignment
  const { error: assignmentError } = await (
    admin.from("patient_care_assignments") as any
  ).insert({
    patient_id: patientId,
    care_pathway_id: data.care_pathway_id,
    physician_id: physician.id,
  });

  if (assignmentError) {
    return { error: { care_pathway_id: [assignmentError.message] } };
  }

  // Update scan status and store final clinical data
  if (data.scan_id) {
    await (admin.from("discharge_scans") as any)
      .update({
        status: "confirmed",
        ...(data.clinical_data ? { extracted_data: data.clinical_data } : {}),
      })
      .eq("id", data.scan_id);
  }

  revalidatePath("/patients");

  return { patientId };
}
