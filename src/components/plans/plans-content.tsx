"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PlanStatusBadge, PriorityBadge } from "@/components/ui/badges";
import { PlanForm } from "@/components/plans/plan-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { usePreferences } from "@/components/providers/preferences-provider";
import { getPlansCopy } from "@/lib/plans-copy";
import { formatDate, getPlanStatusLabel, getPriorityLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { PlansPageData } from "@/lib/queries/plans";
import type { PlanPriority, PlanStatus } from "@/types/database";

type PlanField =
  | "title"
  | "description"
  | "assigneeId"
  | "dueDate"
  | "priority"
  | "status";

type SavePlanAction = (
  state: ActionState<PlanField> | undefined,
  formData: FormData,
) => Promise<ActionState<PlanField>>;

type UpdatePlanStatusAction = (formData: FormData) => Promise<void>;

type PlansContentProps = {
  data: PlansPageData;
  saveAction: SavePlanAction;
  updateStatusAction: UpdatePlanStatusAction;
};

const STATUSES: PlanStatus[] = ["todo", "in_progress", "blocked", "done"];
const PRIORITIES: PlanPriority[] = ["low", "medium", "high"];

export function PlansContent({
  data,
  saveAction,
  updateStatusAction,
}: PlansContentProps) {
  const { language } = usePreferences();
  const copy = getPlansCopy(language);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">{copy.stats.total}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.total}
          </p>
        </div>
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">{copy.stats.inProgress}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.inProgress}
          </p>
        </div>
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">{copy.stats.overdue}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.overdue}
          </p>
        </div>
        <div className="app-panel p-5">
          <p className="text-sm font-medium text-app-text-muted">{copy.stats.done}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
            {data.stats.done}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_minmax(0,1.05fr)]">
        {data.isLeadView ? (
          <section className="app-panel p-6">
            <div className="space-y-2">
              <p className="app-kicker">{copy.create.eyebrow}</p>
              <h2 className="text-xl font-semibold tracking-tight text-app-text">
                {copy.create.title}
              </h2>
            </div>

            <div className="mt-6">
              <PlanForm action={saveAction} employees={data.employees} />
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="app-panel p-6">
            <form className="grid gap-4 md:grid-cols-4">
              {data.isLeadView ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-app-text" htmlFor="employeeId">
                    {copy.filters.employee}
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    className="app-field"
                    defaultValue={data.filters.employeeId}
                  >
                    <option value="">{copy.filters.all}</option>
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
                  {copy.filters.status}
                </label>
                <select
                  id="status"
                  name="status"
                  className="app-field"
                  defaultValue={data.filters.status}
                >
                  <option value="">{copy.filters.all}</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getPlanStatusLabel(status, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-app-text" htmlFor="priority">
                  {copy.filters.priority}
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="app-field"
                  defaultValue={data.filters.priority}
                >
                  <option value="">{copy.filters.all}</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {getPriorityLabel(priority, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button type="submit" className="app-button w-full">
                  {copy.filters.submit}
                </button>
              </div>
            </form>
          </div>

          <div className="app-panel p-6">
            {data.plans.length > 0 ? (
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
                          {plan.assignee?.full_name ?? copy.list.assigneeMissing}
                          {plan.assignee?.department ? ` · ${plan.assignee.department}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={plan.priority} language={language} />
                        <PlanStatusBadge status={plan.status} language={language} />
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-app-text-muted">
                      {plan.description ?? copy.list.noDescription}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-app-text-subtle">
                        {plan.dueDate
                          ? `${copy.list.deadlinePrefix}: ${formatDate(plan.dueDate, undefined, language)}`
                          : copy.list.noDeadline}
                      </p>
                      <form action={updateStatusAction} className="flex items-center gap-2">
                        <input type="hidden" name="planId" value={plan.id} />
                        <select
                          name="status"
                          className="app-field min-w-40"
                          defaultValue={plan.status}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {getPlanStatusLabel(status, language)}
                            </option>
                          ))}
                        </select>
                        <SubmitButton
                          label={copy.list.update}
                          pendingLabel={copy.list.updating}
                          variant="secondary"
                          className="px-3 py-2"
                        />
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title={copy.list.emptyTitle}
                description={copy.list.emptyDescription}
              />
            )}

            <div className="mt-6">
              <Pagination
                pathname="/plans"
                page={data.filters.page}
                pageCount={data.pageCount}
                summaryLabel={copy.pagination.summary(data.filters.page, data.pageCount)}
                previousLabel={copy.pagination.previous}
                nextLabel={copy.pagination.next}
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
