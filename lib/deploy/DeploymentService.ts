/**
 * lib/deploy/DeploymentService.ts
 * Vercel Deploy API integration (CRM-5/6)
 *
 * Fire-and-forget pattern: POST /api/orders/[id]/deploy creates a queue row
 * and immediately dispatches /api/internal/run-deployment as a separate
 * serverless invocation with its own lifetime (avoids Vercel execution cutoff).
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type DeploymentStatus =
  | "pending"
  | "building"
  | "deploying"
  | "deployed"
  | "failed"
  | "cancelled";

export type DeploymentJob = {
  id: string;
  order_id: string;
  status: DeploymentStatus;
  deploy_url: string | null;
  preview_url: string | null;
  vercel_deployment_id: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export type QueueResult =
  | { ok: true; jobId: string }
  | { ok: false; error: string };

export type StatusResult =
  | { ok: true; job: DeploymentJob }
  | { ok: false; error: string };

export async function appendLog(jobId: string, message: string) {
  const admin = createAdminClient();
  await admin.from("deployment_logs").insert({ job_id: jobId, message });
}

export async function updateJob(
  jobId: string,
  patch: Partial<Omit<DeploymentJob, "id" | "order_id" | "created_at">>
) {
  const admin = createAdminClient();
  await admin
    .from("deployment_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", jobId);
}

/** Create a deployment_queue row and dispatch the internal runner. Returns immediately. */
export async function queueDeployment(orderId: string): Promise<QueueResult> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { ok: false, error: "VERCEL_TOKEN not configured" };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("deployment_queue")
    .select("id, status")
    .eq("order_id", orderId)
    .in("status", ["pending", "building", "deploying"])
    .maybeSingle();

  if (existing) {
    return { ok: false, error: `Deployment already in progress (${existing.status})` };
  }

  const { data: job, error } = await admin
    .from("deployment_queue")
    .insert({ order_id: orderId, status: "pending" })
    .select()
    .single();

  if (error || !job) return { ok: false, error: error?.message ?? "Failed to create job" };

  const jobId = job.id as string;

  // Dispatch to a dedicated serverless invocation — do not await
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (baseUrl) {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    fetch(`${baseUrl}/api/internal/run-deployment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-internal-secret": secret } : {}),
      },
      body: JSON.stringify({ jobId, orderId }),
    }).catch((err: unknown) => {
      console.error("[deploy/queue] dispatch failed:", err);
    });
  } else {
    // Local fallback — run in-process (no Vercel lifetime concern locally)
    import("./runDeployment").then(({ runDeployment }) => {
      runDeployment(jobId, orderId).catch(async (err: unknown) => {
        await updateJob(jobId, { status: "failed", error: String(err) });
      });
    });
  }

  return { ok: true, jobId };
}

export async function getDeploymentStatus(jobId: string): Promise<StatusResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("deployment_queue")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Job not found" };
  return { ok: true, job: data as DeploymentJob };
}

export async function cancelDeployment(jobId: string): Promise<{ ok: boolean }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("deployment_queue")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", jobId)
    .in("status", ["pending"]);
  return { ok: !error };
}

export async function getOrderDeployments(orderId: string): Promise<DeploymentJob[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("deployment_queue")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as DeploymentJob[];
}

export async function getDeploymentLogs(
  jobId: string
): Promise<{ message: string; created_at: string }[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("deployment_logs")
    .select("message, created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
