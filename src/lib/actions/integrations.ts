"use server";

import { revalidatePath } from "next/cache";

import { hasRole, requireViewer } from "@/lib/auth";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import { getIntegrationProvider } from "@/lib/integration-providers";
import { parseAppLanguage } from "@/lib/preferences";
import { isMissingIntegrationsRelationError, toStringRecord } from "@/lib/queries/integrations";
import { createActionClient } from "@/lib/supabase/server";
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

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: copy.messages.connectionSaved(provider.displayName),
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

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/integrations/${provider.slug}`);

  return {
    success: true,
    message: copy.messages.disconnected(provider.displayName),
  };
}
