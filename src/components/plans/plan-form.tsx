"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
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

  return (
    <form action={formAction} className="space-y-5">
      {initialValue?.id ? <input type="hidden" name="planId" value={initialValue.id} /> : null}

      {state?.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="title">
          Vazifa nomi
        </label>
        <input
          id="title"
          name="title"
          className="app-field"
          defaultValue={initialValue?.title ?? ""}
          placeholder="Masalan, Yangi hisobot oqimini tayyorlash"
        />
        {state?.fieldErrors?.title ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="description">
          Tavsif
        </label>
        <textarea
          id="description"
          name="description"
          className="app-field app-textarea"
          defaultValue={initialValue?.description ?? ""}
          placeholder="Kutilayotgan natija, eslatmalar yoki kontekst."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="assigneeId">
          Ijrochi
        </label>
        <select
          id="assigneeId"
          name="assigneeId"
          className="app-field"
          defaultValue={initialValue?.assignee_id ?? ""}
        >
          <option value="">Xodim tanlang</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
              {employee.title ? ` - ${employee.title}` : ""}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.assigneeId ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.assigneeId[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="dueDate">
            Deadline
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
            Prioritet
          </label>
          <select
            id="priority"
            name="priority"
            className="app-field"
            defaultValue={initialValue?.priority ?? "medium"}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {getPriorityLabel(priority)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="status">
          {"Boshlang'ich status"}
        </label>
        <select
          id="status"
          name="status"
          className="app-field"
          defaultValue={initialValue?.status ?? "todo"}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getPlanStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton label="Vazifani saqlash" pendingLabel="Saqlanmoqda..." />
    </form>
  );
}
