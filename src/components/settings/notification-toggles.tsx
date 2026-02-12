"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateNotificationPrefs } from "@/app/(dashboard)/settings/actions";
import type { PhysicianNotificationPrefs } from "@/types/database";

interface NotificationTogglesProps {
  prefs: PhysicianNotificationPrefs | null;
}

const defaults = {
  onboarding_complete: true,
  all_videos_complete: true,
  qa_concern: true,
};

export function NotificationToggles({ prefs }: NotificationTogglesProps) {
  const [onboardingComplete, setOnboardingComplete] = useState(
    prefs?.onboarding_complete ?? defaults.onboarding_complete
  );
  const [allVideosComplete, setAllVideosComplete] = useState(
    prefs?.all_videos_complete ?? defaults.all_videos_complete
  );
  const [qaConcern, setQaConcern] = useState(
    prefs?.qa_concern ?? defaults.qa_concern
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateNotificationPrefs({
      onboarding_complete: onboardingComplete,
      all_videos_complete: allVideosComplete,
      qa_concern: qaConcern,
    });

    setIsSaving(false);
    if ("error" in result && result.error) {
      const msg = Object.values(result.error).flat().join(", ");
      toast.error(msg);
    } else {
      toast.success("Notification preferences updated");
    }
  }

  const toggles = [
    {
      id: "onboarding",
      label: "Patient Onboarding Complete",
      description: "Notify when a patient finishes onboarding",
      checked: onboardingComplete,
      onChange: setOnboardingComplete,
    },
    {
      id: "videos",
      label: "All Videos Completed",
      description: "Notify when a patient watches all videos",
      checked: allVideosComplete,
      onChange: setAllVideosComplete,
    },
    {
      id: "qa",
      label: "Q&A Concerns",
      description: "Notify when a patient search returns no results",
      checked: qaConcern,
      onChange: setQaConcern,
    },
  ];

  return (
    <div className="space-y-6">
      {toggles.map((t) => (
        <div key={t.id} className="flex items-center justify-between">
          <div>
            <Label htmlFor={t.id}>{t.label}</Label>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>
          <Switch
            id={t.id}
            checked={t.checked}
            onCheckedChange={t.onChange}
          />
        </div>
      ))}
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
