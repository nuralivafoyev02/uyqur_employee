import { EmployeesContent } from "@/components/employees/employees-content";
import { getEmployeesPageData } from "@/lib/queries/employees";
import { requireRole } from "@/lib/auth";

type EmployeesPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    department?: string;
    page?: string;
  }>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const viewer = await requireRole(["admin", "manager"]);
  const filters = await searchParams;
  const data = await getEmployeesPageData(viewer, filters);

  return <EmployeesContent data={data} />;
}
