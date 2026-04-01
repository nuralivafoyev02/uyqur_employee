import { redirect } from "next/navigation";

import { EmployeeProfileContent } from "@/components/employees/employee-profile-content";
import { getEmployeeProfileData } from "@/lib/queries/employees";
import { requireViewer } from "@/lib/auth";

type EmployeeProfilePageProps = {
  params: Promise<{
    employeeId: string;
  }>;
};

export default async function EmployeeProfilePage({
  params,
}: EmployeeProfilePageProps) {
  const viewer = await requireViewer();
  const { employeeId } = await params;
  const data = await getEmployeeProfileData(viewer, employeeId);

  if (!data) {
    redirect("/dashboard?denied=1");
  }

  return <EmployeeProfileContent data={data} />;
}
