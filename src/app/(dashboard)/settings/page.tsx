import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { PracticeForm } from "@/components/settings/practice-form";
import { PathwaySelector } from "@/components/settings/pathway-selector";
import { NotificationToggles } from "@/components/settings/notification-toggles";
import type {
  Physician,
  CarePathway,
  PhysicianNotificationPrefs,
} from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: physician } = await supabase
    .from("physicians")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .returns<Physician[]>()
    .single();

  const [{ data: pathways }, { data: prefs }] = await Promise.all([
    supabase
      .from("care_pathways")
      .select("*")
      .eq("is_active", true)
      .returns<CarePathway[]>(),
    supabase
      .from("physician_notification_prefs")
      .select("*")
      .eq("physician_id", physician?.id ?? "")
      .returns<PhysicianNotificationPrefs[]>()
      .single(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="pathway">Default Pathway</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Physician Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {physician ? (
                <ProfileForm physician={physician} />
              ) : (
                <p className="text-muted-foreground">
                  No physician profile found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
            </CardHeader>
            <CardContent>
              {physician ? (
                <PracticeForm physician={physician} />
              ) : (
                <p className="text-muted-foreground">
                  No physician profile found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathway" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Care Pathway</CardTitle>
            </CardHeader>
            <CardContent>
              {physician ? (
                <PathwaySelector
                  physician={physician}
                  pathways={pathways ?? []}
                />
              ) : (
                <p className="text-muted-foreground">
                  No physician profile found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationToggles prefs={prefs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
