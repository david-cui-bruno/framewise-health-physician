"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateDefaultPathway } from "@/app/(dashboard)/settings/actions";
import type { CarePathway, Physician } from "@/types/database";

interface PathwaySelectorProps {
  physician: Physician;
  pathways: CarePathway[];
}

export function PathwaySelector({ physician, pathways }: PathwaySelectorProps) {
  const [selected, setSelected] = useState(physician.default_pathway_id ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateDefaultPathway({
      default_pathway_id: selected || null,
    });

    setIsSaving(false);
    if ("error" in result && result.error) {
      const msg = Object.values(result.error).flat().join(", ");
      toast.error(msg);
    } else {
      toast.success("Default pathway updated");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Default Care Pathway</Label>
        <p className="mb-2 text-sm text-muted-foreground">
          New patients will be assigned this pathway by default.
        </p>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Select a pathway" />
          </SelectTrigger>
          <SelectContent>
            {pathways.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.duration_days} days)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Default Pathway"}
      </Button>
    </div>
  );
}
