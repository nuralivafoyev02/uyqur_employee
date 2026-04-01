import { ReportsContent } from "@/components/reports/reports-content";
import { getReportsPageData } from "@/lib/queries/reports";
import { requireViewer } from "@/lib/auth";
import { deleteReportAction, saveReportAction } from "@/lib/actions/reports";

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
  const data = await getReportsPageData(viewer, filters);

  return <ReportsContent data={data} action={saveReportAction} deleteAction={deleteReportAction} />;
}
