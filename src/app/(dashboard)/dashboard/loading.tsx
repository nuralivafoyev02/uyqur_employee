import { RouteLoading } from "@/components/ui/route-loading";

export default function DashboardPageLoading() {
  return (
    <RouteLoading
      title="Dashboard"
      description="Overview yuklanmoqda"
      stats={4}
    />
  );
}
