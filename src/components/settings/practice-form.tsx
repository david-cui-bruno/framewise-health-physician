"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePractice } from "@/app/(dashboard)/settings/actions";
import type { Physician } from "@/types/database";

interface PracticeFormProps {
  physician: Physician;
}

export function PracticeForm({ physician }: PracticeFormProps) {
  const [practiceName, setPracticeName] = useState(physician.practice_name ?? "");
  const [practiceAddress, setPracticeAddress] = useState(physician.practice_address ?? "");
  const [practicePhone, setPracticePhone] = useState(physician.practice_phone ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const result = await updatePractice({
      practice_name: practiceName || undefined,
      practice_address: practiceAddress || undefined,
      practice_phone: practicePhone || undefined,
    });

    setIsSaving(false);
    if ("error" in result && result.error) {
      const msg = Object.values(result.error).flat().join(", ");
      toast.error(msg);
    } else {
      toast.success("Practice info updated");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="practice-name">Practice Name</Label>
        <Input
          id="practice-name"
          value={practiceName}
          onChange={(e) => setPracticeName(e.target.value)}
          placeholder="e.g. Bay Area Orthopedics"
        />
      </div>
      <div>
        <Label htmlFor="practice-address">Address</Label>
        <Input
          id="practice-address"
          value={practiceAddress}
          onChange={(e) => setPracticeAddress(e.target.value)}
          placeholder="123 Main St, City, ST 12345"
        />
      </div>
      <div>
        <Label htmlFor="practice-phone">Phone</Label>
        <Input
          id="practice-phone"
          value={practicePhone}
          onChange={(e) => setPracticePhone(e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Practice Info"}
      </Button>
    </form>
  );
}
