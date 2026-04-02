import { NextResponse, type NextRequest } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import { searchGlobalData } from "@/lib/queries/global-search";

export async function GET(request: NextRequest) {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const data = await searchGlobalData(viewer, q);

  return NextResponse.json(data);
}
