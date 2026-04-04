import { ReportsContent } from "@/components/reports/reports-content";
import { getReportsPageData } from "@/lib/queries/reports";
import { getActiveIntegrationByProvider } from "@/lib/queries/integrations";
import { hasRole, requireViewer } from "@/lib/auth";
import {
  deleteReportAction,
  saveReportAction,
  sendReportToTelegramAction,
} from "@/lib/actions/reports";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";

type ReportsPageProps = {
  searchParams: Promise<{
    date?: string;
    status?: string;
    employeeId?: string;
    page?: string;
    editorDate?: string;
    editorEmployeeId?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const viewer = await requireViewer();
  const filters = await searchParams;
  const [data, telegramConnection] = await Promise.all([
    getReportsPageData(viewer, filters),
    getActiveIntegrationByProvider("telegram"),
  ]);
  const canSendTelegram =
    Boolean(telegramConnection) &&
    (hasRole(viewer.role, ["admin", "manager"]) || hasSupabaseServiceRoleEnv());

  return (
    <ReportsContent
      data={data}
      action={saveReportAction}
      canSendTelegram={canSendTelegram}
      sendTelegramAction={sendReportToTelegramAction}
      deleteAction={deleteReportAction}
      telegramConnection={telegramConnection}
    />
  );
}
