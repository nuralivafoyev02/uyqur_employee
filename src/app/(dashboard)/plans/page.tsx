import { SubmitButton } from "@/components/ui/submit-button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { PlanStatusBadge, PriorityBadge } from "@/components/ui/badges";
import { PlanForm } from "@/components/plans/plan-form";
import { getPlansPageData } from "@/lib/queries/plans";
import { requireViewer } from "@/lib/auth";
import { savePlanAction, updatePlanStatusAction } from "@/lib/actions/plans";
import { formatDate } from "@/lib/utils";

type PlansPageProps = {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    employeeId?: string;
    page?: string;
  }>;
};

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const viewer = await requireViewer();
  const filters = await searchParams;
  const data = await getPlansPageData(viewer, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plans / Tasks"
        title="Vazifalar oqimi"
        description="Deadline, prioritet va status yangilanishlari bilan ishlovchi plan board."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">Jami</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.total}
          </p>
        </div>
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">Jarayonda</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.inProgress}
          </p>
        </div>
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">Overdue</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.overdue}
          </p>
        </div>
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">Done</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.done}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_minmax(0,1.05fr)]">
        {data.isLeadView ? (
          <section className="app-panel p-6">
            <div className="space-y-2">
              <p className="app-kicker">Create Task</p>
              <h2 className="text-xl font-semibold tracking-tight text-app-text">
                Yangi vazifa
              </h2>
            </div>

            <div className="mt-6">
              <PlanForm action={savePlanAction} employees={data.employees} />
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="app-panel p-6">
            <form className="grid gap-4 md:grid-cols-4">
              {data.isLeadView ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-app-text" htmlFor="employeeId">
                    Xodim
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    className="app-field"
                    defaultValue={data.filters.employeeId}
                  >
                    <option value="">Barchasi</option>
                    {data.employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-app-text" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="app-field"
                  defaultValue={data.filters.status}
                >
                  <option value="">Barchasi</option>
                  <option value="todo">Boshlanmagan</option>
                  <option value="in_progress">Jarayonda</option>
                  <option value="blocked">{"To'siq bor"}</option>
                  <option value="done">Yakunlangan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-app-text" htmlFor="priority">
                  Prioritet
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="app-field"
                  defaultValue={data.filters.priority}
                >
                  <option value="">Barchasi</option>
                  <option value="low">Past</option>
                  <option value="medium">{"O'rtacha"}</option>
                  <option value="high">Yuqori</option>
                </select>
              </div>

              <div className="flex items-end">
                <button type="submit" className="app-button w-full">
                  Filterlash
                </button>
              </div>
            </form>
          </div>

          <div className="app-panel p-6">
            <div className="space-y-4">
              {data.plans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-app-text">
                        {plan.title}
                      </h2>
                      <p className="mt-1 text-sm text-app-text-muted">
                        {plan.assignee?.full_name ?? "Ijrochi topilmadi"}
                        {plan.assignee?.department ? ` · ${plan.assignee.department}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={plan.priority} />
                      <PlanStatusBadge status={plan.status} />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-app-text-muted">
                    {plan.description ?? "Qo'shimcha tavsif berilmagan."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-app-text-subtle">
                      {plan.dueDate ? `Deadline: ${formatDate(plan.dueDate)}` : "Deadline yo'q"}
                    </p>
                    <form action={updatePlanStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="planId" value={plan.id} />
                      <select
                        name="status"
                        className="app-field min-w-40"
                        defaultValue={plan.status}
                      >
                        <option value="todo">Boshlanmagan</option>
                        <option value="in_progress">Jarayonda</option>
                        <option value="blocked">{"To'siq bor"}</option>
                        <option value="done">Yakunlangan</option>
                      </select>
                      <SubmitButton
                        label="Yangilash"
                        pendingLabel="..."
                        variant="secondary"
                        className="px-3 py-2"
                      />
                    </form>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6">
              <Pagination
                pathname="/plans"
                page={data.filters.page}
                pageCount={data.pageCount}
                query={{
                  ...(data.filters.status ? { status: data.filters.status } : {}),
                  ...(data.filters.priority ? { priority: data.filters.priority } : {}),
                  ...(data.filters.employeeId ? { employeeId: data.filters.employeeId } : {}),
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
