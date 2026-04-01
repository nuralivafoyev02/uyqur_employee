import { NextResponse, type NextRequest } from "next/server";

import { hasRole, getCurrentViewer } from "@/lib/auth";
import { getEmployeesApiData } from "@/lib/queries/employees";

export async function GET(request: NextRequest) {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const data = await getEmployeesApiData(viewer, {
    q: searchParams.get("q") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  return NextResponse.json(data);
}
