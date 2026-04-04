import type { Metadata } from "next";

import "@/app/globals.css";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  LANGUAGE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "@/lib/preferences";

export const metadata: Metadata = {
  title: {
    default: "Uyqur Support ERP",
    template: "%s | Uyqur Support ERP",
  },
  description:
    "Uyqur Support ERP - Ichki employee tracking tizimi: hisobotlar, rejalar va boshqaruv ko'rinishi.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

const themeInitScript = `
  try {
    const storedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    const storedLanguage = localStorage.getItem("${LANGUAGE_STORAGE_KEY}");
    document.documentElement.dataset.theme = storedTheme === "dark" ? "dark" : "${DEFAULT_THEME}";
    document.documentElement.lang =
      storedLanguage === "en" || storedLanguage === "ru" ? storedLanguage : "${DEFAULT_LANGUAGE}";
  } catch {
    document.documentElement.dataset.theme = "${DEFAULT_THEME}";
    document.documentElement.lang = "${DEFAULT_LANGUAGE}";
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={DEFAULT_LANGUAGE}
      data-theme={DEFAULT_THEME}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <PreferencesProvider>
          <ToastProvider>{children}</ToastProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
