import { NextRequest, NextResponse } from "next/server";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { getDeploymentLogs } from "@/lib/deploy/DeploymentService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { jobId } = await params;
  const logs = await getDeploymentLogs(jobId);
  return NextResponse.json({ ok: true, logs });
}
