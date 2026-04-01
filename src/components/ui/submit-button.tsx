"use client";

import { useFormStatus } from "react-dom";

import { cx } from "@/lib/utils";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary";
};

export function SubmitButton({
  label,
  pendingLabel = "Saqlanmoqda...",
  className,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={cx(
        variant === "primary" ? "app-button" : "app-button-secondary",
        className,
      )}
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
