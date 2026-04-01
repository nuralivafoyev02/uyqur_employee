import { RouteLoading } from "@/components/ui/route-loading";

export default function EmployeesPageLoading() {
  return (
    <RouteLoading
      title="Employees"
      description="Xodimlar ro'yxati yuklanmoqda"
      stats={0}
    />
  );
}
