import { RouteLoading } from "@/components/ui/route-loading";

export default function ReportsPageLoading() {
  return (
    <RouteLoading
      title="Daily Reports"
      description="Hisobotlar yuklanmoqda"
      stats={0}
    />
  );
}
