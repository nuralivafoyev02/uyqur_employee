"use client";

import { startTransition, useTransition } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { useToast } from "@/components/providers/toast-provider";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import { INTEGRATIONS_EVENT } from "@/lib/integration-providers";
import type { ActionState } from "@/lib/validations";

type DisconnectIntegrationAction = (
  formData: FormData,
) => Promise<ActionState<string>>;

type IntegrationDisconnectButtonProps = {
  action: DisconnectIntegrationAction;
  provider: string;
  className?: string;
};

export function IntegrationDisconnectButton({
  action,
  provider,
  className,
}: IntegrationDisconnectButtonProps) {
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getIntegrationsCopy(language);
  const { pushToast } = useToast();
  const [isPending, startDisconnect] = useTransition();

  function handleDisconnect() {
    const formData = new FormData();
    formData.set("provider", provider);
    formData.set("language", language);

    startDisconnect(async () => {
      const result = await action(formData);

      if (result.message) {
        pushToast({
          message: result.message,
          tone: result.success ? "success" : "error",
        });
      }

      if (!result.success) {
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(INTEGRATIONS_EVENT));
      }

      startTransition(() => {
        router.replace("/settings?section=integrations");
        router.refresh();
      });
    });
  }

  return (
    <button
      type="button"
      className={className ?? "app-button-secondary px-3 py-2 text-xs text-rose-600"}
      disabled={isPending}
      onClick={handleDisconnect}
    >
      {isPending ? copy.disconnecting : copy.disconnect}
    </button>
  );
}
