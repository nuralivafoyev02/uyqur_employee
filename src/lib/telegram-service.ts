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
  logChannelId: string | null;
};

type TelegramMessageOptions = {
  chatId?: string;
  parseMode?: "MarkdownV2" | "HTML" | "Markdown";
};

type TelegramJsonLogEntry = {
  event: string;
  status: "success" | "error" | "info";
  actor?: {
    id?: string;
    name?: string | null;
  } | null;
  data?: Record<string, unknown>;
};

const TELEGRAM_LOG_CHUNK_LIMIT = 2600;

function chunkText(value: string, size: number) {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }

  return chunks;
}

function escapeMarkdownV2CodeContent(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function toTelegramJsonCodeBlock(value: string) {
  return `\`\`\`json\n${escapeMarkdownV2CodeContent(value)}\n\`\`\``;
}

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
    logChannelId: publicConfig.logChannelId?.trim() || null,
  };
}

export async function sendTelegramTextMessage(
  config: Pick<TelegramConfig, "botToken" | "chatId">,
  text: string,
  options?: TelegramMessageOptions,
) {
  const body: Record<string, unknown> = {
    chat_id: options?.chatId ?? config.chatId,
    text,
  };

  if (options?.parseMode) {
    body.parse_mode = options.parseMode;
  }

  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

export async function sendTelegramJsonLog(
  config: Pick<TelegramConfig, "botToken" | "logChannelId">,
  entry: TelegramJsonLogEntry,
) {
  const logChannelId = config.logChannelId?.trim();

  if (!logChannelId) {
    return false;
  }

  const timestamp = new Date().toISOString();
  const logPayload = {
    app: "uyqur_support_erp",
    type: "telegram_log",
    event: entry.event,
    status: entry.status,
    timestamp,
    actor: entry.actor ?? null,
    data: entry.data ?? null,
  };

  const serialized = JSON.stringify(logPayload, null, 2);

  if (serialized.length <= TELEGRAM_LOG_CHUNK_LIMIT) {
    await sendTelegramTextMessage(
      {
        botToken: config.botToken,
        chatId: logChannelId,
      },
      toTelegramJsonCodeBlock(serialized),
      {
        parseMode: "MarkdownV2",
      },
    );

    return true;
  }

  const chunks = chunkText(serialized, TELEGRAM_LOG_CHUNK_LIMIT);

  for (const [index, chunk] of chunks.entries()) {
    await sendTelegramTextMessage(
      {
        botToken: config.botToken,
        chatId: logChannelId,
      },
      toTelegramJsonCodeBlock(
        JSON.stringify(
          {
            app: "uyqur_support_erp",
            type: "telegram_log_chunk",
            event: entry.event,
            status: entry.status,
            timestamp,
            part: index + 1,
            totalParts: chunks.length,
            chunk,
          },
          null,
          2,
        ),
      ),
      {
        parseMode: "MarkdownV2",
      },
    );
  }

  return true;
}
