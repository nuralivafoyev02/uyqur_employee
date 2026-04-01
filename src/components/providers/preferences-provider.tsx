"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

import { getAppCopy } from "@/lib/copy";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  LANGUAGE_STORAGE_KEY,
  PREFERENCES_EVENT,
  THEME_STORAGE_KEY,
  parseAppLanguage,
  parseAppTheme,
  type AppLanguage,
  type AppTheme,
} from "@/lib/preferences";

type PreferencesContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(PREFERENCES_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PREFERENCES_EVENT, handleChange);
  };
}

function getLanguageSnapshot() {
  try {
    return parseAppLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function getThemeSnapshot() {
  try {
    return parseAppTheme(
      document.documentElement.dataset.theme ?? window.localStorage.getItem(THEME_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_THEME;
  }
}

export function PreferencesProvider({ children }: PropsWithChildren) {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, () => DEFAULT_LANGUAGE);
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => DEFAULT_THEME);

  const setLanguage = (nextLanguage: AppLanguage) => {
    document.documentElement.lang = nextLanguage;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // Ignore persistence failures and keep the current in-memory UI language.
    }

    window.dispatchEvent(new Event(PREFERENCES_EVENT));
  };

  const setTheme = (nextTheme: AppTheme) => {
    document.documentElement.dataset.theme = nextTheme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore persistence failures and keep the current in-memory UI theme.
    }

    window.dispatchEvent(new Event(PREFERENCES_EVENT));
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
    }),
    [language, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider.");
  }

  return context;
}

export function useAppCopy() {
  const { language } = usePreferences();
  return useMemo(() => getAppCopy(language), [language]);
}
