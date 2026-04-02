"use client";

import { useEffect } from "react";

import { useToast, type ToastTone } from "@/components/providers/toast-provider";
import type { ActionState } from "@/lib/validations";

type ToastEffectProps = {
  message?: string;
  tone?: ToastTone;
  eventKey?: unknown;
};

export function ToastEffect({
  message,
  tone = "success",
  eventKey,
}: ToastEffectProps) {
  const { pushToast } = useToast();

  useEffect(() => {
    if (!message) {
      return;
    }

    pushToast({ message, tone });
  }, [eventKey, message, pushToast, tone]);

  return null;
}

type ActionStateToastProps<TField extends string> = {
  state: ActionState<TField> | undefined;
  message?: string;
  successTone?: ToastTone;
  errorTone?: ToastTone;
};

export function ActionStateToast<TField extends string>({
  state,
  message,
  successTone = "success",
  errorTone = "error",
}: ActionStateToastProps<TField>) {
  const toastMessage = state?.message ? message ?? state.message : undefined;
  const tone = state?.success ? successTone : errorTone;

  return <ToastEffect message={toastMessage} tone={tone} eventKey={state} />;
}
