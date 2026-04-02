"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionStateToast } from "@/components/ui/toast-effect";
import { getPlansCopy, translatePlanMessage } from "@/lib/plans-copy";
import type { ActionState } from "@/lib/validations";
import type { PlanPriority, PlanStatus, Profile } from "@/types/database";

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

type QuickPlanFormProps = {
  action: SavePlanAction;
  employees: Array<Pick<Profile, "id" | "full_name" | "title" | "department">>;
  defaultStatus: PlanStatus;
  defaultPriority?: PlanPriority;
  onClose?: () => void;
};

export function QuickPlanForm({
  action,
  employees,
  defaultStatus,
  defaultPriority = "medium",
  onClose,
}: QuickPlanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledRedirectRef = useRef<string | null>(null);
  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getPlansCopy(language);

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
    onClose?.();

    startTransition(() => {
      router.replace(state.redirectTo!);
      router.refresh();
    });
  }, [onClose, router, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2.5 rounded-[18px] border border-app-border bg-app-surface p-3">
      <input type="hidden" name="priority" value={defaultPriority} />
      <input type="hidden" name="status" value={defaultStatus} />
      <ActionStateToast
        state={state}
        message={state?.message ? translatePlanMessage(state.message, language) : undefined}
      />

      <div className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(170px,0.8fr)_140px_auto_auto]">
        <div className="space-y-1">
          <input
            name="title"
            className="app-field"
            placeholder={copy.form.titlePlaceholder}
          />
          {state?.fieldErrors?.title ? (
            <p className="text-[11px] text-rose-700">
              {translatePlanMessage(state.fieldErrors.title[0], language)}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <select
            name="assigneeId"
            className="app-field"
            defaultValue=""
          >
            <option value="">{copy.form.assigneePlaceholder}</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.assigneeId ? (
            <p className="text-[11px] text-rose-700">
              {translatePlanMessage(state.fieldErrors.assigneeId[0], language)}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <input
            name="dueDate"
            type="date"
            className="app-field"
          />
          {state?.fieldErrors?.dueDate ? (
            <p className="text-[11px] text-rose-700">
              {translatePlanMessage(state.fieldErrors.dueDate[0], language)}
            </p>
          ) : null}
        </div>

        <SubmitButton
          label={copy.form.quickSubmit}
          pendingLabel={copy.form.pending}
          className="w-full justify-center px-3 md:w-auto"
        />

        <button
          type="button"
          className="app-button-secondary justify-center px-3 md:w-auto"
          onClick={() => onClose?.()}
        >
          {copy.filters.close}
        </button>
      </div>
    </form>
  );
}
