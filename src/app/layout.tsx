import type { Metadata } from "next";

import "@/app/globals.css";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/preferences";

export const metadata: Metadata = {
  title: {
    default: "Uyqur Employee Tracking",
    template: "%s | Uyqur Employee Tracking",
  },
  description:
    "Ichki employee tracking tizimi: hisobotlar, rejalar va boshqaruv ko'rinishi.",
};

const themeInitScript = `
  try {
    const storedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    document.documentElement.dataset.theme = storedTheme === "dark" ? "dark" : "${DEFAULT_THEME}";
  } catch {
    document.documentElement.dataset.theme = "${DEFAULT_THEME}";
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
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
