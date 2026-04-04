import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { toStringRecord } from "@/lib/queries/integrations";
import type { Database } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;

export type TelegramConfig = {
  connectionId: string;
  chatId: string;
  botToken: string;
  botUsername: string | null;
};

export function getTelegramMessageError(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "description" in payload &&
    typeof payload.description === "string"
  ) {
    return payload.description;
  }

  return "Telegramga yuborishda xatolik yuz berdi.";
}

export async function getTelegramConfig(
  supabase: DatabaseClient,
): Promise<TelegramConfig | null> {
  const { data: connection } = await supabase
    .from("integration_connections")
    .select("id, public_config")
    .eq("provider", "telegram")
    .eq("status", "connected")
    .maybeSingle();

  if (!connection) {
    return null;
  }

  const { data: credential } = await supabase
    .from("integration_credentials")
    .select("secret_config")
    .eq("connection_id", connection.id)
    .maybeSingle();

  const publicConfig = toStringRecord(connection.public_config);
  const secretConfig = toStringRecord(credential?.secret_config);
  const chatId = publicConfig.chatId?.trim();
  const botToken = secretConfig.botToken?.trim();

  if (!chatId || !botToken) {
    return null;
  }

  return {
    connectionId: connection.id,
    chatId,
    botToken,
    botUsername: publicConfig.botUsername?.trim() || null,
  };
}

export async function sendTelegramTextMessage(
  config: Pick<TelegramConfig, "botToken" | "chatId">,
  text: string,
) {
  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: config.chatId,
      text,
    }),
  });

  const responseJson = await response.json().catch(() => null);

  if (!response.ok || !responseJson?.ok) {
    throw new Error(getTelegramMessageError(responseJson));
  }

  return {
    messageId:
      responseJson?.result?.message_id != null ? String(responseJson.result.message_id) : null,
  };
}
