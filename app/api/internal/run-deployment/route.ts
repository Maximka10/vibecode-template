/**
 * POST /api/internal/run-deployment
 *
 * Internal-only route. Executes the full Vercel deployment pipeline
 * as a separate serverless invocation with its own execution lifetime,
 * avoiding the Vercel cutoff that kills fire-and-forget async work.
 *
 * Protected by TELEGRAM_WEBHOOK_SECRET (reuses existing internal secret).
 * Body: { jobId: string; orderId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { updateJob, appendLog } from "@/lib/deploy/DeploymentService";
import { runDeployment } from "@/lib/deploy/runDeployment";

export const maxDuration = 300; // 5 minutes — Vercel Pro/Enterprise only

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-internal-secret");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let body: { jobId?: string; orderId?: string };
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[run-deployment] failed:", message);
    await updateJob(jobId, { status: "failed", error: message });
    await appendLog(jobId, `Error: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
