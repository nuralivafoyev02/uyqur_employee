"use client";

import { useMemo, useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";

import { ChevronDownIcon, PlusIcon } from "@/components/layout/dashboard-icons";
import { QuickPlanForm } from "@/components/plans/quick-plan-form";
import { PlanForm } from "@/components/plans/plan-form";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useToast } from "@/components/providers/toast-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PlanStatusBadge, PriorityBadge } from "@/components/ui/badges";
import { FilterModal } from "@/components/ui/filter-modal";
import { getPlansCopy, translatePlanMessage } from "@/lib/plans-copy";
import {
  cx,
  formatDate,
  formatDateTime,
  getInitials,
  getPlanStatusLabel,
  getPriorityLabel,
  truncate,
} from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { PlanListItem, PlansPageData } from "@/lib/queries/plans";
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

type UpdatePlanStatusAction = (formData: FormData) => Promise<ActionState | undefined>;

type DragState = {
  planId: string;
  sourceStatus: PlanStatus;
};

type PlansContentProps = {
  data: PlansPageData;
  saveAction: SavePlanAction;
  updateStatusAction: UpdatePlanStatusAction;
};

type PlansBoardSectionProps = {
  plans: PlanListItem[];
  employees: PlansPageData["employees"];
  filters: PlansPageData["filters"];
  pageCount: number;
  isLeadView: boolean;
  isComposerOpen: boolean;
  saveAction: SavePlanAction;
  updateStatusAction: UpdatePlanStatusAction;
  language: ReturnType<typeof usePreferences>["language"];
  copy: ReturnType<typeof getPlansCopy>;
  onOpenComposer: () => void;
};

const STATUSES: PlanStatus[] = ["todo", "in_progress", "blocked", "done"];
const PRIORITIES: PlanPriority[] = ["low", "medium", "high"];

const COLUMN_TONES: Record<PlanStatus, string> = {
  todo: "border-slate-200 bg-slate-50/80",
  in_progress: "border-sky-200 bg-sky-50/80",
  blocked: "border-rose-200 bg-rose-50/80",
  done: "border-emerald-200 bg-emerald-50/80",
};

function movePlanToStatus(plans: PlanListItem[], planId: string, nextStatus: PlanStatus) {
  const nextPlans = [...plans];
  const currentIndex = nextPlans.findIndex((plan) => plan.id === planId);

  if (currentIndex === -1) {
    return plans;
  }

  const [plan] = nextPlans.splice(currentIndex, 1);
  nextPlans.unshift({
    ...plan,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  });

  return nextPlans;
}

function PlansBoardSection({
  plans,
  employees,
  filters,
  pageCount,
  isLeadView,
  isComposerOpen,
  saveAction,
  updateStatusAction,
  language,
  copy,
  onOpenComposer,
}: PlansBoardSectionProps) {
  const [isDoneColumnOpen, setIsDoneColumnOpen] = useState(false);
  const [boardPlans, setBoardPlans] = useState(plans);
  const [quickAddStatus, setQuickAddStatus] = useState<PlanStatus | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<PlanStatus | null>(null);
  const [isMovePending, startMoveTransition] = useTransition();
  const router = useRouter();
  const { pushToast } = useToast();

  async function submitStatusForm(formData: FormData) {
    await updateStatusAction(formData);
  }

  const plansByStatus = useMemo(
    () =>
      STATUSES.map((status) => ({
        status,
        items: boardPlans.filter((plan) => plan.status === status),
      })),
    [boardPlans],
  );
  const paginationQuery = useMemo(
    () => ({
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
    }),
    [filters.employeeId, filters.priority, filters.q, filters.status],
  );

  function handleQuickAddToggle(status: PlanStatus) {
    if (status === "done") {
      setIsDoneColumnOpen(true);
    }

    setQuickAddStatus((current) => (current === status ? null : status));
  }

  function handleColumnDragOver(event: DragEvent<HTMLElement>, status: PlanStatus) {
    if (!dragState) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);

    if (status === "done" && !isDoneColumnOpen) {
      setIsDoneColumnOpen(true);
    }
  }

  function handleCardDragStart(plan: PlanListItem) {
    setDragState({
      planId: plan.id,
      sourceStatus: plan.status,
    });
  }

  function handleDragEnd() {
    setDragState(null);
    setDragOverStatus(null);
  }

  function handleDrop(status: PlanStatus) {
    if (!dragState) {
      return;
    }

    const { planId, sourceStatus } = dragState;
    setDragState(null);
    setDragOverStatus(null);

    if (sourceStatus === status) {
      return;
    }

    const previousPlans = boardPlans;
    setBoardPlans((current) => movePlanToStatus(current, planId, status));

    startMoveTransition(async () => {
      const formData = new FormData();
      formData.set("planId", planId);
      formData.set("status", status);

      const result = await updateStatusAction(formData);

      if (!result?.success) {
        setBoardPlans(previousPlans);
        pushToast({
          message:
            translatePlanMessage(
              result?.message ?? "Vazifa statusini yangilab bo'lmadi.",
              language,
            ) ?? "Task status update failed.",
          tone: "error",
        });
        router.refresh();
        return;
      }

      pushToast({
        message: translatePlanMessage(result.message, language) ?? copy.list.dragSuccess,
        tone: "success",
      });
      router.refresh();
    });
  }

  return (
    <section className="app-panel p-4 md:p-5">
      <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="app-kicker">{copy.list.boardTitle}</p>
          <h2 className="text-lg font-semibold tracking-tight text-app-text">
            {copy.list.boardTitle}
          </h2>
          <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
            {copy.list.boardDescription}
          </p>
        </div>
        <p className="text-[12px] text-app-text-muted sm:text-[13px]">
          {copy.pagination.summary(filters.page, pageCount)}
        </p>
      </div>

      {boardPlans.length > 0 ? (
        <div className="app-scroll-row mt-5">
          {plansByStatus.map(({ status, items }) => {
            const isDoneColumn = status === "done";
            const isCollapsed = isDoneColumn && !isDoneColumnOpen;
            const latestDonePlan = items[0];

            return (
              <section
                key={status}
                className={cx(
                  "snap-start shrink-0 rounded-[24px] border p-2.5 transition",
                  isCollapsed ? "w-[220px]" : "w-[244px] sm:w-[258px] xl:w-[272px]",
                  COLUMN_TONES[status],
                  dragOverStatus === status && "border-app-border-strong ring-2 ring-app-accent/10",
                )}
                onDragOver={(event) => handleColumnDragOver(event, status)}
                onDrop={() => handleDrop(status)}
              >
                {isDoneColumn ? (
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-2xl text-left transition hover:bg-app-surface/50"
                      aria-expanded={isDoneColumnOpen}
                      onClick={() => setIsDoneColumnOpen((current) => !current)}
                    >
                      <span className="flex items-center justify-between gap-3 px-1 py-1">
                        <span className="flex items-center gap-2">
                          <PlanStatusBadge status={status} language={language} />
                          <span className="rounded-full border border-app-border bg-app-surface px-2 py-1 text-[11px] font-medium text-app-text-muted">
                            {items.length}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 text-[11px] font-medium text-app-text-muted">
                          <span>
                            {isDoneColumnOpen ? copy.list.collapseColumn : copy.list.expandColumn}
                          </span>
                          <ChevronDownIcon
                            className={cx(
                              "h-4 w-4 transition-transform",
                              isDoneColumnOpen ? "rotate-180" : "",
                            )}
                          />
                        </span>
                      </span>

                      {isCollapsed ? (
                        <span className="mt-3 block rounded-[20px] border border-dashed border-app-border bg-app-surface px-3 py-3">
                          <span className="flex items-center justify-between gap-3">
                            <span className="text-[12px] font-medium text-app-text-muted">
                              {copy.list.collapsedState}
                            </span>
                            {latestDonePlan ? (
                              <span className="text-[11px] text-app-text-subtle">
                                {formatDateTime(latestDonePlan.updatedAt, language)}
                              </span>
                            ) : null}
                          </span>
                          <span className="app-line-clamp-2 mt-2 block text-[13px] font-medium leading-5 text-app-text">
                            {latestDonePlan?.title ?? copy.list.emptyColumn}
                          </span>
                        </span>
                      ) : null}
                    </button>

                    {isLeadView ? (
                      <button
                        type="button"
                        className="app-icon-button h-9 w-9 shrink-0"
                        aria-label={copy.list.quickAdd}
                        onClick={() => handleQuickAddToggle(status)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-[18px] bg-white/70 px-2.5 py-2">
                    <div className="min-w-0">
                      <PlanStatusBadge status={status} language={language} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-full border border-app-border bg-app-surface px-2 py-1 text-[11px] font-medium text-app-text-muted">
                        {items.length}
                      </span>
                      {isLeadView ? (
                        <button
                          type="button"
                          className="app-icon-button h-8 w-8"
                          aria-label={copy.list.quickAdd}
                          onClick={() => handleQuickAddToggle(status)}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}

                {!isCollapsed ? (
                  <>
                    {isLeadView && quickAddStatus === status ? (
                      <div className="mt-3">
                        <QuickPlanForm
                          action={saveAction}
                          employees={employees}
                          defaultStatus={status}
                          onClose={() => setQuickAddStatus(null)}
                        />
                      </div>
                    ) : null}

                    {items.length > 0 ? (
                      <div className="mt-3 space-y-2.5">
                        {items.map((plan) => (
                          <article
                            key={plan.id}
                            draggable={!isMovePending}
                            onDragStart={() => handleCardDragStart(plan)}
                            onDragEnd={handleDragEnd}
                            className={cx(
                              "rounded-[20px] border border-app-border bg-app-surface px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition",
                              "cursor-grab active:cursor-grabbing hover:border-app-border-strong",
                              dragState?.planId === plan.id && "opacity-70",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="app-line-clamp-2 text-[13px] font-semibold leading-5 tracking-tight text-app-text sm:text-[14px]">
                                  {truncate(plan.title, 88)}
                                </h3>
                                <p className="mt-1 truncate text-[11px] leading-4 text-app-text-muted">
                                  {plan.assignee?.full_name ?? copy.list.assigneeMissing}
                                  {plan.assignee?.department ? ` · ${plan.assignee.department}` : ""}
                                </p>
                              </div>
                              <div className="shrink-0">
                                <PriorityBadge priority={plan.priority} language={language} />
                              </div>
                            </div>

                            {plan.description ? (
                              <p className="app-line-clamp-2 mt-2 text-[11px] leading-[1rem] text-app-text-muted sm:text-[12px] sm:leading-[1.15rem]">
                                {truncate(plan.description, 96)}
                              </p>
                            ) : null}

                            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-app-text-subtle">
                              <span className="rounded-full border border-app-border bg-app-bg-elevated px-2 py-1">
                                {plan.dueDate
                                  ? `${copy.list.deadlinePrefix}: ${formatDate(
                                      plan.dueDate,
                                      undefined,
                                      language,
                                    )}`
                                  : copy.list.noDeadline}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-accent-muted text-[10px] font-semibold text-app-text">
                                  {getInitials(plan.assignee?.full_name ?? "?")}
                                </span>
                                <span className="truncate text-[11px] text-app-text-muted">
                                  {formatDateTime(plan.updatedAt, language)}
                                </span>
                              </div>
                              <PlanStatusBadge status={plan.status} language={language} />
                            </div>

                            <form action={submitStatusForm} className="mt-2.5 flex items-center gap-1.5">
                              <input type="hidden" name="planId" value={plan.id} />
                              <select
                                name="status"
                                className="app-field min-w-0 flex-1 px-2.5 py-1.5 text-[11px]"
                                defaultValue={plan.status}
                              >
                                {STATUSES.map((nextStatus) => (
                                  <option key={nextStatus} value={nextStatus}>
                                    {getPlanStatusLabel(nextStatus, language)}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="app-button-secondary shrink-0 px-2.5 py-1.5 text-[11px]"
                              >
                                {copy.list.update}
                              </button>
                            </form>
                          </article>
                        ))}
                      </div>
                    ) : quickAddStatus === status ? null : (
                      <div className="mt-3 rounded-[20px] border border-dashed border-app-border bg-app-surface px-3 py-5 text-center text-[12px] text-app-text-muted">
                        {copy.list.emptyColumn}
                      </div>
                    )}
                  </>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title={copy.list.emptyTitle}
            description={copy.list.emptyDescription}
            action={
              isLeadView && !isComposerOpen ? (
                <button
                  type="button"
                  className="app-button"
                  onClick={onOpenComposer}
                >
                  {copy.create.openComposer}
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      <div className="mt-6">
        <Pagination
          pathname="/plans"
          page={filters.page}
          pageCount={pageCount}
          summaryLabel={copy.pagination.summary(filters.page, pageCount)}
          previousLabel={copy.pagination.previous}
          nextLabel={copy.pagination.next}
          query={paginationQuery}
        />
      </div>
    </section>
  );
}

export function PlansContent({
  data,
  saveAction,
  updateStatusAction,
}: PlansContentProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(data.isLeadView);
  const { language } = usePreferences();
  const copy = getPlansCopy(language);
  const activeFilterCount =
    Number(Boolean(data.filters.q)) +
    Number(Boolean(data.filters.status)) +
    Number(Boolean(data.filters.priority)) +
    Number(Boolean(data.isLeadView && data.filters.employeeId));
  const boardKey = useMemo(
    () => data.plans.map((plan) => `${plan.id}:${plan.status}:${plan.updatedAt}`).join("|"),
    [data.plans],
  );

  function renderFilterModal(triggerClassName?: string) {
    return (
      <FilterModal
        triggerLabel={copy.filters.open}
        title={copy.filters.title}
        closeLabel={copy.filters.close}
        activeCount={activeFilterCount}
        triggerClassName={triggerClassName}
      >
        <form className="grid gap-4">
          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
              htmlFor="planFilterSearch"
            >
              {copy.filters.search}
            </label>
            <input
              id="planFilterSearch"
              name="q"
              className="app-field"
              defaultValue={data.filters.q}
              placeholder={copy.form.titlePlaceholder}
            />
          </div>

          {data.isLeadView ? (
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                htmlFor="planFilterEmployee"
              >
                {copy.filters.employee}
              </label>
              <select
                id="planFilterEmployee"
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

          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
              htmlFor="planFilterStatus"
            >
              {copy.filters.status}
            </label>
            <select
              id="planFilterStatus"
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

          {data.isLeadView ? (
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                htmlFor="planFilterPriority"
              >
                {copy.filters.priority}
              </label>
              <select
                id="planFilterPriority"
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
          ) : null}

          <button type="submit" className="app-button w-full">
            {copy.filters.submit}
          </button>
        </form>
      </FilterModal>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
        actions={(
          <div className="hidden flex-col items-end gap-2 sm:flex sm:flex-row sm:items-center">
            {renderFilterModal()}

            {data.isLeadView ? (
              <button
                type="button"
                className={isComposerOpen ? "app-button-secondary" : "app-button"}
                onClick={() => setIsComposerOpen((current) => !current)}
              >
                {isComposerOpen ? copy.create.closeComposer : copy.create.openComposer}
              </button>
            ) : null}
          </div>
        )}
      />

      <div className="sticky top-2 z-20 sm:hidden">
        <div className="app-panel flex items-center gap-2 px-2 py-2 backdrop-blur">
          {renderFilterModal("app-button-secondary flex-1 justify-center gap-2 px-3 py-2 text-[12px]")}
          {data.isLeadView ? (
            <button
              type="button"
              className={cx(
                isComposerOpen ? "app-button-secondary" : "app-button",
                "flex-1 justify-center px-3 py-2 text-[12px]",
              )}
              onClick={() => setIsComposerOpen((current) => !current)}
            >
              {isComposerOpen ? copy.create.closeComposer : copy.create.openComposer}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="app-panel p-4">
          <p className="text-[11px] font-medium text-app-text-muted sm:text-[12px]">
            {copy.stats.total}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-app-text sm:text-2xl">
            {data.stats.total}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[11px] font-medium text-app-text-muted sm:text-[12px]">
            {copy.stats.inProgress}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-app-text sm:text-2xl">
            {data.stats.inProgress}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[11px] font-medium text-app-text-muted sm:text-[12px]">
            {copy.stats.overdue}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-app-text sm:text-2xl">
            {data.stats.overdue}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[11px] font-medium text-app-text-muted sm:text-[12px]">
            {copy.stats.done}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-app-text sm:text-2xl">
            {data.stats.done}
          </p>
        </div>
      </div>

      {data.isLeadView && isComposerOpen ? (
        <section className="app-panel p-4 md:p-5">
          <div className="flex flex-col gap-4 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1.5">
              <p className="app-kicker">{copy.create.eyebrow}</p>
              <h2 className="text-lg font-semibold tracking-tight text-app-text">
                {copy.create.title}
              </h2>
              <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
                {copy.create.description}
              </p>
            </div>

            <button
              type="button"
              className="app-button-secondary shrink-0 gap-2 self-start px-3 py-1.5 text-xs"
              onClick={() => setIsComposerOpen(false)}
            >
              <span>{copy.create.closeComposer}</span>
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-5">
            <PlanForm
              key={`plan-composer:${data.totalCount}:${data.stats.inProgress}:${data.stats.done}`}
              action={saveAction}
              employees={data.employees}
            />
          </div>
        </section>
      ) : null}

      <PlansBoardSection
        key={boardKey}
        plans={data.plans}
        employees={data.employees}
        filters={data.filters}
        pageCount={data.pageCount}
        isLeadView={data.isLeadView}
        isComposerOpen={isComposerOpen}
        saveAction={saveAction}
        updateStatusAction={updateStatusAction}
        language={language}
        copy={copy}
        onOpenComposer={() => setIsComposerOpen(true)}
      />
    </div>
  );
}
