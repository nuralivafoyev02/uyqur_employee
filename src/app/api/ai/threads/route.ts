import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import {
  createAssistantThread,
  listAssistantThreads,
  logAssistantFailure,
} from "@/lib/assistant-service";
import { createActionClient } from "@/lib/supabase/server";

export async function GET() {
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

  const threads = await listAssistantThreads(supabase, viewer.id);
  return NextResponse.json(threads);
}

export async function POST() {
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

  try {
    const thread = await createAssistantThread(supabase, viewer.id);
    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    await logAssistantFailure(supabase, viewer, "ai.thread_create.failed", {
      error: error instanceof Error ? error.message : "AI chat yaratib bo'lmadi.",
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "AI chat yaratib bo'lmadi.",
      },
      { status: 500 },
    );
  }
}
