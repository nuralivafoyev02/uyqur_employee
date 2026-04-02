import { LocalizedRouteLoading } from "@/components/ui/route-loading";

export default function DashboardPageLoading() {
  return <LocalizedRouteLoading section="dashboard" stats={5} />;
}
