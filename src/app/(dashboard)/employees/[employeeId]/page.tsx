import Link from "next/link";
import { redirect } from "next/navigation";

import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { PlanStatusBadge, PriorityBadge, ReportStatusBadge, RoleBadge } from "@/components/ui/badges";
import { getEmployeeProfileData } from "@/lib/queries/employees";
import { requireViewer } from "@/lib/auth";
import { formatDate, truncate } from "@/lib/utils";

type EmployeeProfilePageProps = {
  params: Promise<{
    employeeId: string;
  }>;
};

export default async function EmployeeProfilePage({
  params,
}: EmployeeProfilePageProps) {
  const viewer = await requireViewer();
  const { employeeId } = await params;
  const data = await getEmployeeProfileData(viewer, employeeId);

  if (!data) {
    redirect("/dashboard?denied=1");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Profile"
        title={data.profile.full_name}
        description={data.profile.title ?? "Lavozim ko'rsatilmagan"}
        actions={<RoleBadge role={data.profile.role} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Jami hisobotlar"
          value={data.stats.totalReports}
          helper="Ko'rinib turgan hisobotlar soni"
        />
        <MetricCard
          label="Blocked reportlar"
          value={data.stats.blockedReports}
          helper="Muammo qayd etilgan hisobotlar"
        />
        <MetricCard
          label="Faol vazifalar"
          value={data.stats.activePlans}
          helper="Hali yakunlanmagan plans/tasks"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
        <section className="app-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="app-kicker">Reports</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                Faoliyat tarixi
              </h2>
            </div>
            <Link href="/reports" className="text-sm font-medium text-app-accent">
              Reports sahifasi
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {data.reportHistory.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-app-text">{formatDate(report.report_date)}</p>
                  <ReportStatusBadge status={report.status} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      Bajarilgan ish
                    </p>
                    <p className="mt-2 text-sm leading-6 text-app-text-muted">
                      {truncate(report.completed_work, 180)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      Keyingi reja
                    </p>
                    <p className="mt-2 text-sm leading-6 text-app-text-muted">
                      {truncate(report.next_plan, 180)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="app-panel p-6">
          <p className="app-kicker">Plans</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
            Biriktirilgan vazifalar
          </h2>

          <div className="mt-6 space-y-4">
            {data.plans.length > 0 ? (
              data.plans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-app-text">{plan.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={plan.priority} />
                      <PlanStatusBadge status={plan.status} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-app-text-muted">
                    {plan.description ? truncate(plan.description, 180) : "Qo'shimcha tavsif yo'q."}
                  </p>
                  <p className="mt-3 text-sm text-app-text-subtle">
                    {plan.due_date ? `Deadline: ${formatDate(plan.due_date)}` : "Deadline yo'q"}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-app-border bg-app-bg-elevated px-5 py-10 text-center text-sm text-app-text-muted">
                Vazifalar topilmadi.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
