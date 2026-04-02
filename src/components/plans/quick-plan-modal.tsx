"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/layout/dashboard-icons";
import { useAnimatedPresence } from "@/components/ui/use-animated-presence";

type QuickPlanModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function QuickPlanModal({
  isOpen,
  title,
  description,
  closeLabel,
  onClose,
  children,
}: QuickPlanModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { isMounted, dataState } = useAnimatedPresence(isOpen, 220);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      data-state={dataState}
      className="app-overlay fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/36 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        data-state={dataState}
        className="app-dialog-panel app-panel w-full max-w-xl p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p id={titleId} className="text-lg font-semibold tracking-tight text-app-text">
              {title}
            </p>
            {description ? (
              <p
                id={descriptionId}
                className="max-w-lg text-[13px] leading-5 text-app-text-muted"
              >
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className="app-icon-button h-9 w-9 shrink-0"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
