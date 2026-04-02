"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SubmitButton } from "@/components/ui/submit-button";
import { ActionStateToast } from "@/components/ui/toast-effect";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  getSuggestionsCopy,
  translateSuggestionMessage,
} from "@/lib/suggestions-copy";
import type { ActionState } from "@/lib/validations";

type SuggestionField = "title" | "description";
type SaveSuggestionAction = (
  state: ActionState<SuggestionField> | undefined,
  formData: FormData,
) => Promise<ActionState<SuggestionField>>;

type SuggestionFormProps = {
  action: SaveSuggestionAction;
};

export function SuggestionForm({ action }: SuggestionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledRedirectRef = useRef<string | null>(null);
  const [state, formAction] = useActionState(action, undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getSuggestionsCopy(language);
  const isDetailsVisible = isDetailsOpen || Boolean(state?.fieldErrors?.description);

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
      <ActionStateToast
        state={state}
        message={
          state?.message ? translateSuggestionMessage(state.message, language) : undefined
        }
      />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
            htmlFor="suggestionTitle"
          >
            {copy.create.titleLabel}
          </label>
          <input
            id="suggestionTitle"
            name="title"
            className="app-field"
            placeholder={copy.create.titlePlaceholder}
          />
          {state?.fieldErrors?.title ? (
            <p className="text-sm text-rose-700">
              {translateSuggestionMessage(state.fieldErrors.title[0], language)}
            </p>
          ) : null}
        </div>

        <div className="self-end">
          <button
            type="button"
            className="app-button-secondary px-3 py-2 text-xs"
            onClick={() => setIsDetailsOpen((current) => !current)}
          >
            {isDetailsVisible ? copy.create.hideDetails : copy.create.toggleDetails}
          </button>
        </div>

        <div className="self-end">
          <SubmitButton
            label={copy.create.submit}
            pendingLabel={copy.create.pending}
            className="px-3 py-2 text-xs"
          />
        </div>
      </div>

      {isDetailsVisible ? (
        <div className="space-y-1.5 rounded-2xl border border-app-border bg-app-bg-elevated p-3">
          <label
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
            htmlFor="suggestionDescription"
          >
            {copy.create.descriptionLabel}
          </label>
          <textarea
            id="suggestionDescription"
            name="description"
            className="app-field app-textarea min-h-28"
            placeholder={copy.create.descriptionPlaceholder}
          />
          {state?.fieldErrors?.description ? (
            <p className="text-sm text-rose-700">
              {translateSuggestionMessage(state.fieldErrors.description[0], language)}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
