import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { toStringRecord } from "@/lib/queries/integrations";
import type { Database } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;

export type ClickUpConfig = {
  connectionId: string;
  workspaceId: string;
  spaceId: string | null;
  apiKey: string;
};

export type ClickUpValidationResult =
  | {
      ok: true;
      workspaceId: string;
      spaceId: string | null;
    }
  | {
      ok: false;
      code:
        | "config_missing"
        | "invalid_api_key"
        | "workspace_not_found"
        | "space_not_found"
        | "request_failed";
      detail?: string;
    };

type ClickUpResponse = {
  response: Response;
  payload: unknown;
};

type ClickUpSpace = {
  id: string;
  name: string | null;
};

function getClickUpErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidates = ["err", "error", "message"] as const;

  for (const key of candidates) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function extractSpaces(payload: unknown): ClickUpSpace[] {
  if (!payload || typeof payload !== "object" || !("spaces" in payload)) {
    return [];
  }

  const spaces = (payload as { spaces?: unknown }).spaces;

  if (!Array.isArray(spaces)) {
    return [];
  }

  return spaces.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    if (!("id" in item) || typeof item.id !== "string") {
      return [];
    }

    return [
      {
        id: item.id,
        name: "name" in item && typeof item.name === "string" ? item.name : null,
      },
    ];
  });
}

async function clickUpRequest(pathname: string, apiKey: string): Promise<ClickUpResponse> {
  const response = await fetch(`https://api.clickup.com/api/v2${pathname}`, {
    method: "GET",
    headers: {
      Authorization: apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  return {
    response,
    payload,
  };
}

function getFailureResult(
  status: number,
  payload: unknown,
  notFoundCode: "workspace_not_found" | "space_not_found",
): ClickUpValidationResult {
  if (status === 401 || status === 403) {
    return {
      ok: false,
      code: "invalid_api_key",
      detail: getClickUpErrorMessage(payload) ?? undefined,
    };
  }

  if (status === 404) {
    return {
      ok: false,
      code: notFoundCode,
      detail: getClickUpErrorMessage(payload) ?? undefined,
    };
  }

  return {
    ok: false,
    code: "request_failed",
    detail: getClickUpErrorMessage(payload) ?? undefined,
  };
}

export async function getClickUpConfig(
  supabase: DatabaseClient,
): Promise<ClickUpConfig | null> {
  const { data: connection } = await supabase
    .from("integration_connections")
    .select("id, public_config")
    .eq("provider", "clickup")
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
  const workspaceId = publicConfig.workspaceId?.trim();
  const spaceId = publicConfig.spaceId?.trim() || null;
  const apiKey = secretConfig.apiKey?.trim();

  if (!workspaceId || !apiKey) {
    return null;
  }

  return {
    connectionId: connection.id,
    workspaceId,
    spaceId,
    apiKey,
  };
}

export async function validateClickUpConfig(
  config: Pick<ClickUpConfig, "workspaceId" | "spaceId" | "apiKey">,
): Promise<ClickUpValidationResult> {
  const workspaceId = config.workspaceId.trim();
  const spaceId = config.spaceId?.trim() || null;
  const apiKey = config.apiKey.trim();

  if (!workspaceId || !apiKey) {
    return {
      ok: false,
      code: "config_missing",
    };
  }

  try {
    const accountResponse = await clickUpRequest("/user", apiKey);

    if (!accountResponse.response.ok) {
      return getFailureResult(accountResponse.response.status, accountResponse.payload, "workspace_not_found");
    }

    const spacesResponse = await clickUpRequest(
      `/team/${encodeURIComponent(workspaceId)}/space`,
      apiKey,
    );

    if (!spacesResponse.response.ok) {
      return getFailureResult(spacesResponse.response.status, spacesResponse.payload, "workspace_not_found");
    }

    if (!spaceId) {
      return {
        ok: true,
        workspaceId,
        spaceId: null,
      };
    }

    const spaces = extractSpaces(spacesResponse.payload);

    if (spaces.length > 0) {
      const matchedSpace = spaces.some((space) => space.id === spaceId);

      if (!matchedSpace) {
        return {
          ok: false,
          code: "space_not_found",
        };
      }

      return {
        ok: true,
        workspaceId,
        spaceId,
      };
    }

    const spaceResponse = await clickUpRequest(
      `/space/${encodeURIComponent(spaceId)}/list`,
      apiKey,
    );

    if (!spaceResponse.response.ok) {
      return getFailureResult(spaceResponse.response.status, spaceResponse.payload, "space_not_found");
    }

    return {
      ok: true,
      workspaceId,
      spaceId,
    };
  } catch (error) {
    return {
      ok: false,
      code: "request_failed",
      detail: error instanceof Error && error.message ? error.message : undefined,
    };
  }
}
