/**
 * POST /api/orders/[id]/deploy — DISABLED (CRM-6 freeze)
 * GET  /api/orders/[id]/deploy — DISABLED (CRM-6 freeze)
 *
 * Automatic deployment is temporarily disabled. Use ZIP export instead.
 * Re-enable by removing the DISABLED_RESPONSE guard and restoring the
 * queueDeployment / getOrderDeployments calls below.
 */
import { NextRequest, NextResponse } from "next/server";

const DISABLED_RESPONSE = NextResponse.json(
  { disabled: true, message: "Automatic deployment temporarily disabled. Use ZIP export instead." },
  { status: 503 }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest, _ctx: unknown) {
  return DISABLED_RESPONSE;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest, _ctx: unknown) {
  return DISABLED_RESPONSE;
}

/*
// ── Restore block — uncomment to re-enable auto-deployment ────────────────────
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { queueDeployment, getOrderDeployments } from "@/lib/deploy/DeploymentService";

export async function POST(req, { params }) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  const { id: orderId } = await params;
  const result = await queueDeployment(orderId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function GET(req, { params }) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  const { id: orderId } = await params;
  const jobs = await getOrderDeployments(orderId);
  return NextResponse.json({ ok: true, jobs });
}
// ─────────────────────────────────────────────────────────────────────────────
*/
