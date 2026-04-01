import { RouteLoading } from "@/components/ui/route-loading";

export default function EmployeeProfileLoading() {
  return (
    <RouteLoading
      title="Employee Profile"
      description="Xodim profili yuklanmoqda"
      stats={3}
    />
  );
}
