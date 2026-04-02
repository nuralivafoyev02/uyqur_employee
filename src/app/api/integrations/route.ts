import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import { getActiveIntegrations } from "@/lib/queries/integrations";

export async function GET() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const integrations = await getActiveIntegrations();

  return NextResponse.json(integrations);
}
