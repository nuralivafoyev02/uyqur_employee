import { PlansContent } from "@/components/plans/plans-content";
import { getPlansPageData } from "@/lib/queries/plans";
import { requireViewer } from "@/lib/auth";
import { savePlanAction, updatePlanStatusAction } from "@/lib/actions/plans";

type PlansPageProps = {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    employeeId?: string;
    page?: string;
  }>;
};

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const viewer = await requireViewer();
  const filters = await searchParams;
  const data = await getPlansPageData(viewer, filters);

  return (
    <PlansContent
      data={data}
      saveAction={savePlanAction}
      updateStatusAction={updatePlanStatusAction}
    />
  );
}
