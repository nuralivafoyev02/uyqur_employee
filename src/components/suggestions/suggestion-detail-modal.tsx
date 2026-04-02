"use client";

import { useEffect, useId } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/layout/dashboard-icons";
import { usePreferences } from "@/components/providers/preferences-provider";
import { SuggestionStatusBadge } from "@/components/ui/badges";
import { useAnimatedPresence } from "@/components/ui/use-animated-presence";
import { getSuggestionsCopy } from "@/lib/suggestions-copy";
import { cx, formatDateTime } from "@/lib/utils";
import type { SuggestionStatus } from "@/types/database";

export type SuggestionDetailItem = {
  id: string;
  title: string;
  description?: string | null;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
  employeeName?: string | null;
  employeeTitle?: string | null;
  employeeDepartment?: string | null;
};

type UpdateSuggestionStatusAction = (formData: FormData) => Promise<void>;

type SuggestionDetailModalProps = {
  isOpen: boolean;
  suggestion: SuggestionDetailItem | null;
  canManageStatus: boolean;
  onClose: () => void;
  updateStatusAction: UpdateSuggestionStatusAction;
};

function StatusActionButton({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || active}
      className={cx(
        active ? "app-button" : "app-button-secondary",
        "justify-center px-3 py-2 text-xs disabled:pointer-events-none disabled:opacity-60",
      )}
    >
      {pending ? "..." : label}
    </button>
  );
}

export function SuggestionDetailModal({
  isOpen,
  suggestion,
  canManageStatus,
  onClose,
  updateStatusAction,
}: SuggestionDetailModalProps) {
  const { language } = usePreferences();
  const copy = getSuggestionsCopy(language);
  const titleId = useId();
  const descriptionId = useId();
  const { isMounted, dataState } = useAnimatedPresence(isOpen, 240);

  useEffect(() => {
    if (!isMounted) {
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
  }, [isMounted, onClose]);

  if (!isMounted || !suggestion) {
    return null;
  }

  return createPortal(
    <div
      data-state={dataState}
      className="app-overlay fixed inset-0 z-[120] flex justify-end bg-slate-950/35 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-state={dataState}
        className="app-drawer-panel app-panel h-full w-full max-w-xl rounded-none border-y-0 border-r-0 p-5 sm:rounded-l-[28px] sm:border"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-app-border pb-4">
            <div className="space-y-1.5">
              <p className="app-kicker">{copy.detail.title}</p>
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-app-text">
                {suggestion.title}
              </h2>
              <p id={descriptionId} className="text-[13px] leading-5 text-app-text-muted">
                {suggestion.employeeName ?? "-"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SuggestionStatusBadge status={suggestion.status} language={language} />
              <button
                type="button"
                className="app-icon-button h-9 w-9"
                aria-label={copy.detail.close}
                onClick={onClose}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                  {copy.detail.employee}
                </p>
                <p className="mt-2 text-sm font-semibold text-app-text">
                  {suggestion.employeeName ?? "-"}
                </p>
                <p className="mt-1 text-[12px] text-app-text-muted">
                  {suggestion.employeeTitle ?? suggestion.employeeDepartment ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                  {copy.detail.createdAt}
                </p>
                <p className="mt-2 text-sm font-semibold text-app-text">
                  {formatDateTime(suggestion.createdAt, language)}
                </p>
                <p className="mt-1 text-[12px] text-app-text-muted">
                  {copy.detail.updatedAt}: {formatDateTime(suggestion.updatedAt, language)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                {copy.detail.titleLabel}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-app-text">
                {suggestion.title}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                {copy.detail.descriptionLabel}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-app-text">
                {suggestion.description?.trim()
                  ? suggestion.description
                  : copy.detail.noDescription}
              </p>
            </div>

            {canManageStatus ? (
              <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                  {copy.detail.statusActions}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <form action={updateStatusAction}>
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <input type="hidden" name="status" value="accepted" />
                    <StatusActionButton
                      active={suggestion.status === "accepted"}
                      label={copy.detail.accept}
                    />
                  </form>

                  <form action={updateStatusAction}>
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <input type="hidden" name="status" value="prepared" />
                    <StatusActionButton
                      active={suggestion.status === "prepared"}
                      label={copy.detail.prepare}
                    />
                  </form>

                  <form action={updateStatusAction}>
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <input type="hidden" name="status" value="canceled" />
                    <StatusActionButton
                      active={suggestion.status === "canceled"}
                      label={copy.detail.cancel}
                    />
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
