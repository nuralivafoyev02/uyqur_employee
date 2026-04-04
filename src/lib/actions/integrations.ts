"use server";

import { revalidatePath } from "next/cache";

import { hasRole, requireViewer } from "@/lib/auth";
import {
  validateClickUpConfig,
  getClickUpConfig,
  type ClickUpValidationResult,
} from "@/lib/clickup-service";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import { getIntegrationProvider } from "@/lib/integration-providers";
import { parseAppLanguage } from "@/lib/preferences";
import { getTelegramDigestCopy } from "@/lib/telegram-digest-copy";
import {
  buildTelegramCompletedPlansDigestMessage,
  buildTelegramReportsDigestMessage,
} from "@/lib/telegram-digest";
import { loadTelegramDigestOverview } from "@/lib/telegram-digest-data";
import { isMissingIntegrationsRelationError, toStringRecord } from "@/lib/queries/integrations";
import { createActionClient } from "@/lib/supabase/server";
import {
  getTelegramConfig,
  sendTelegramJsonLog,
  sendTelegramTextMessage,
  type TelegramConfig,
} from "@/lib/telegram-service";
import type { ActionState, FieldErrors } from "@/lib/validations";

function pushFieldError(
  errors: FieldErrors<string>,
  key: string,
  message: string,
) {
  errors[key] = [...(errors[key] ?? []), message];
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getClickUpValidationFeedback(
  copy: ReturnType<typeof getIntegrationsCopy>,
  result: Extract<ClickUpValidationResult, { ok: false }>,
) {
  switch (result.code) {
    case "config_missing":
      return {
        field: "apiKey",
        message: copy.messages.clickUpConfigMissing,
      };
    case "invalid_api_key":
      return {
        field: "apiKey",
        message: copy.messages.clickUpInvalidApiKey,
      };
    case "workspace_not_found":
      return {
        field: "workspaceId",
        message: copy.messages.clickUpWorkspaceMissing,
      };
    case "space_not_found":
      return {
        field: "spaceId",
        message: copy.messages.clickUpSpaceMissing,
      };
    default:
      return {
        field: null,
        message: result.detail || copy.messages.clickUpValidationFailed,
      };
  }
}

async function trySendTelegramAuditLog(
  config: Pick<TelegramConfig, "botToken" | "logChannelId"> | null,
  entry: Parameters<typeof sendTelegramJsonLog>[1],
) {
  if (!config?.logChannelId) {
    return;
  }

  try {
    await sendTelegramJsonLog(config, entry);
  } catch {
    // Logging must never block the main user flow.
  }
}

export async function saveIntegrationAction(
  _prevState: ActionState<string> | undefined,
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const copy = getIntegrationsCopy(language);

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: copy.messages.unauthorized,
    };
  }

  const providerValue = formData.get("provider");
  const providerEntry = typeof providerValue === "string" ? providerValue : "";
  const provider = getIntegrationProvider(providerEntry);

  if (!provider) {
    return {
      success: false,
      message: copy.messages.providerUnavailable,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: copy.messages.supabaseMissing,
    };
  }

  const { data: existingConnection, error: existingConnectionError } = await supabase
    .from("integration_connections")
    .select("id, public_config")
    .eq("provider", provider.slug)
    .maybeSingle();

  if (isMissingIntegrationsRelationError(existingConnectionError)) {
    return {
      success: false,
      message: copy.messages.tablesMissing,
    };
  }

  if (existingConnectionError) {
    return {
      success: false,
      message: existingConnectionError.message,
    };
  }

  const { data: existingCredential, error: existingCredentialError } = existingConnection?.id
    ? await supabase
      .from("integration_credentials")
      .select("secret_config")
      .eq("connection_id", existingConnection.id)
      .maybeSingle()
    : { data: null, error: null };

  if (isMissingIntegrationsRelationError(existingCredentialError)) {
    return {
      success: false,
      message: copy.messages.tablesMissing,
    };
  }

  if (existingCredentialError) {
    return {
      success: false,
      message: existingCredentialError.message,
    };
  }

  const existingPublicConfig = toStringRecord(existingConnection?.public_config);
  const existingSecretConfig = toStringRecord(existingCredential?.secret_config);
  const publicConfig: Record<string, string> = {};
  const secretConfig: Record<string, string> = {};
  const fieldErrors: FieldErrors<string> = {};

  provider.fields.forEach((field) => {
    const entry = formData.get(field.key);
    const nextValue = typeof entry === "string" ? entry.trim() : "";
    const previousValue =
      field.store === "secret" ? existingSecretConfig[field.key] : existingPublicConfig[field.key];

    if (field.type === "url" && nextValue && !isValidUrl(nextValue)) {
      pushFieldError(fieldErrors, field.key, copy.messages.invalidUrl(field.label[language]));
      return;
    }

    if (nextValue) {
      if (field.store === "secret") {
        secretConfig[field.key] = nextValue;
      } else {
        publicConfig[field.key] = nextValue;
      }
      return;
    }

    if (previousValue) {
      if (field.store === "secret") {
        secretConfig[field.key] = previousValue;
      } else {
        publicConfig[field.key] = previousValue;
      }
      return;
    }

    if (field.required ?? true) {
      pushFieldError(fieldErrors, field.key, copy.messages.requiredField(field.label[language]));
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: copy.messages.reviewFields,
      fieldErrors,
    };
  }

  if (provider.slug === "clickup") {
    const validationResult = await validateClickUpConfig({
      workspaceId: publicConfig.workspaceId ?? "",
      spaceId: publicConfig.spaceId ?? null,
      apiKey: secretConfig.apiKey ?? "",
    });

    if (!validationResult.ok) {
      const feedback = getClickUpValidationFeedback(copy, validationResult);

      if (feedback.field) {
        pushFieldError(fieldErrors, feedback.field, feedback.message);
      }

      return {
        success: false,
        message: feedback.message,
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      };
    }
  }

  const { data: savedConnection, error: saveConnectionError } = await supabase
    .from("integration_connections")
    .upsert(
      {
        provider: provider.slug,
        display_name: provider.displayName,
        status: "connected",
        public_config: publicConfig,
        created_by: viewer.id,
      },
      {
        onConflict: "provider",
      },
    )
    .select("id")
    .single();

  if (isMissingIntegrationsRelationError(saveConnectionError)) {
    return {
      success: false,
      message: copy.messages.tablesMissing,
    };
  }

  if (saveConnectionError || !savedConnection) {
    return {
      success: false,
      message: saveConnectionError?.message ?? copy.messages.reviewFields,
    };
  }

  const { error: saveCredentialError } = await supabase
    .from("integration_credentials")
    .upsert(
      {
        connection_id: savedConnection.id,
        provider: provider.slug,
        secret_config: secretConfig,
        updated_by: viewer.id,
      },
      {
        onConflict: "connection_id",
      },
    );

  if (isMissingIntegrationsRelationError(saveCredentialError)) {
    return {
      success: false,
      message: copy.messages.tablesMissing,
    };
  }

  if (saveCredentialError) {
    return {
      success: false,
      message: saveCredentialError.message,
    };
  }

  const savedTelegramLogConfig =
    provider.slug === "telegram" && secretConfig.botToken && publicConfig.logChannelId
      ? {
          botToken: secretConfig.botToken,
          logChannelId: publicConfig.logChannelId,
        }
      : await getTelegramConfig(supabase);

  await trySendTelegramAuditLog(savedTelegramLogConfig, {
    event: "integration.saved",
    status: "success",
    actor: {
      id: viewer.id,
      name: viewer.full_name,
    },
    data: {
      provider: provider.slug,
      publicConfig,
      hasSecretConfig: Object.keys(secretConfig).length > 0,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      provider.slug === "clickup"
        ? copy.messages.clickUpSaved
        : copy.messages.connectionSaved(provider.displayName),
  };
}

export async function disconnectIntegrationAction(
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const copy = getIntegrationsCopy(language);

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: copy.messages.unauthorized,
    };
  }

  const providerValue = formData.get("provider");
  const providerEntry = typeof providerValue === "string" ? providerValue : "";
  const provider = getIntegrationProvider(providerEntry);

  if (!provider) {
    return {
      success: false,
      message: copy.messages.providerUnavailable,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: copy.messages.supabaseMissing,
    };
  }

  const telegramConfig = await getTelegramConfig(supabase);

  const { error } = await supabase
    .from("integration_connections")
    .delete()
    .eq("provider", provider.slug);

  if (isMissingIntegrationsRelationError(error)) {
    return {
      success: false,
      message: copy.messages.tablesMissing,
    };
  }

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await trySendTelegramAuditLog(telegramConfig, {
    event: "integration.disconnected",
    status: "info",
    actor: {
      id: viewer.id,
      name: viewer.full_name,
    },
    data: {
      provider: provider.slug,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/integrations/${provider.slug}`);

  return {
    success: true,
    message: copy.messages.disconnected(provider.displayName),
  };
}

export async function sendTelegramTestMessageAction(
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const copy = getIntegrationsCopy(language);
  const providerValue = formData.get("provider");
  const providerEntry = typeof providerValue === "string" ? providerValue : "";

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: copy.messages.unauthorized,
    };
  }

  if (providerEntry !== "telegram") {
    return {
      success: false,
      message: copy.messages.telegramOnly,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: copy.messages.supabaseMissing,
    };
  }

  const telegramConfig = await getTelegramConfig(supabase);

  if (!telegramConfig) {
    return {
      success: false,
      message: copy.messages.telegramConfigMissing,
    };
  }

  const timestamp = new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const text =
    language === "en"
      ? `Uyqur Support ERP web app test message\nTime: ${timestamp}\nSent by: ${viewer.full_name}`
      : language === "ru"
        ? `Тестовое сообщение из веб-приложения Uyqur Support ERP\nВремя: ${timestamp}\nОтправил: ${viewer.full_name}`
        : `Uyqur Support ERP web app test xabari\nVaqt: ${timestamp}\nYuborgan: ${viewer.full_name}`;

  try {
    await sendTelegramTextMessage(telegramConfig, text);

    await trySendTelegramAuditLog(telegramConfig, {
      event: "telegram.test_message.sent",
      status: "success",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        source: "web_app",
        targetChatId: telegramConfig.chatId,
        preview: text,
      },
    });

    return {
      success: true,
      message: copy.messages.telegramTestSent,
    };
  } catch (error) {
    await trySendTelegramAuditLog(telegramConfig, {
      event: "telegram.test_message.failed",
      status: "error",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        source: "web_app",
        targetChatId: telegramConfig.chatId,
        error:
          error instanceof Error && error.message
            ? error.message
            : "Telegramga yuborishda xatolik yuz berdi.",
      },
    });

    return {
      success: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : "Telegramga yuborishda xatolik yuz berdi.",
    };
  }
}

export async function testClickUpConnectionAction(
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const copy = getIntegrationsCopy(language);
  const providerValue = formData.get("provider");
  const providerEntry = typeof providerValue === "string" ? providerValue : "";

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: copy.messages.unauthorized,
    };
  }

  if (providerEntry !== "clickup") {
    return {
      success: false,
      message: copy.messages.clickUpOnly,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: copy.messages.supabaseMissing,
    };
  }

  const clickUpConfig = await getClickUpConfig(supabase);

  if (!clickUpConfig) {
    return {
      success: false,
      message: copy.messages.clickUpConfigMissing,
    };
  }

  const validationResult = await validateClickUpConfig(clickUpConfig);

  if (!validationResult.ok) {
    const feedback = getClickUpValidationFeedback(copy, validationResult);

    await trySendTelegramAuditLog(await getTelegramConfig(supabase), {
      event: "clickup.connection_test.failed",
      status: "error",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        workspaceId: clickUpConfig.workspaceId,
        spaceId: clickUpConfig.spaceId,
        error: feedback.message,
      },
    });

    return {
      success: false,
      message: feedback.message,
    };
  }

  await trySendTelegramAuditLog(await getTelegramConfig(supabase), {
    event: "clickup.connection_test.sent",
    status: "success",
    actor: {
      id: viewer.id,
      name: viewer.full_name,
    },
    data: {
      workspaceId: clickUpConfig.workspaceId,
      spaceId: clickUpConfig.spaceId,
    },
  });

  return {
    success: true,
    message: copy.messages.clickUpReady,
  };
}

export async function sendTelegramDigestAction(
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const copy = getIntegrationsCopy(language);
  const digestCopy = getTelegramDigestCopy(language);
  const providerValue = formData.get("provider");
  const providerEntry = typeof providerValue === "string" ? providerValue : "";
  const kindEntry = formData.get("kind");
  const kind = typeof kindEntry === "string" ? kindEntry : "";

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: copy.messages.unauthorized,
    };
  }

  if (providerEntry !== "telegram") {
    return {
      success: false,
      message: copy.messages.telegramOnly,
    };
  }

  if (kind !== "reports" && kind !== "completed_plans") {
    return {
      success: false,
      message: copy.messages.reviewFields,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: copy.messages.supabaseMissing,
    };
  }

  const telegramConfig = await getTelegramConfig(supabase);

  if (!telegramConfig) {
    return {
      success: false,
      message: copy.messages.telegramConfigMissing,
    };
  }

  try {
    const overview = await loadTelegramDigestOverview(supabase);
    const payload =
      kind === "reports"
        ? buildTelegramReportsDigestMessage(language, overview)
        : buildTelegramCompletedPlansDigestMessage(language, overview);

    if (kind === "reports" && overview.reports.length === 0) {
      return {
        success: false,
        message: digestCopy.messages.reportsEmpty,
      };
    }

    if (kind === "completed_plans" && overview.completedPlans.length === 0) {
      return {
        success: false,
        message: digestCopy.messages.completedPlansEmpty,
      };
    }

    await sendTelegramTextMessage(telegramConfig, payload);

    await trySendTelegramAuditLog(telegramConfig, {
      event: `telegram.digest.${kind}.sent`,
      status: "success",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        kind,
        targetChatId: telegramConfig.chatId,
        reportsCount: overview.reports.length,
        completedPlansCount: overview.completedPlans.length,
        preview: payload,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/plans");
    revalidatePath("/integrations/telegram");

    return {
      success: true,
      message:
        kind === "reports"
          ? digestCopy.messages.reportsSent
          : digestCopy.messages.completedPlansSent,
    };
  } catch (error) {
    await trySendTelegramAuditLog(telegramConfig, {
      event: `telegram.digest.${kind}.failed`,
      status: "error",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        kind,
        targetChatId: telegramConfig.chatId,
        error:
          error instanceof Error && error.message
            ? error.message
            : "Telegramga yuborishda xatolik yuz berdi.",
      },
    });

    return {
      success: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : "Telegramga yuborishda xatolik yuz berdi.",
    };
  }
}
