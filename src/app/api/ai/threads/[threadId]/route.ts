import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import {
  deleteAssistantThread,
  getAssistantThreadDetail,
  logAssistantFailure,
} from "@/lib/assistant-service";
import { createActionClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function GET(
  _request: Request,
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
    const detail = await getAssistantThreadDetail(supabase, viewer.id, threadId);

    if (!detail) {
      return NextResponse.json({ message: "AI chat topilmadi." }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    await logAssistantFailure(supabase, viewer, "ai.thread_load.failed", {
      threadId,
      error: error instanceof Error ? error.message : "AI chatni yuklab bo'lmadi.",
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "AI chatni yuklab bo'lmadi.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
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
    const deleted = await deleteAssistantThread(supabase, viewer.id, threadId);

    if (!deleted) {
      return NextResponse.json({ message: "AI chat topilmadi." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logAssistantFailure(supabase, viewer, "ai.thread_delete.failed", {
      threadId,
      error: error instanceof Error ? error.message : "AI chatni o'chirib bo'lmadi.",
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "AI chatni o'chirib bo'lmadi.",
      },
      { status: 500 },
    );
  }
}
