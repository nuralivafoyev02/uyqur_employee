"use client";

import { useState } from "react";

import { ChevronDownIcon } from "@/components/layout/dashboard-icons";
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
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { language } = usePreferences();
  const copy = getPlansCopy(language);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
        actions={
          data.isLeadView ? (
            <button
              type="button"
              className={isComposerOpen ? "app-button-secondary" : "app-button"}
              onClick={() => setIsComposerOpen((current) => !current)}
            >
              {isComposerOpen ? copy.create.closeComposer : copy.create.openComposer}
            </button>
          ) : undefined
        }
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

      {data.isLeadView && isComposerOpen ? (
        <section className="app-panel p-6">
          <div className="flex flex-col gap-4 border-b border-app-border pb-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="app-kicker">{copy.create.eyebrow}</p>
              <h2 className="text-xl font-semibold tracking-tight text-app-text">
                {copy.create.title}
              </h2>
            </div>

            <button
              type="button"
              className="app-button-secondary shrink-0 gap-2 self-start px-3 py-2"
              onClick={() => setIsComposerOpen(false)}
            >
              <span>{copy.create.closeComposer}</span>
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-6">
            <PlanForm action={saveAction} employees={data.employees} />
          </div>
        </section>
      ) : null}

      <div className={data.isLeadView ? "grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]" : "space-y-6"}>
        {data.isLeadView ? (
          <aside className="app-panel h-fit p-5">
            <form className="grid gap-4">
              <div className="space-y-1">
                <p className="app-kicker">{copy.filters.submit}</p>
                <h2 className="text-lg font-semibold tracking-tight text-app-text">
                  {copy.filters.status}
                </h2>
              </div>

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

              <button type="submit" className="app-button mt-2 w-full">
                {copy.filters.submit}
              </button>
            </form>
          </aside>
        ) : null}

        <section className="space-y-6">
          {!data.isLeadView ? (
            <div className="app-panel p-4 sm:p-5">
              <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-app-text" htmlFor="status">
                    {copy.filters.status}
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="app-field min-w-48"
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

                <button type="submit" className="app-button w-full sm:w-auto">
                  {copy.filters.submit}
                </button>
              </form>
            </div>
          ) : null}

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
                action={
                  data.isLeadView && !isComposerOpen ? (
                    <button
                      type="button"
                      className="app-button"
                      onClick={() => setIsComposerOpen(true)}
                    >
                      {copy.create.openComposer}
                    </button>
                  ) : undefined
                }
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
