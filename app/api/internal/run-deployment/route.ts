/**
 * POST /api/internal/run-deployment — EXPERIMENTAL / DISABLED (CRM-6 freeze)
 *
 * Automatic deployment is temporarily disabled. This route returns 503.
 * Re-enable: remove the early return below, uncomment the restore block in
 * app/api/orders/[id]/deploy/route.ts, and set VERCEL_TOKEN env var.
 *
 * Protected by TELEGRAM_WEBHOOK_SECRET (reuses existing internal secret).
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-internal-secret");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  return NextResponse.json(
    { disabled: true, message: "Automatic deployment temporarily disabled. Use ZIP export instead." },
    { status: 503 }
  );
}

/*
// ── Restore block — uncomment to re-enable auto-deployment ────────────────────
// Also restore imports: updateJob, appendLog from DeploymentService; runDeployment from runDeployment

async function runHandler(req: NextRequest): Promise<NextResponse> {
  const { updateJob, appendLog } = await import("@/lib/deploy/DeploymentService");
  const { runDeployment } = await import("@/lib/deploy/runDeployment");

  let body: { jobId: string; orderId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const { jobId, orderId } = body;
  if (!jobId || !orderId) {
    return NextResponse.json({ ok: false, error: "jobId and orderId required" }, { status: 400 });
  }

  try {
    await runDeployment(jobId, orderId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[run-deployment] failed:", message);
    await updateJob(jobId, { status: "failed", error: message });
    await appendLog(jobId, `Error: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
// ─────────────────────────────────────────────────────────────────────────────
*/
