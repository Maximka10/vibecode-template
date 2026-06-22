/**
 * lib/deploy/runDeployment.ts
 *
 * Core deployment logic — runs as a dedicated serverless invocation via
 * /api/internal/run-deployment to avoid Vercel execution lifetime limits.
 *
 * On success:
 *   - deployment_queue.status → "deployed", preview_url saved
 *   - orders.project_url updated
 *   - orders.status → "waiting_client"
 *   - Telegram notification sent to linked client
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { updateJob, appendLog } from "./DeploymentService";
import { sendMessage } from "@/lib/telegram/bot";

export async function runDeployment(jobId: string, orderId: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error("VERCEL_TOKEN not configured");

  const admin = createAdminClient();
  await updateJob(jobId, { status: "building" });
  await appendLog(jobId, "Starting build...");

  // Fetch order + project data + content edits
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

  await appendLog(jobId, "Generating project files...");

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

  // Poll for READY (up to 5 minutes)
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
    await appendLog(jobId, `Poll ${i + 1}/60: state=${state}`);
    if (state === "READY") { ready = true; break; }
    if (state === "ERROR" || state === "CANCELED") {
      throw new Error(`Vercel build failed: ${state}`);
    }
  }

  if (!ready) {
    await appendLog(jobId, "Warning: timed out waiting for READY state");
  }

  // Mark job done
  await updateJob(jobId, {
    status: "deployed",
    vercel_deployment_id: deployment.id,
    preview_url: previewUrl,
    deploy_url: previewUrl,
  });
  await appendLog(jobId, `Deployed: ${previewUrl}`);

  // Update order
  await admin
    .from("orders")
    .update({ project_url: previewUrl, status: "waiting_client" })
    .eq("id", orderId);
  await appendLog(jobId, "Order status → waiting_client");

  // Telegram notification
  const telegramClientId = order.telegram_client_id as string | null;
  if (telegramClientId) {
    const { data: tgClient } = await admin
      .from("telegram_clients")
      .select("chat_id")
      .eq("id", telegramClientId)
      .single();

    if (tgClient?.chat_id) {
      const notifyText =
        `🌐 *Предварительная версия вашего сайта готова!*\n\n` +
        `👀 Посмотрите и дайте обратную связь:\n${previewUrl}\n\n` +
        `Напишите нам здесь, если нужны правки.`;
      await sendMessage(tgClient.chat_id as number, notifyText);
      await appendLog(jobId, `Telegram notification sent to chat_id=${tgClient.chat_id}`);
    }
  }
}
