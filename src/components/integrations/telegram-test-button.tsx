"use client";

import { useTransition } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { useToast } from "@/components/providers/toast-provider";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import type { ActionState } from "@/lib/validations";

type SendTelegramTestMessageAction = (
  formData: FormData,
) => Promise<ActionState<string>>;

type TelegramTestButtonProps = {
  action: SendTelegramTestMessageAction;
};

export function TelegramTestButton({ action }: TelegramTestButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { language } = usePreferences();
  const { pushToast } = useToast();
  const copy = getIntegrationsCopy(language);

  function handleClick() {
    const formData = new FormData();
    formData.set("provider", "telegram");
    formData.set("language", language);

    startTransition(async () => {
      const result = await action(formData);

      if (result.message) {
        pushToast({
          message: result.message,
          tone: result.success ? "success" : "error",
        });
      }
    });
  }

  return (
    <button
      type="button"
      className="app-button-secondary px-3 py-2 text-xs"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? copy.testingMessage : copy.testMessage}
    </button>
  );
}
