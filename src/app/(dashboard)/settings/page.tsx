import { SettingsContent } from "@/components/settings/settings-content";
import { requireViewer } from "@/lib/auth";
import { updateProfileAction } from "@/lib/actions/profile";

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
    rawSection === "account" || rawSection === "preferences" || rawSection === "profile"
      ? rawSection
      : "account";

  return (
    <SettingsContent
      action={updateProfileAction}
      viewer={viewer}
      initialSection={initialSection}
    />
  );
}
