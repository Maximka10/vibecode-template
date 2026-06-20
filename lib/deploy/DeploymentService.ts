/**
 * lib/deploy/DeploymentService.ts
 * Vercel Deploy API integration (CRM-5)
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

async function appendLog(jobId: string, message: string) {
  const admin = createAdminClient();
  await admin.from("deployment_logs").insert({ job_id: jobId, message });
}

async function updateJob(
  jobId: string,
  patch: Partial<Omit<DeploymentJob, "id" | "order_id" | "created_at">>
) {
  const admin = createAdminClient();
  await admin
    .from("deployment_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", jobId);
}

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

  runDeployment(job.id as string, orderId).catch(async (err: unknown) => {
    await updateJob(job.id as string, { status: "failed", error: String(err) });
  });

  return { ok: true, jobId: job.id as string };
}

async function runDeployment(jobId: string, orderId: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error("VERCEL_TOKEN not configured");

  const admin = createAdminClient();
  await updateJob(jobId, { status: "building" });
  await appendLog(jobId, "Starting build...");

  const [orderRes, pdRes, editsRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", orderId).single(),
    admin.from("project_data").select("*").eq("order_id", orderId).maybeSingle(),
    admin.from("content_edits").select("sections").eq("order_id", orderId).maybeSingle(),
  ]);

  if (orderRes.error || !orderRes.data) throw new Error("Order not found");
  const order = orderRes.data as Record<string, unknown>;
  const pd = (pdRes.data ?? {}) as Record<string, unknown>;
  const briefSections = ((order.brief_json as Record<string, unknown> | null)?.sections ?? []) as unknown[];
  const sections = (editsRes.data?.sections ?? briefSections) as unknown[];

  const { generateProject } = await import("@/lib/export/generateProject");
  type SiteJson = Parameters<typeof generateProject>[0];

  const pdBranding = pd.branding as Record<string, string> | null | undefined;

  const site: SiteJson = {
    meta: {
      title: String(pd.seo_title ?? pd.company_name ?? order.template_name ?? ""),
      description: String(pd.seo_description ?? pd.company_description ?? ""),
      domain: String(pd.domain_name ?? ""),
    },
    branding: {
      primary: pdBranding?.primary_color ?? "#6366f1",
      secondary: pdBranding?.secondary_color ?? "#8b5cf6",
    },
    font: (pd.font as string | undefined) ?? undefined,
    contact_link: (pd.contact_link as string | undefined) ?? undefined,
    company: {
      name: String(pd.company_name ?? order.template_name ?? "Компания"),
      description: String(pd.company_description ?? ""),
      address: String(pd.address ?? ""),
      working_hours: String(pd.working_hours ?? ""),
    },
    contacts: {
      phone: String(pd.phone ?? ""),
      email: String(pd.email ?? ""),
      telegram: String(pd.telegram ?? ""),
      whatsapp: (pd.whatsapp as string | undefined) ?? undefined,
    },
    sections: sections as SiteJson["sections"],
  };

  await appendLog(jobId, "Generating project files...");
  const files = generateProject(site);
  const fileEntries = Object.entries(files);
  await appendLog(jobId, `Generated ${fileEntries.length} files`);

  await updateJob(jobId, { status: "deploying" });
  await appendLog(jobId, "Uploading to Vercel...");

  const apiUrl = new URL("https://api.vercel.com/v13/deployments");
  if (teamId) apiUrl.searchParams.set("teamId", teamId);

  const body = {
    name: `vibecode-${orderId.slice(0, 8)}`,
    files: fileEntries.map(([filePath, content]) => ({
      file: filePath,
      data: Buffer.from(content).toString("base64"),
      encoding: "base64",
    })),
    projectSettings: { framework: "nextjs" },
    target: "preview",
  };

  const res = await fetch(apiUrl.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const deployment = (await res.json()) as { id: string; url: string };
  await appendLog(jobId, `Vercel deployment created: ${deployment.id}`);

  const previewUrl = `https://${deployment.url}`;

  // Poll for ready state (up to 5 minutes)
  let ready = false;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const pollUrl = new URL(`https://api.vercel.com/v13/deployments/${deployment.id}`);
    if (teamId) pollUrl.searchParams.set("teamId", teamId);
    const poll = await fetch(pollUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!poll.ok) continue;
    const d = (await poll.json()) as { readyState?: string; state?: string };
    const state = (d.readyState ?? d.state ?? "").toUpperCase();
    if (state === "READY") { ready = true; break; }
    if (state === "ERROR" || state === "CANCELED") {
      throw new Error(`Vercel build failed: ${state}`);
    }
  }

  if (!ready) {
    await appendLog(jobId, "Warning: timed out waiting for READY state");
  }

  await updateJob(jobId, {
    status: "deployed",
    vercel_deployment_id: deployment.id,
    preview_url: previewUrl,
    deploy_url: previewUrl,
  });

  await admin.from("orders").update({ project_url: previewUrl }).eq("id", orderId);
  await appendLog(jobId, `Deployed: ${previewUrl}`);
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
