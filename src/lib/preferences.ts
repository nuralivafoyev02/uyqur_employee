export type AppLanguage = "uz" | "en" | "ru";
export type AppTheme = "light" | "dark";

export const DEFAULT_LANGUAGE: AppLanguage = "uz";
export const DEFAULT_THEME: AppTheme = "light";

export const LANGUAGE_STORAGE_KEY = "uyqur-language";
export const THEME_STORAGE_KEY = "uyqur-theme";
export const PREFERENCES_EVENT = "uyqur:preferences-change";

export function parseAppLanguage(value: string | null | undefined): AppLanguage {
  if (value === "en" || value === "ru") {
    return value;
  }

  return DEFAULT_LANGUAGE;
}

export function parseAppTheme(value: string | null | undefined): AppTheme {
  return value === "dark" ? "dark" : DEFAULT_THEME;
}
