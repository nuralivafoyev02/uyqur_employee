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
  actionSkeletons = ["h-10 w-32 rounded-2xl"],
}: {
  title: string;
  description: string;
  actionSkeletons?: string[] | null;
}) {
  return (
    <section className="rounded-3xl border border-app-border bg-app-surface px-5 py-5 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="app-kicker text-app-text-subtle/80">{title}</div>
          <div className="app-skeleton h-10 w-72 max-w-full" />
          <div className="text-sm text-app-text-muted/80">{description}</div>
        </div>
        {actionSkeletons ? (
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            {actionSkeletons.map((skeleton, index) => (
              <div key={index} className={`app-skeleton ${skeleton}`} />
            ))}
          </div>
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

function LoadingPlanComposer() {
  return (
    <section className="app-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="app-skeleton h-4 w-24" />
          <div className="app-skeleton h-7 w-40" />
          <div className="app-skeleton h-4 w-72 max-w-full" />
        </div>
        <div className="app-skeleton h-8 w-24 rounded-xl" />
      </div>

      <div className="mt-5 space-y-4">
        <div className="app-skeleton h-10 w-full rounded-2xl" />
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.82fr)_180px_auto]">
          <div className="app-skeleton h-11 w-full rounded-2xl" />
          <div className="app-skeleton h-11 w-full rounded-2xl" />
          <div className="app-skeleton h-11 w-full rounded-2xl" />
          <div className="app-skeleton h-10 w-full rounded-2xl" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-app-border bg-app-surface p-3">
            <div className="app-skeleton h-4 w-20" />
            <div className="mt-3 flex gap-2">
              <div className="app-skeleton h-8 w-20 rounded-full" />
              <div className="app-skeleton h-8 w-20 rounded-full" />
              <div className="app-skeleton h-8 w-20 rounded-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-app-border bg-app-surface p-3">
            <div className="app-skeleton h-4 w-24" />
            <div className="mt-3 flex gap-2">
              <div className="app-skeleton h-8 w-24 rounded-full" />
              <div className="app-skeleton h-8 w-24 rounded-full" />
              <div className="app-skeleton h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingReportComposer() {
  return (
    <section className="app-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="app-skeleton h-4 w-24" />
          <div className="app-skeleton h-7 w-40" />
          <div className="app-skeleton h-4 w-80 max-w-full" />
          <div className="app-skeleton h-10 w-72 max-w-full rounded-2xl" />
        </div>
        <div className="app-skeleton h-8 w-24 rounded-xl" />
      </div>

      <div className="mt-4 rounded-2xl border border-app-border bg-app-bg-elevated p-4">
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
          <div className="app-skeleton h-11 w-full rounded-2xl" />
          <div className="app-skeleton h-11 w-full rounded-2xl" />
          <div className="app-skeleton h-10 w-full rounded-2xl" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <div className="app-skeleton h-4 w-24" />
            <div className="mt-3 app-skeleton h-7 w-28" />
            <div className="mt-2 app-skeleton h-4 w-40" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-app-border bg-app-surface px-3 py-3"
                >
                  <div className="app-skeleton h-3 w-12" />
                  <div className="mt-2 app-skeleton h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <div className="app-skeleton h-4 w-20" />
            <div className="mt-3 flex gap-2">
              <div className="app-skeleton h-8 w-24 rounded-full" />
              <div className="app-skeleton h-8 w-24 rounded-full" />
              <div className="app-skeleton h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-app-border bg-app-surface p-4"
            >
              <div className="app-skeleton h-3 w-12" />
              <div className="mt-2 app-skeleton h-5 w-52 max-w-full" />
              <div className="mt-2 app-skeleton h-4 w-72 max-w-full" />
              <div className="mt-3 app-skeleton h-28 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <article className="rounded-[20px] border border-app-border bg-app-surface px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="app-skeleton h-5 w-36" />
          <div className="app-skeleton h-3.5 w-28" />
        </div>
        <div className="app-skeleton h-7 w-20 rounded-full" />
      </div>

      <div className="mt-2 app-skeleton h-3.5 w-full" />
      <div className="mt-1.5 app-skeleton h-3.5 w-10/12" />

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="app-skeleton h-5 w-24 rounded-full" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="app-skeleton h-6 w-6 rounded-full" />
          <div className="app-skeleton h-3.5 w-20" />
        </div>
        <div className="app-skeleton h-7 w-20 rounded-full" />
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="app-skeleton h-8 flex-1 rounded-xl" />
        <div className="app-skeleton h-8 w-12 rounded-xl" />
      </div>
    </article>
  );
}

function LoadingPlanBoardColumn({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <section
      className={`shrink-0 rounded-[24px] border border-app-border bg-app-bg-elevated p-2.5 ${
        collapsed ? "w-[220px]" : "w-[272px]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 rounded-[18px] bg-white/70 px-2.5 py-2">
        <div className="app-skeleton h-7 w-28 rounded-full" />
        <div className="app-skeleton h-6 w-10 rounded-full" />
      </div>

      {collapsed ? (
        <div className="mt-3 rounded-[20px] border border-dashed border-app-border bg-app-surface px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-4 w-20" />
          </div>
          <div className="mt-3 app-skeleton h-5 w-11/12" />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <LoadingPlanCard key={index} />
          ))}
        </div>
      )}
    </section>
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
    <div className="space-y-5">
      <LoadingPageHeader
        title={title}
        description={description}
        actionSkeletons={["h-10 w-24 rounded-2xl", "h-10 w-32 rounded-2xl"]}
      />
      <LoadingMetricGrid count={stats} />

      <section className="app-panel p-4 md:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
          <div className="rounded-[28px] border border-app-border bg-app-bg-elevated p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="app-skeleton h-4 w-24" />
                <div className="app-skeleton h-7 w-40" />
                <div className="app-skeleton h-4 w-full max-w-2xl" />
                <div className="app-skeleton h-4 w-11/12 max-w-2xl" />
              </div>
              <div className="app-skeleton h-8 w-44 rounded-full" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-app-border bg-app-surface p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="app-skeleton h-5 w-28" />
                    <div className="app-skeleton h-4 w-8" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 4 }).map((__, lineIndex) => (
                      <div key={lineIndex} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="app-skeleton h-4 w-20" />
                          <div className="app-skeleton h-4 w-8" />
                        </div>
                        <div className="app-skeleton h-2 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-app-border bg-app-surface p-4"
                >
                  <LoadingSectionHeading meta={false} />
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 3 }).map((__, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3"
                      >
                        <div className="app-skeleton h-4 w-28" />
                        <div className="mt-2 app-skeleton h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-[28px] border border-app-border bg-app-surface p-4">
              <LoadingSectionHeading meta={false} />
              <div className="mt-4 grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="app-skeleton h-9 w-9 rounded-full" />
                      <div className="app-skeleton h-4 w-4" />
                    </div>
                    <div className="mt-3 app-skeleton h-5 w-24" />
                    <div className="mt-2 app-skeleton h-4 w-full" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-app-border bg-app-surface p-4">
              <LoadingSectionHeading meta={false} />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3"
                  >
                    <div className="app-skeleton h-4 w-28" />
                    <div className="mt-2 app-skeleton h-4 w-20" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {Array.from({ length: 2 }).map((_, index) => (
          <section key={index} className="app-panel p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-app-border pb-4">
              <div className="space-y-2">
                <div className="app-skeleton h-4 w-24" />
                <div className="app-skeleton h-6 w-36" />
              </div>
              <div className="app-skeleton h-4 w-24" />
            </div>

            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <div className="app-skeleton h-4 w-32" />
                      <div className="app-skeleton h-4 w-24" />
                    </div>
                    <div className="app-skeleton h-7 w-20 rounded-full" />
                  </div>
                  <div className="mt-3 app-skeleton h-4 w-full" />
                  <div className="mt-2 app-skeleton h-4 w-10/12" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ReportsRouteLoading({ title, description }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader
        title={title}
        description={description}
        actionSkeletons={["h-8 w-24 rounded-xl", "h-10 w-36 rounded-2xl"]}
      />
      <LoadingReportComposer />

      <section className="app-panel p-4 md:p-5">
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
  );
}

function SuggestionsRouteLoading({ title, description, stats = 5 }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader
        title={title}
        description={description}
        actionSkeletons={["h-8 w-24 rounded-xl", "h-8 w-28 rounded-xl"]}
      />
      <LoadingMetricGrid count={stats} />

      <section className="app-panel p-4 md:p-5">
        <div className="flex flex-col gap-4 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-7 w-40" />
            <div className="app-skeleton h-4 w-80 max-w-full" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="app-skeleton h-10 w-full rounded-2xl" />
            <div className="app-skeleton h-10 w-28 rounded-xl" />
            <div className="app-skeleton h-10 w-32 rounded-xl" />
          </div>
          <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-3">
            <div className="app-skeleton h-4 w-24" />
            <div className="mt-3 app-skeleton h-28 w-full rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="app-panel p-4 md:p-5">
        <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-7 w-40" />
            <div className="app-skeleton h-4 w-80 max-w-full" />
          </div>
          <div className="space-y-2 text-right">
            <div className="app-skeleton h-4 w-24" />
            <div className="app-skeleton h-4 w-28" />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="app-skeleton h-5 w-28" />
              <div className="app-skeleton h-4 w-10" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="app-skeleton h-5 w-48 max-w-full" />
                    <div className="app-skeleton h-4 w-36" />
                  </div>
                  <div className="app-skeleton h-7 w-24 rounded-full" />
                </div>
                <div className="mt-3 app-skeleton h-4 w-full" />
                <div className="mt-2 app-skeleton h-4 w-10/12" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="app-skeleton h-5 w-24" />
                  <div className="app-skeleton h-4 w-12" />
                </div>
                <div className="app-skeleton h-4 w-4" />
              </div>
            </div>
          </div>

          <LoadingPagination />
        </div>
      </section>
    </div>
  );
}

function PlansRouteLoading({ title, description, stats = 4 }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader
        title={title}
        description={description}
        actionSkeletons={["h-8 w-24 rounded-xl", "h-10 w-32 rounded-2xl"]}
      />
      <LoadingMetricGrid count={stats} />
      <LoadingPlanComposer />

      <section className="app-panel p-4 md:p-5">
        <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="app-skeleton h-4 w-28" />
            <div className="app-skeleton h-7 w-40" />
            <div className="app-skeleton h-4 w-80 max-w-full" />
          </div>
          <div className="app-skeleton h-4 w-24" />
        </div>

        <div className="app-scroll-row mt-5">
          <LoadingPlanBoardColumn />
          <LoadingPlanBoardColumn />
          <LoadingPlanBoardColumn />
          <LoadingPlanBoardColumn collapsed />
        </div>

        <div className="mt-6">
          <LoadingPagination />
        </div>
      </section>
    </div>
  );
}

function EmployeesRouteLoading({ title, description }: RouteLoadingProps) {
  return (
    <div className="space-y-6">
      <LoadingPageHeader
        title={title}
        description={description}
        actionSkeletons={["h-8 w-24 rounded-xl"]}
      />

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
      <LoadingPageHeader
        title={title}
        description={description}
        actionSkeletons={["h-10 w-20 rounded-2xl"]}
      />
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
    case "suggestions":
      return <SuggestionsRouteLoading section={section} title={title} description={description} stats={stats} />;
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
