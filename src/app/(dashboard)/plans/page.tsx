import { PlansContent } from "@/components/plans/plans-content";
import { getPlansPageData } from "@/lib/queries/plans";
import { getActiveIntegrationByProvider } from "@/lib/queries/integrations";
import { hasRole, requireViewer } from "@/lib/auth";
import {
  savePlanAction,
  sendCompletedPlansToTelegramAction,
  updatePlanStatusAction,
} from "@/lib/actions/plans";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";

type PlansPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    employeeId?: string;
    page?: string;
  }>;
};

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const viewer = await requireViewer();
  const filters = await searchParams;
  const [data, telegramConnection] = await Promise.all([
    getPlansPageData(viewer, filters),
    getActiveIntegrationByProvider("telegram"),
  ]);
  const canSendTelegram =
    Boolean(telegramConnection) &&
    (hasRole(viewer.role, ["admin", "manager"]) || hasSupabaseServiceRoleEnv());

  return (
    <PlansContent
      canSendTelegram={canSendTelegram}
      data={data}
      saveAction={savePlanAction}
      sendCompletedPlansToTelegramAction={sendCompletedPlansToTelegramAction}
      telegramConnection={telegramConnection}
      updateStatusAction={updatePlanStatusAction}
    />
  );
}
