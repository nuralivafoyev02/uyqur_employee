type RouteLoadingProps = {
  title: string;
  description: string;
  stats?: number;
};

export function RouteLoading({
  title,
  description,
  stats = 4,
}: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-app-border bg-app-surface px-5 py-5 md:px-6">
        <div className="space-y-2">
          <div className="app-kicker text-app-text-subtle/80">{title}</div>
          <div className="app-skeleton h-10 w-72 max-w-full" />
          <div className="text-sm text-app-text-muted/80">{description}</div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: stats }).map((_, index) => (
          <article key={index} className="app-panel p-5">
            <div className="app-skeleton h-4 w-24" />
            <div className="mt-4 app-skeleton h-10 w-20" />
            <div className="mt-4 app-skeleton h-4 w-36" />
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_minmax(0,1.05fr)]">
        <section className="app-panel p-6">
          <div className="space-y-4">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-8 w-56" />
            <div className="app-skeleton h-5 w-80 max-w-full" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="app-skeleton h-12 w-full" />
            <div className="app-skeleton h-28 w-full" />
            <div className="app-skeleton h-28 w-full" />
            <div className="app-skeleton h-10 w-44" />
          </div>
        </section>

        <section className="app-panel p-6">
          <div className="space-y-4">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-8 w-52" />
            <div className="app-skeleton h-5 w-72 max-w-full" />
          </div>

          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="app-skeleton h-5 w-40" />
                  <div className="app-skeleton h-7 w-24 rounded-full" />
                </div>
                <div className="mt-4 app-skeleton h-4 w-full" />
                <div className="mt-2 app-skeleton h-4 w-11/12" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
