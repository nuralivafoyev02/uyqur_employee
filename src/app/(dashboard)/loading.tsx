export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="app-skeleton h-32 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="app-skeleton h-36" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_minmax(0,0.8fr)]">
        <div className="app-skeleton h-96" />
        <div className="app-skeleton h-96" />
      </div>
    </div>
  );
}
