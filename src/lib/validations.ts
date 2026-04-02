import type {
  PlanPriority,
  PlanStatus,
  ReportStatus,
} from "@/types/database";

export type FieldErrors<TField extends string> = Partial<Record<TField, string[]>>;

export type ActionState<TField extends string = string> = {
  success: boolean;
  message?: string;
  fieldErrors?: FieldErrors<TField>;
  redirectTo?: string;
};

type ValidationResult<TData, TField extends string> = {
  data?: TData;
  fieldErrors?: FieldErrors<TField>;
};

type AuthFields = "fullName" | "email" | "password";
type ReportFields =
  | "reportDate"
  | "completedWork"
  | "currentWork"
  | "nextPlan"
  | "blockers"
  | "status";
type PlanFields =
  | "title"
  | "description"
  | "assigneeId"
  | "dueDate"
  | "priority"
  | "status";
type SuggestionFields = "title" | "description";
type ProfileFields = "fullName" | "title" | "department" | "profileStatus";

export type AuthPayload = {
  fullName?: string;
  email: string;
  password: string;
};

export type ReportPayload = {
  reportDate: string;
  completedWork: string;
  currentWork: string;
  nextPlan: string;
  blockers: string;
  status: ReportStatus;
};

export type PlanPayload = {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  priority: PlanPriority;
  status: PlanStatus;
};

export type ProfilePayload = {
  fullName: string;
  title: string;
  department: string;
  profileStatus: string;
};

export type SuggestionPayload = {
  title: string;
  description: string;
};

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function pushError<TField extends string>(
  errors: FieldErrors<TField>,
  key: TField,
  message: string,
) {
  errors[key] = [...(errors[key] ?? []), message];
}

function hasErrors<TField extends string>(errors: FieldErrors<TField>) {
  return Object.keys(errors).length > 0;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function validateAuthForm(
  formData: FormData,
  mode: "login" | "register",
): ValidationResult<AuthPayload, AuthFields> {
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const fullName = getValue(formData, "fullName");

  const errors: FieldErrors<AuthFields> = {};

  if (mode === "register" && fullName.length < 2) {
    pushError(errors, "fullName", "Ism kamida 2 ta belgidan iborat bo'lsin.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    pushError(errors, "email", "To'g'ri email kiriting.");
  }

  if (password.length < 8) {
    pushError(errors, "password", "Parol kamida 8 ta belgidan iborat bo'lsin.");
  }

  if (hasErrors(errors)) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      ...(mode === "register" ? { fullName } : {}),
      email,
      password,
    },
  };
}

export function validateReportForm(
  formData: FormData,
): ValidationResult<ReportPayload, ReportFields> {
  const reportDate = getValue(formData, "reportDate");
  const completedWork = getValue(formData, "completedWork");
  const currentWork = getValue(formData, "currentWork");
  const nextPlan = getValue(formData, "nextPlan");
  const blockers = getValue(formData, "blockers");
  const rawStatus = getValue(formData, "status");

  const errors: FieldErrors<ReportFields> = {};

  if (!isIsoDate(reportDate)) {
    pushError(errors, "reportDate", "Sana noto'g'ri formatda.");
  }

  if (completedWork.length < 8) {
    pushError(errors, "completedWork", "Bajarilgan ishlar qismini to'ldiring.");
  }

  if (currentWork.length < 8) {
    pushError(errors, "currentWork", "Joriy ishlar qismini to'ldiring.");
  }

  if (nextPlan.length < 8) {
    pushError(errors, "nextPlan", "Keyingi reja qismini to'ldiring.");
  }

  if (!["done", "in_progress", "blocked"].includes(rawStatus)) {
    pushError(errors, "status", "Holat noto'g'ri tanlangan.");
  }

  if (hasErrors(errors)) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      reportDate,
      completedWork,
      currentWork,
      nextPlan,
      blockers,
      status: rawStatus as ReportStatus,
    },
  };
}

export function validatePlanForm(
  formData: FormData,
): ValidationResult<PlanPayload, PlanFields> {
  const title = getValue(formData, "title");
  const description = getValue(formData, "description");
  const assigneeId = getValue(formData, "assigneeId");
  const dueDate = getValue(formData, "dueDate");
  const rawPriority = getValue(formData, "priority");
  const rawStatus = getValue(formData, "status");

  const errors: FieldErrors<PlanFields> = {};

  if (title.length < 3) {
    pushError(errors, "title", "Vazifa nomi kamida 3 ta belgi bo'lsin.");
  }

  if (assigneeId.length < 10) {
    pushError(errors, "assigneeId", "Ijrochi tanlang.");
  }

  if (dueDate && !isIsoDate(dueDate)) {
    pushError(errors, "dueDate", "Deadline noto'g'ri formatda.");
  }

  if (!["low", "medium", "high"].includes(rawPriority)) {
    pushError(errors, "priority", "Prioritet noto'g'ri tanlangan.");
  }

  if (!["todo", "in_progress", "done", "blocked"].includes(rawStatus)) {
    pushError(errors, "status", "Status noto'g'ri tanlangan.");
  }

  if (hasErrors(errors)) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      title,
      description,
      assigneeId,
      dueDate,
      priority: rawPriority as PlanPriority,
      status: rawStatus as PlanStatus,
    },
  };
}

export function validateProfileForm(
  formData: FormData,
): ValidationResult<ProfilePayload, ProfileFields> {
  const fullName = getValue(formData, "fullName");
  const title = getValue(formData, "title");
  const department = getValue(formData, "department");
  const profileStatus = getValue(formData, "profileStatus");

  const errors: FieldErrors<ProfileFields> = {};

  if (fullName.length < 2) {
    pushError(errors, "fullName", "Ism kamida 2 ta belgidan iborat bo'lsin.");
  }

  if (profileStatus.length > 60) {
    pushError(errors, "profileStatus", "Profil statusi 60 ta belgidan oshmasin.");
  }

  if (hasErrors(errors)) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      fullName,
      title,
      department,
      profileStatus,
    },
  };
}

export function validateSuggestionForm(
  formData: FormData,
): ValidationResult<SuggestionPayload, SuggestionFields> {
  const title = getValue(formData, "title");
  const description = getValue(formData, "description");
  const errors: FieldErrors<SuggestionFields> = {};

  if (title.length < 3) {
    pushError(errors, "title", "Taklif sarlavhasi kamida 3 ta belgidan iborat bo'lsin.");
  }

  if (title.length > 120) {
    pushError(errors, "title", "Taklif sarlavhasi 120 ta belgidan oshmasin.");
  }

  if (description.length > 1500) {
    pushError(errors, "description", "Batafsil izoh 1500 ta belgidan oshmasin.");
  }

  if (hasErrors(errors)) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      title,
      description,
    },
  };
}

export function validateProfileStatusForm(
  formData: FormData,
): ValidationResult<Pick<ProfilePayload, "profileStatus">, "profileStatus"> {
  const profileStatus = getValue(formData, "profileStatus");
  const errors: FieldErrors<"profileStatus"> = {};

  if (profileStatus.length > 60) {
    pushError(errors, "profileStatus", "Profil statusi 60 ta belgidan oshmasin.");
  }

  if (hasErrors(errors)) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      profileStatus,
    },
  };
}
