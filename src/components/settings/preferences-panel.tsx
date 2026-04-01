"use client";

import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import { Badge } from "@/components/ui/badge";
import { cx } from "@/lib/utils";

export function PreferencesPanel() {
  const { language, setLanguage, theme, setTheme } = usePreferences();
  const copy = useAppCopy();

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-app-text">
              {copy.settings.languageLabel}
            </p>
            <p className="text-sm text-app-text-muted">
              {copy.settings.currentSelection}:{" "}
              {copy.settings.languageOptions.find((option) => option.value === language)?.label}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {copy.settings.languageOptions.map((option) => {
            const isActive = option.value === language;

            return (
              <button
                key={option.value}
                type="button"
                className={cx(
                  "rounded-2xl border px-4 py-4 text-left transition",
                  isActive
                    ? "border-app-border-strong bg-app-surface-muted"
                    : "border-app-border bg-app-surface hover:bg-app-surface-muted",
                )}
                aria-pressed={isActive}
                onClick={() => setLanguage(option.value)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-app-text">{option.label}</p>
                  {isActive ? (
                    <Badge tone="info" className="shrink-0">
                      {copy.common.active}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-app-text-muted">{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="app-divider" />

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-app-text">{copy.settings.themeLabel}</p>
          <p className="text-sm text-app-text-muted">
            {copy.settings.currentSelection}:{" "}
            {copy.settings.themeOptions.find((option) => option.value === theme)?.label}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {copy.settings.themeOptions.map((option) => {
            const isActive = option.value === theme;

            return (
              <button
                key={option.value}
                type="button"
                className={cx(
                  "rounded-2xl border px-4 py-4 text-left transition",
                  isActive
                    ? "border-app-border-strong bg-app-surface-muted"
                    : "border-app-border bg-app-surface hover:bg-app-surface-muted",
                )}
                aria-pressed={isActive}
                onClick={() => setTheme(option.value)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-app-text">{option.label}</p>
                  {isActive ? (
                    <Badge tone="info" className="shrink-0">
                      {copy.common.active}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-app-text-muted">{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
