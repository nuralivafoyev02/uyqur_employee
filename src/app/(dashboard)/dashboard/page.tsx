import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getDashboardData } from "@/lib/queries/dashboard";
import { hasRole, requireViewer } from "@/lib/auth";

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const data = await getDashboardData(viewer);
  const isLeadView = hasRole(viewer.role, ["admin", "manager"]);

  return <DashboardContent data={data} viewerName={viewer.full_name} isLeadView={isLeadView} />;
}
