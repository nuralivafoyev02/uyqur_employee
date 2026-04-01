import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";

export async function GET() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    fullName: viewer.full_name,
    email: viewer.email,
    role: viewer.role,
    title: viewer.title,
    department: viewer.department,
    profileStatus: viewer.profile_status,
  });
}
