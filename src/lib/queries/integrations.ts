import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { loadTelegramDigestOverview } from "@/lib/telegram-digest-data";
import type { TelegramDigestOverview } from "@/lib/telegram-digest";
import { createServerComponentClient } from "@/lib/supabase/server";
import {
  getIntegrationProvider,
  sortIntegrationsByProviderOrder,
  type ActiveIntegrationSummary,
} from "@/lib/integration-providers";
import type { IntegrationConnection, Json } from "@/types/database";

type ConnectionRow = Pick<
  IntegrationConnection,
  "id" | "provider" | "display_name" | "status" | "public_config" | "created_at" | "updated_at"
>;

function isMissingIntegrationsRelationError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  if (error.code === "42P01" || error.code === "PGRST205") {
    return true;
  }

  const message = error.message?.toLowerCase() ?? "";

  return (
    message.includes("integration_connections") &&
    (message.includes("does not exist") || message.includes("could not find"))
  );
}

function toStringRecord(value: Json | null | undefined) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {} as Record<string, string>;
  }

  const entries = Object.entries(value).flatMap(([key, item]) => {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      return [[key, String(item)] as const];
    }

    return [];
  });

  return Object.fromEntries(entries);
}

function mapConnection(row: ConnectionRow): ActiveIntegrationSummary | null {
  const provider = getIntegrationProvider(row.provider);

  if (!provider) {
    return null;
  }

  return {
    id: row.id,
    provider: provider.slug,
    displayName: row.display_name || provider.displayName,
    status: row.status,
    publicConfig: toStringRecord(row.public_config),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveIntegrations(): Promise<ActiveIntegrationSummary[]> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const { data, error } = await supabase
    .from("integration_connections")
    .select("id, provider, display_name, status, public_config, created_at, updated_at")
    .eq("status", "connected")
    .order("created_at", { ascending: true });

  if (isMissingIntegrationsRelationError(error)) {
    return [];
  }

  if (error) {
    throw new Error(error.message);
  }

  const mapped = ((data ?? []) as ConnectionRow[])
    .map(mapConnection)
    .filter((item): item is ActiveIntegrationSummary => Boolean(item));

  return sortIntegrationsByProviderOrder(mapped);
}

export async function getActiveIntegrationByProvider(
  providerSlug: string,
): Promise<ActiveIntegrationSummary | null> {
  const provider = getIntegrationProvider(providerSlug);

  if (!provider) {
    return null;
  }

  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const { data, error } = await supabase
    .from("integration_connections")
    .select("id, provider, display_name, status, public_config, created_at, updated_at")
    .eq("provider", provider.slug)
    .eq("status", "connected")
    .maybeSingle();

  if (isMissingIntegrationsRelationError(error)) {
    return null;
  }

  if (error || !data) {
    return null;
  }

  return mapConnection(data as ConnectionRow);
}

export async function getTelegramDigestOverview(): Promise<TelegramDigestOverview | null> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  return loadTelegramDigestOverview(supabase);
}

export { isMissingIntegrationsRelationError, toStringRecord };
