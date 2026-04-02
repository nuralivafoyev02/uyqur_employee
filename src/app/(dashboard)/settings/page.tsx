import { SettingsContent } from "@/components/settings/settings-content";
import { disconnectIntegrationAction, saveIntegrationAction } from "@/lib/actions/integrations";
import { requireViewer } from "@/lib/auth";
import { updateProfileAction } from "@/lib/actions/profile";
import { getActiveIntegrations } from "@/lib/queries/integrations";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawSection = Array.isArray(resolvedSearchParams?.section)
    ? resolvedSearchParams?.section[0]
    : resolvedSearchParams?.section;
  const initialSection =
    rawSection === "account" ||
    rawSection === "preferences" ||
    rawSection === "profile" ||
    rawSection === "integrations"
      ? rawSection
      : "account";
  const integrations = await getActiveIntegrations();

  return (
    <SettingsContent
      action={updateProfileAction}
      integrationAction={saveIntegrationAction}
      disconnectIntegrationAction={disconnectIntegrationAction}
      viewer={viewer}
      integrations={integrations}
      initialSection={initialSection}
    />
  );
}
