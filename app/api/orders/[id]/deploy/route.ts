/**
 * POST /api/orders/[id]/deploy — queue a new deployment
 * GET  /api/orders/[id]/deploy — list deployments for this order
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { queueDeployment, getOrderDeployments } from "@/lib/deploy/DeploymentService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { id: orderId } = await params;
  const result = await queueDeployment(orderId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { id: orderId } = await params;
  const jobs = await getOrderDeployments(orderId);
  return NextResponse.json({ ok: true, jobs });
}
