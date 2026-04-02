"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/providers/toast-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { QuickPlanModal } from "@/components/plans/quick-plan-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import {
  INTEGRATIONS_EVENT,
  type ActiveIntegrationSummary,
  type IntegrationProviderDefinition,
} from "@/lib/integration-providers";
import type { ActionState } from "@/lib/validations";

type SaveIntegrationAction = (
  state: ActionState<string> | undefined,
  formData: FormData,
) => Promise<ActionState<string>>;

type IntegrationConnectModalProps = {
  action: SaveIntegrationAction;
  provider: IntegrationProviderDefinition;
  connection?: ActiveIntegrationSummary | null;
  isOpen: boolean;
  onClose: () => void;
};

export function IntegrationConnectModal({
  action,
  provider,
  connection,
  isOpen,
  onClose,
}: IntegrationConnectModalProps) {
  const [state, formAction] = useActionState(action, undefined);
  const { language } = usePreferences();
  const copy = getIntegrationsCopy(language);
  const router = useRouter();
  const { pushToast } = useToast();
  const handledToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state?.message) {
      return;
    }

    const nextKey = `${state.success ? "success" : "error"}:${state.message}`;

    if (handledToastRef.current === nextKey) {
      return;
    }

    handledToastRef.current = nextKey;
    pushToast({
      message: state.message,
      tone: state.success ? "success" : "error",
    });
  }, [pushToast, state]);

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    onClose();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(INTEGRATIONS_EVENT));
    }

    startTransition(() => {
      router.refresh();
    });
  }, [onClose, router, state]);

  return (
    <QuickPlanModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${connection ? copy.update : copy.connect} ${provider.displayName}`}
      description={connection ? copy.modalDescriptionExisting : copy.modalDescription}
      closeLabel={copy.close}
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="provider" value={provider.slug} />
        <input type="hidden" name="language" value={language} />

        <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3">
          <p className="text-sm leading-6 text-app-text-muted">{provider.description[language]}</p>
        </div>

        <div className="space-y-3">
          {provider.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor={field.key}
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                >
                  {field.label[language]}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-app-border bg-app-surface px-2 py-1 text-[10px] font-semibold text-app-text-subtle">
                    {field.required ?? true ? copy.required : copy.optional}
                  </span>
                  <span className="rounded-full border border-app-border bg-app-surface px-2 py-1 text-[10px] font-semibold text-app-text-subtle">
                    {field.secret ? copy.privateField : copy.publicField}
                  </span>
                </div>
              </div>

              <input
                id={field.key}
                name={field.key}
                type={field.type}
                autoComplete="off"
                spellCheck={false}
                className="app-field"
                defaultValue={field.secret ? "" : connection?.publicConfig[field.key] ?? ""}
                placeholder={
                  field.secret && connection
                    ? copy.keepCurrentSecret
                    : field.placeholder[language]
                }
              />

              {field.helper ? (
                <p className="text-[12px] leading-5 text-app-text-muted">{field.helper[language]}</p>
              ) : null}

              {state?.fieldErrors?.[field.key] ? (
                <p className="text-[12px] text-rose-700">{state.fieldErrors[field.key]?.[0]}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="app-button-secondary justify-center px-4"
            onClick={onClose}
          >
            {copy.close}
          </button>
          <SubmitButton
            label={copy.save}
            pendingLabel={copy.saving}
            className="justify-center px-4"
          />
        </div>
      </form>
    </QuickPlanModal>
  );
}
