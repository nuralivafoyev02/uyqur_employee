import { NextResponse, type NextRequest } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import { getReportsApiData } from "@/lib/queries/reports";

export async function GET(request: NextRequest) {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const data = await getReportsApiData(viewer, {
    date: searchParams.get("date") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    employeeId: searchParams.get("employeeId") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  return NextResponse.json(data);
}
