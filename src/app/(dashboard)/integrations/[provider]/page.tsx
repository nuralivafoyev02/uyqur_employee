import { notFound } from "next/navigation";

import { IntegrationPageContent } from "@/components/integrations/integration-page-content";
import {
  disconnectIntegrationAction,
  sendTelegramDigestAction,
  sendTelegramTestMessageAction,
} from "@/lib/actions/integrations";
import { sendCompletedPlansToTelegramAction } from "@/lib/actions/plans";
import { hasRole, requireViewer } from "@/lib/auth";
import {
  getActiveIntegrationByProvider,
  getTelegramDigestOverview,
} from "@/lib/queries/integrations";
import { getTodayCompletedPlansPreview } from "@/lib/queries/plans";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";

export default async function IntegrationPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const viewer = await requireViewer();
  const { provider } = await params;
  const connection = await getActiveIntegrationByProvider(provider);
  const canManageTelegram = hasRole(viewer.role, ["admin", "manager"]);
  const canSendPersonalCompletedPlans =
    Boolean(connection) &&
    (hasRole(viewer.role, ["admin", "manager"]) || hasSupabaseServiceRoleEnv());

  if (!connection) {
    notFound();
  }

  const [telegramDigestOverview, personalCompletedPlans] =
    connection.provider === "telegram"
      ? await Promise.all([
          canManageTelegram ? getTelegramDigestOverview() : Promise.resolve(null),
          getTodayCompletedPlansPreview(viewer),
        ])
      : [null, null];

  return (
    <IntegrationPageContent
      canManageTelegram={canManageTelegram}
      canSendPersonalCompletedPlans={canSendPersonalCompletedPlans}
      connection={connection}
      disconnectAction={disconnectIntegrationAction}
      personalCompletedPlans={personalCompletedPlans}
      sendCompletedPlansToTelegramAction={sendCompletedPlansToTelegramAction}
      sendTelegramDigestAction={sendTelegramDigestAction}
      sendTelegramTestAction={sendTelegramTestMessageAction}
      telegramDigestOverview={telegramDigestOverview}
    />
  );
}
