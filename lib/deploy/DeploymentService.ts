/**
 * lib/deploy/DeploymentService.ts
 *
 * CRM-4 / Phase 8 — AutoDeploy architecture stub.
 * Implementation deferred to CRM-5 sprint.
 *
 * Architecture:
 *   DeploymentService.queue(orderId)
 *     → validates order + build artifacts exist
 *     → writes DeploymentJob to deployment_queue table (future migration)
 *     → returns jobId
 *
 *   DeploymentService.status(jobId)
 *     → returns DeploymentJob status
 *
 *   DeploymentService.process(job)
 *     → downloads built ZIP
 *     → calls Vercel Deploy API
 *     → updates deployment_queue with result + URL
 *     → updates orders.project_url
 */

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

/**
 * Queue an order for deployment.
 * Not yet implemented — returns a stub response.
 */
export async function queueDeployment(_orderId: string): Promise<QueueResult> {
  // TODO (CRM-5): validate build artifacts, write to deployment_queue, trigger worker
  return { ok: false, error: "AutoDeploy not yet implemented. Coming in CRM-5." };
}

/**
 * Get the status of a deployment job.
 * Not yet implemented — returns a stub response.
 */
export async function getDeploymentStatus(_jobId: string): Promise<StatusResult> {
  // TODO (CRM-5): query deployment_queue table
  return { ok: false, error: "AutoDeploy not yet implemented. Coming in CRM-5." };
}

/**
 * Cancel a pending deployment job.
 * Not yet implemented.
 */
export async function cancelDeployment(_jobId: string): Promise<{ ok: boolean }> {
  // TODO (CRM-5): update deployment_queue set status = 'cancelled'
  return { ok: false };
}
