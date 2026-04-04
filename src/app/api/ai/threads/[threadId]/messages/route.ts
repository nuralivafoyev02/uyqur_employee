import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import {
  logAssistantFailure,
  sendAssistantMessage,
} from "@/lib/assistant-service";
import { createActionClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase ulanishi sozlanmagan." },
      { status: 500 },
    );
  }

  const { threadId } = await context.params;

  try {
    const payload = (await request.json().catch(() => null)) as
      | {
          content?: unknown;
        }
      | null;
    const content =
      payload && typeof payload.content === "string" ? payload.content.trim() : "";

    if (!content) {
      return NextResponse.json({ message: "Xabar bo'sh bo'lmasligi kerak." }, { status: 400 });
    }

    const response = await sendAssistantMessage(supabase, viewer, threadId, content);
    return NextResponse.json(response);
  } catch (error) {
    await logAssistantFailure(supabase, viewer, "ai.message_send.failed", {
      threadId,
      error: error instanceof Error ? error.message : "AI xabarini yuborib bo'lmadi.",
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "AI xabarini yuborib bo'lmadi.",
      },
      { status: 500 },
    );
  }
}
