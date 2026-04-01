import { RouteLoading } from "@/components/ui/route-loading";

export default function PlansPageLoading() {
  return (
    <RouteLoading
      title="Plans / Tasks"
      description="Vazifalar oqimi yuklanmoqda"
      stats={4}
    />
  );
}
