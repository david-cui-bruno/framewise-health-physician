"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import type { Physician } from "@/types/database";

interface ProfileFormProps {
  physician: Physician;
}

export function ProfileForm({ physician }: ProfileFormProps) {
  const [name, setName] = useState(physician.name);
  const [email, setEmail] = useState(physician.email);
  const [specialty, setSpecialty] = useState(physician.specialty ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateProfile({ name, email, specialty: specialty || undefined });

    setIsSaving(false);
    if ("error" in result && result.error) {
      const msg = Object.values(result.error).flat().join(", ");
      toast.error(msg);
    } else {
      toast.success("Profile updated");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="profile-specialty">Specialty</Label>
        <Input
          id="profile-specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="e.g. Orthopedic Surgery"
        />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
