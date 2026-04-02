"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { CloseIcon, FilterIcon } from "@/components/layout/dashboard-icons";
import { useAnimatedPresence } from "@/components/ui/use-animated-presence";

type FilterModalProps = {
  triggerLabel: string;
  title: string;
  closeLabel: string;
  description?: string;
  activeCount?: number;
  children: React.ReactNode;
};

export function FilterModal({
  triggerLabel,
  title,
  closeLabel,
  description,
  activeCount = 0,
  children,
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const { isMounted, dataState } = useAnimatedPresence(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="app-button-secondary gap-2 self-end px-3 py-1.5 text-xs"
        onClick={() => setIsOpen(true)}
      >
        <FilterIcon className="h-4 w-4" />
        <span>{triggerLabel}</span>
        {activeCount > 0 ? (
          <span className="rounded-full border border-app-border bg-app-bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-app-text">
            {activeCount}
          </span>
        ) : null}
      </button>

      {isMounted
        ? createPortal(
            <div
              data-state={dataState}
              className="app-overlay fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/32 px-4 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                data-state={dataState}
                className="app-dialog-panel app-panel w-full max-w-md p-5"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <p id={titleId} className="text-base font-semibold tracking-tight text-app-text">
                      {title}
                    </p>
                    {description ? (
                      <p
                        id={descriptionId}
                        className="max-w-sm text-[13px] leading-5 text-app-text-muted"
                      >
                        {description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="app-icon-button h-9 w-9"
                    aria-label={closeLabel}
                    onClick={() => setIsOpen(false)}
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5">{children}</div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
