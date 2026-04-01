import { SettingsContent } from "@/components/settings/settings-content";
import { requireViewer } from "@/lib/auth";
import { updateProfileAction } from "@/lib/actions/profile";

export default async function SettingsPage() {
  const viewer = await requireViewer();

  return <SettingsContent action={updateProfileAction} viewer={viewer} />;
}
