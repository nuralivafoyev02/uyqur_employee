"use client";

import { usePreferences } from "@/components/providers/preferences-provider";
import {
  getRouteLoadingCopy,
  type RouteLoadingSection,
} from "@/lib/route-loading-copy";

type RouteLoadingProps = {
  section: RouteLoadingSection;
  title: string;
  description: string;
  stats?: number;
};

function LoadingPageHeader({
  title,
  description,
  actionWidth = "w-32",
}: {
  title: string;
  description: string;
  actionWidth?: string | null;
}) {
  return (
    <section className="rounded-3xl border border-app-border bg-app-surface px-5 py-5 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="app-kicker text-app-text-subtle/80">{title}</div>
          <div className="app-skeleton h-10 w-72 max-w-full" />
          <div className="text-sm text-app-text-muted/80">{description}</div>
        </div>
        {actionWidth ? (
          <div className={`app-skeleton h-10 rounded-2xl ${actionWidth}`} />
        ) : null}
      </div>
    </section>
  );
}

function LoadingMetricGrid({ count }: { count: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="app-panel p-5">
          <div className="app-skeleton h-4 w-28" />
          <div className="mt-4 app-skeleton h-10 w-20" />
          <div className="mt-4 app-skeleton h-4 w-40" />
        </article>
      ))}
    </div>
  );
}

function LoadingSectionHeading({
  lines = 2,
  meta = true,
}: {
  lines?: number;
  meta?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-3">
        <div className="app-skeleton h-4 w-24" />
        <div className="app-skeleton h-8 w-48 max-w-full" />
        {lines > 1 ? <div className="app-skeleton h-4 w-72 max-w-full" /> : null}
      </div>
      {meta ? <div className="app-skeleton h-5 w-20 rounded-full" /> : null}
    </div>
  );
}

function LoadingFilterPanel({ fields }: { fields: number }) {
  return (
    <aside className="app-panel h-fit p-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="app-skeleton h-4 w-16" />
          <div className="app-skeleton h-7 w-28" />
        </div>

        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-11 w-full rounded-2xl" />
          </div>
        ))}

        <div className="app-skeleton mt-2 h-10 w-full rounded-2xl" />
      </div>
    </aside>
  );
}

function LoadingReportCard() {
  return (
    <article className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="app-skeleton h-5 w-40" />
          <div className="app-skeleton h-4 w-32" />
        </div>
        <div className="app-skeleton h-7 w-24 rounded-full" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index}>
            <div className="app-skeleton h-3 w-16" />
            <div className="mt-3 app-skeleton h-4 w-full" />
            <div className="mt-2 app-skeleton h-4 w-11/12" />
            <div className="mt-2 app-skeleton h-4 w-10/12" />
          </div>
        ))}
      </div>
    </article>
  );
}

function LoadingPlanCard() {
  return (
    <article className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="app-skeleton h-6 w-44" />
          <div className="app-skeleton h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <div className="app-skeleton h-7 w-20 rounded-full" />
          <div className="app-skeleton h-7 w-24 rounded-full" />
        </div>
      </div>

      <div className="mt-4 app-skeleton h-4 w-full" />
      <div className="mt-2 app-skeleton h-4 w-10/12" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="app-skeleton h-4 w-36" />
        <div className="flex items-center gap-2">
          <div className="app-skeleton h-11 w-40 rounded-2xl" />
          <div className="app-skeleton h-10 w-24 rounded-2xl" />
        </div>
      </div>
    </article>
  );
}

function LoadingEmployeeCard() {
  return (
    <article className="rounded-2xl border border-app-border bg-app-bg-elevated p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="app-skeleton h-6 w-40" />
          <div className="app-skeleton h-4 w-28" />
        </div>
        <div className="app-skeleton h-7 w-20 rounded-full" />
      </div>

      <div className="mt-5 grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="app-skeleton h-4 w-20" />
            <div className="app-skeleton h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-5 app-skeleton h-5 w-28" />
    </article>
  );
}

function LoadingPagination() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border pt-6">
      <div className="app-skeleton h-4 w-40" />
      <div className="flex gap-2">
        <div className="app-skeleton h-10 w-24 rounded-2xl" />
        <div className="app-skeleton h-10 w-24 rounded-2xl" />
      </div>
    </div>
  );
}

function DashboardRouteLoading({ title, description, stats = 4 }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader title={title} description={description} actionWidth="w-36" />
      <LoadingMetricGrid count={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
        <section className="app-panel p-6">
          <LoadingSectionHeading meta={false} />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={index}
                className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="app-skeleton h-5 w-36" />
                    <div className="app-skeleton h-4 w-24" />
                  </div>
                  <div className="app-skeleton h-7 w-24 rounded-full" />
                </div>
                <div className="mt-4 app-skeleton h-4 w-full" />
                <div className="mt-2 app-skeleton h-4 w-11/12" />
                <div className="mt-4 flex justify-between gap-3">
                  <div className="app-skeleton h-4 w-24" />
                  <div className="app-skeleton h-4 w-28" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="app-panel p-6">
            <LoadingSectionHeading meta={false} />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3"
                >
                  <div className="space-y-2">
                    <div className="app-skeleton h-5 w-32" />
                    <div className="app-skeleton h-4 w-20" />
                  </div>
                  <div className="app-skeleton h-4 w-14" />
                </div>
              ))}
            </div>
          </section>

          <section className="app-panel p-6">
            <LoadingSectionHeading meta={false} />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="app-skeleton h-5 w-32" />
                    <div className="flex gap-2">
                      <div className="app-skeleton h-7 w-20 rounded-full" />
                      <div className="app-skeleton h-7 w-24 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between gap-3">
                    <div className="app-skeleton h-4 w-24" />
                    <div className="app-skeleton h-4 w-24" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ReportsRouteLoading({ title, description }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader title={title} description={description} actionWidth="w-40" />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <LoadingFilterPanel fields={3} />

        <section className="app-panel p-6">
          <LoadingSectionHeading />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingReportCard key={index} />
            ))}
          </div>
          <div className="mt-6">
            <LoadingPagination />
          </div>
        </section>
      </div>
    </div>
  );
}

function PlansRouteLoading({ title, description, stats = 4 }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader title={title} description={description} actionWidth="w-36" />
      <LoadingMetricGrid count={stats} />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <LoadingFilterPanel fields={3} />

        <section className="app-panel p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingPlanCard key={index} />
            ))}
          </div>
          <div className="mt-6">
            <LoadingPagination />
          </div>
        </section>
      </div>
    </div>
  );
}

function EmployeesRouteLoading({ title, description }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader title={title} description={description} actionWidth={null} />

      <section className="app-panel p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <div className="app-skeleton h-4 w-20" />
            <div className="app-skeleton h-11 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="app-skeleton h-4 w-16" />
            <div className="app-skeleton h-11 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="app-skeleton h-4 w-20" />
            <div className="app-skeleton h-11 w-full rounded-2xl" />
          </div>
          <div className="md:col-span-4">
            <div className="app-skeleton h-10 w-28 rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="app-panel p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingEmployeeCard key={index} />
          ))}
        </div>

        <div className="mt-6">
          <LoadingPagination />
        </div>
      </section>
    </div>
  );
}

function EmployeeProfileRouteLoading({ title, description, stats = 3 }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader title={title} description={description} actionWidth="w-20" />
      <LoadingMetricGrid count={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
        <section className="app-panel p-6">
          <LoadingSectionHeading meta={false} />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={index}
                className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="app-skeleton h-5 w-28" />
                  <div className="app-skeleton h-7 w-24 rounded-full" />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, blockIndex) => (
                    <div key={blockIndex}>
                      <div className="app-skeleton h-3 w-16" />
                      <div className="mt-3 app-skeleton h-4 w-full" />
                      <div className="mt-2 app-skeleton h-4 w-11/12" />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="app-panel p-6">
          <LoadingSectionHeading meta={false} />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={index}
                className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="app-skeleton h-5 w-32" />
                  <div className="flex gap-2">
                    <div className="app-skeleton h-7 w-20 rounded-full" />
                    <div className="app-skeleton h-7 w-24 rounded-full" />
                  </div>
                </div>
                <div className="mt-3 app-skeleton h-4 w-full" />
                <div className="mt-2 app-skeleton h-4 w-10/12" />
                <div className="mt-3 app-skeleton h-4 w-28" />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsRouteLoading({ title, description }: RouteLoadingProps) {
  return (
    <div className="-mx-4 -mt-6 min-h-screen md:-mx-6">
      <div className="min-h-screen overflow-hidden border-y border-app-border bg-app-surface lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:border">
        <aside className="border-b border-app-border bg-app-surface px-4 py-5 lg:min-h-full lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="px-2 pb-4">
            <div className="app-skeleton h-5 w-24" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl px-3 py-3"
              >
                <div className="app-skeleton h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <div className="app-skeleton h-4 w-24" />
                  <div className="app-skeleton h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 bg-app-surface">
          <div className="border-b border-app-border bg-app-bg-elevated/40 px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="app-skeleton h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <div className="app-kicker text-app-text-subtle/80">{title}</div>
                  <div className="app-skeleton h-10 w-72 max-w-full" />
                  <div className="text-sm text-app-text-muted/80">{description}</div>
                </div>
              </div>
              <div className="app-skeleton h-8 w-20 rounded-full" />
            </div>
          </div>

          <div className="px-5 py-6 md:px-6 md:py-7">
            <div className="divide-y divide-app-border">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid gap-2 py-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center"
                >
                  <div className="app-skeleton h-4 w-24" />
                  <div className="app-skeleton h-4 w-56 max-w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function RouteLoading({
  section,
  title,
  description,
  stats = 4,
}: RouteLoadingProps) {
  switch (section) {
    case "reports":
      return <ReportsRouteLoading section={section} title={title} description={description} stats={stats} />;
    case "plans":
      return <PlansRouteLoading section={section} title={title} description={description} stats={stats} />;
    case "employees":
      return <EmployeesRouteLoading section={section} title={title} description={description} stats={stats} />;
    case "employeeProfile":
      return (
        <EmployeeProfileRouteLoading
          section={section}
          title={title}
          description={description}
          stats={stats}
        />
      );
    case "settings":
      return <SettingsRouteLoading section={section} title={title} description={description} stats={stats} />;
    case "dashboard":
    default:
      return <DashboardRouteLoading section={section} title={title} description={description} stats={stats} />;
  }
}

type LocalizedRouteLoadingProps = {
  section: RouteLoadingSection;
  stats?: number;
};

export function LocalizedRouteLoading({
  section,
  stats = 4,
}: LocalizedRouteLoadingProps) {
  const { language } = usePreferences();
  const copy = getRouteLoadingCopy(section, language);

  return (
    <RouteLoading
      section={section}
      title={copy.title}
      description={copy.description}
      stats={stats}
    />
  );
}
