"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { getPlansCopy, translatePlanMessage } from "@/lib/plans-copy";
import { cx, getPlanStatusLabel, getPriorityLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { Plan, PlanPriority, PlanStatus, Profile } from "@/types/database";

type PlanField =
  | "title"
  | "description"
  | "assigneeId"
  | "dueDate"
  | "priority"
  | "status";

type PlanFormAction = (
  state: ActionState<PlanField> | undefined,
  formData: FormData,
) => Promise<ActionState<PlanField>>;

type PlanFormProps = {
  action: PlanFormAction;
  employees: Array<Pick<Profile, "id" | "full_name" | "title" | "department">>;
  initialValue?: Pick<
    Plan,
    "id" | "assignee_id" | "title" | "description" | "due_date" | "priority" | "status"
  > | null;
};

type PlanDraft = {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  priority: PlanPriority;
  status: PlanStatus;
};

const priorities: PlanPriority[] = ["low", "medium", "high"];
const statuses: PlanStatus[] = ["todo", "in_progress", "blocked", "done"];

function getInitialPlanDraft(
  initialValue?: Pick<
    Plan,
    "assignee_id" | "title" | "description" | "due_date" | "priority" | "status"
  > | null,
): PlanDraft {
  return {
    title: initialValue?.title ?? "",
    description: initialValue?.description ?? "",
    assigneeId: initialValue?.assignee_id ?? "",
    dueDate: initialValue?.due_date ?? "",
    priority: initialValue?.priority ?? "medium",
    status: initialValue?.status ?? "todo",
  };
}

function shouldOpenDetails(draft: PlanDraft) {
  return Boolean(draft.description) || Boolean(draft.dueDate) || draft.status !== "todo";
}

export function PlanForm({ action, employees, initialValue }: PlanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledRedirectRef = useRef<string | null>(null);
  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getPlansCopy(language);
  const [draft, setDraft] = useState<PlanDraft>(() => getInitialPlanDraft(initialValue));
  const [isDetailsOpen, setIsDetailsOpen] = useState(() =>
    shouldOpenDetails(getInitialPlanDraft(initialValue)),
  );

  useEffect(() => {
    if (!state?.success || !state.redirectTo) {
      return;
    }

    const redirectKey = `${state.redirectTo}:${state.message ?? ""}`;

    if (handledRedirectRef.current === redirectKey) {
      return;
    }

    handledRedirectRef.current = redirectKey;
    formRef.current?.reset();

    startTransition(() => {
      router.replace(state.redirectTo!);
      router.refresh();
    });
  }, [router, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {initialValue?.id ? <input type="hidden" name="planId" value={initialValue.id} /> : null}
      <input type="hidden" name="priority" value={draft.priority} />
      <input type="hidden" name="status" value={draft.status} />

      {state?.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-[13px] ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {translatePlanMessage(state.message, language)}
        </div>
      ) : null}

      <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <p className="app-kicker">{copy.create.eyebrow}</p>
            <h3 className="text-base font-semibold tracking-tight text-app-text">
              {copy.create.title}
            </h3>
            <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
              {copy.create.description}
            </p>
          </div>

          <button
            type="button"
            className="app-button-secondary self-start px-3 py-1.5 text-xs"
            onClick={() => setIsDetailsOpen((current) => !current)}
          >
            {isDetailsOpen ? copy.create.hideDetails : copy.create.details}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-app-border bg-app-surface px-3 py-2.5 text-[12px] text-app-text-muted">
          {copy.create.quickHint}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.82fr)_180px_auto]">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle" htmlFor="title">
              {copy.form.title}
            </label>
            <input
              id="title"
              name="title"
              className="app-field"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder={copy.form.titlePlaceholder}
            />
            {state?.fieldErrors?.title ? (
              <p className="text-[12px] text-rose-700">
                {translatePlanMessage(state.fieldErrors.title[0], language)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle" htmlFor="assigneeId">
              {copy.form.assignee}
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              className="app-field"
              value={draft.assigneeId}
              onChange={(event) =>
                setDraft((current) => ({ ...current, assigneeId: event.target.value }))
              }
            >
              <option value="">{copy.form.assigneePlaceholder}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                  {employee.title ? ` - ${employee.title}` : ""}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.assigneeId ? (
              <p className="text-[12px] text-rose-700">
                {translatePlanMessage(state.fieldErrors.assigneeId[0], language)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle" htmlFor="dueDate">
              {copy.form.dueDate}
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="app-field"
              value={draft.dueDate}
              onChange={(event) =>
                setDraft((current) => ({ ...current, dueDate: event.target.value }))
              }
            />
            {state?.fieldErrors?.dueDate ? (
              <p className="text-[12px] text-rose-700">
                {translatePlanMessage(state.fieldErrors.dueDate[0], language)}
              </p>
            ) : null}
          </div>

          <div className="flex items-end">
            <SubmitButton
              label={initialValue?.id ? copy.form.submit : copy.form.quickSubmit}
              pendingLabel={copy.form.pending}
              className="w-full px-4 xl:w-auto"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-1.5 rounded-2xl border border-app-border bg-app-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.form.priority}
            </p>
            <div className="app-segmented">
              {priorities.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className="app-segmented-button"
                  data-active={draft.priority === priority}
                  aria-pressed={draft.priority === priority}
                  onClick={() =>
                    setDraft((current) => ({ ...current, priority }))
                  }
                >
                  {getPriorityLabel(priority, language)}
                </button>
              ))}
            </div>
            {state?.fieldErrors?.priority ? (
              <p className="text-[12px] text-rose-700">
                {translatePlanMessage(state.fieldErrors.priority[0], language)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5 rounded-2xl border border-app-border bg-app-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.form.initialStatus}
            </p>
            <div className="app-segmented">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="app-segmented-button"
                  data-active={draft.status === status}
                  aria-pressed={draft.status === status}
                  onClick={() => setDraft((current) => ({ ...current, status }))}
                >
                  {getPlanStatusLabel(status, language)}
                </button>
              ))}
            </div>
            {state?.fieldErrors?.status ? (
              <p className="text-[12px] text-rose-700">
                {translatePlanMessage(state.fieldErrors.status[0], language)}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className={cx(
            "overflow-hidden transition-all duration-200",
            isDetailsOpen ? "mt-4 max-h-72 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="rounded-2xl border border-app-border bg-app-surface p-3">
            <label
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
              htmlFor="description"
            >
              {copy.form.descriptionOptional}
            </label>
            <textarea
              id="description"
              name="description"
              className="app-field app-textarea mt-2 min-h-28"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder={copy.form.descriptionPlaceholder}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
