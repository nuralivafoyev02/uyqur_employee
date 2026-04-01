"use client";

import { useActionState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { getPlansCopy, translatePlanMessage } from "@/lib/plans-copy";
import { getPlanStatusLabel, getPriorityLabel } from "@/lib/utils";
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

const priorities: PlanPriority[] = ["low", "medium", "high"];
const statuses: PlanStatus[] = ["todo", "in_progress", "blocked", "done"];

export function PlanForm({ action, employees, initialValue }: PlanFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const { language } = usePreferences();
  const copy = getPlansCopy(language);

  return (
    <form action={formAction} className="space-y-5">
      {initialValue?.id ? <input type="hidden" name="planId" value={initialValue.id} /> : null}

      {state?.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
        >
          {translatePlanMessage(state.message, language)}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="title">
          {copy.form.title}
        </label>
        <input
          id="title"
          name="title"
          className="app-field"
          defaultValue={initialValue?.title ?? ""}
          placeholder={copy.form.titlePlaceholder}
        />
        {state?.fieldErrors?.title ? (
          <p className="text-sm text-rose-700">
            {translatePlanMessage(state.fieldErrors.title[0], language)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="description">
          {copy.form.description}
        </label>
        <textarea
          id="description"
          name="description"
          className="app-field app-textarea"
          defaultValue={initialValue?.description ?? ""}
          placeholder={copy.form.descriptionPlaceholder}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="assigneeId">
          {copy.form.assignee}
        </label>
        <select
          id="assigneeId"
          name="assigneeId"
          className="app-field"
          defaultValue={initialValue?.assignee_id ?? ""}
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
          <p className="text-sm text-rose-700">
            {translatePlanMessage(state.fieldErrors.assigneeId[0], language)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="dueDate">
            {copy.form.dueDate}
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="app-field"
            defaultValue={initialValue?.due_date ?? ""}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="priority">
            {copy.form.priority}
          </label>
          <select
            id="priority"
            name="priority"
            className="app-field"
            defaultValue={initialValue?.priority ?? "medium"}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {getPriorityLabel(priority, language)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="status">
          {copy.form.initialStatus}
        </label>
        <select
          id="status"
          name="status"
          className="app-field"
          defaultValue={initialValue?.status ?? "todo"}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getPlanStatusLabel(status, language)}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton label={copy.form.submit} pendingLabel={copy.form.pending} />
    </form>
  );
}
