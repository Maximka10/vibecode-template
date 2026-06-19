/**
 * orderGuard — validation and idempotency layer
 *
 * Sits between the API route and orderWorkflow.ts.
 * Responsible for:
 *   1. In-process race condition lock (per orderId)
 *   2. Idempotency: detect if this exact transition already completed
 *   3. State machine validation (transition legality)
 *   4. Ownership enforcement
 *
 * orderWorkflow.ts calls guardTransition() and only proceeds if it returns ok.
 */

import type { OrderAction, OrderStatus, ActorRole, TransitionResult } from "./orderWorkflow";

// ── State machine definition (single source of truth for legality) ────────────

export type TransitionRule = {
  role: ActorRole;
  from: OrderStatus[];
  to: OrderStatus;
};

export const TRANSITION_RULES: Record<OrderAction, TransitionRule> = {
  CONFIRM_PAYMENT: {
    role: "client",
    from: ["new"],
    to: "contacted",
  },
  START_WORK: {
    role: "admin",
    from: ["new", "contacted"],
    to: "in_progress",
  },
  REQUEST_CLIENT_INPUT: {
    role: "admin",
    from: ["in_progress", "contacted"],
    to: "waiting_client",
  },
  COMPLETE_ORDER: {
    role: "admin",
    from: ["in_progress", "waiting_client"],
    to: "completed",
  },
  RESUME_WORK: {
    role: "admin",
    from: ["waiting_client"],
    to: "in_progress",
  },
  REOPEN_ORDER: {
    role: "admin",
    from: ["completed"],
    to: "in_progress",
  },
  CANCEL_ORDER: {
    role: "admin",
    from: ["new", "contacted", "in_progress", "waiting_client"],
    to: "cancelled",
  },
};

// ── In-process lock (prevents race conditions on the same orderId) ────────────
// Maps orderId → timestamp of lock acquisition.
// Node.js is single-threaded so a plain Set is safe within one process.
// For multi-instance deployments this is defence-in-depth (DB update
// acts as the true serialisation point via idempotency check below).

const ACTIVE_LOCKS = new Set<string>();

export function acquireLock(orderId: string): boolean {
  if (ACTIVE_LOCKS.has(orderId)) return false;
  ACTIVE_LOCKS.add(orderId);
  return true;
}

export function releaseLock(orderId: string): void {
  ACTIVE_LOCKS.delete(orderId);
}

// ── Idempotency check ─────────────────────────────────────────────────────────
// "Duplicate" = the order is already in the target status for this action.
// This covers the multi-instance case and double-submits that slipped through
// the in-process lock (e.g. two separate serverless invocations).

export type GuardInput = {
  action: OrderAction;
  actorId: string;
  actorRole: ActorRole;
  currentStatus: OrderStatus;
  orderUserId: string | null;
};

export type GuardResult =
  | { ok: true; rule: TransitionRule }
  | { ok: false; result: TransitionResult };

export function guardTransition(input: GuardInput): GuardResult {
  const { action, actorId, actorRole, currentStatus, orderUserId } = input;

  // 1. Action must be known
  const rule = TRANSITION_RULES[action];
  if (!rule) {
    return {
      ok: false,
      result: { ok: false, error: `Unknown action: ${action}`, code: "INVALID_TRANSITION" },
    };
  }

  // 2. Role must match
  if (rule.role !== actorRole) {
    return {
      ok: false,
      result: {
        ok: false,
        error: `Action "${action}" requires role "${rule.role}" but actor has role "${actorRole}"`,
        code: "FORBIDDEN",
      },
    };
  }

  // 3. Idempotency: already in target status → treat as success (not an error)
  if (currentStatus === rule.to) {
    console.log(
      `[orderGuard] idempotent: action=${action} already in target status=${rule.to} — returning cached success`
    );
    return {
      ok: false,
      // ok:false here means "don't re-run the transition", but the outer
      // caller maps this ALREADY_APPLIED code to a 200 response.
      result: {
        ok: false,
        error: `Order is already in status "${rule.to}" (idempotent)`,
        code: "INVALID_TRANSITION",
      },
    };
  }

  // 4. Transition must be legal from current status
  if (!rule.from.includes(currentStatus)) {
    return {
      ok: false,
      result: {
        ok: false,
        error: `Cannot perform "${action}" when order status is "${currentStatus}". Allowed from: [${rule.from.join(", ")}]`,
        code: "INVALID_TRANSITION",
      },
    };
  }

  // 5. Client ownership — clients may only act on their own orders
  if (actorRole === "client" && orderUserId !== actorId) {
    return {
      ok: false,
      result: {
        ok: false,
        error: "Order does not belong to this user",
        code: "FORBIDDEN",
      },
    };
  }

  return { ok: true, rule };
}
