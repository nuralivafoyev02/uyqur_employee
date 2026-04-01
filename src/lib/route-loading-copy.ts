import type { AppLanguage } from "@/lib/preferences";

export type RouteLoadingSection =
  | "dashboard"
  | "reports"
  | "plans"
  | "employees"
  | "employeeProfile"
  | "settings";

type RouteLoadingCopy = {
  title: string;
  description: string;
};

const COPY: Record<AppLanguage, Record<RouteLoadingSection, RouteLoadingCopy>> = {
  uz: {
    dashboard: {
      title: "Asosiy",
      description: "Overview yuklanmoqda",
    },
    reports: {
      title: "Kunlik hisobotlar",
      description: "Hisobotlar yuklanmoqda",
    },
    plans: {
      title: "Vazifalar",
      description: "Vazifalar oqimi yuklanmoqda",
    },
    employees: {
      title: "Xodimlar",
      description: "Xodimlar ro'yxati yuklanmoqda",
    },
    employeeProfile: {
      title: "Xodim profili",
      description: "Xodim profili yuklanmoqda",
    },
    settings: {
      title: "Sozlamalar",
      description: "Profil sozlamalari yuklanmoqda",
    },
  },
  en: {
    dashboard: {
      title: "Home",
      description: "Loading overview",
    },
    reports: {
      title: "Daily Reports",
      description: "Loading reports",
    },
    plans: {
      title: "Tasks",
      description: "Loading task pipeline",
    },
    employees: {
      title: "Employees",
      description: "Loading employee list",
    },
    employeeProfile: {
      title: "Employee Profile",
      description: "Loading employee profile",
    },
    settings: {
      title: "Settings",
      description: "Loading profile settings",
    },
  },
};

export function getRouteLoadingCopy(
  section: RouteLoadingSection,
  language: AppLanguage,
) {
  return COPY[language][section];
}
