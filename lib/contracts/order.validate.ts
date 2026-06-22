/**
 * order.validate.ts — runtime payload validation before any DB write.
 *
 * Used by /api/lead (insert) and /api/orders/[id] (metadata patch).
 * Throws structured errors — callers must handle them and return HTTP 400.
 */

import {
  FORBIDDEN_FIELDS,
  INSERT_ALLOWED_KEYS,
  METADATA_PATCH_ALLOWED_KEYS,
  type OrderSchemaKey,
} from "./order.contract";

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly fields?: string[]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

type ValidationResult =
  | { ok: true; payload: Record<OrderSchemaKey, unknown> }
  | { ok: false; error: string; fields: string[] };

function checkForbidden(keys: string[]): string[] {
  return keys.filter((k) => FORBIDDEN_FIELDS.has(k));
}

/**
 * Validates a raw insert payload (from /api/lead).
 * - Rejects any field not in INSERT_ALLOWED_KEYS.
 * - Rejects any FORBIDDEN_FIELDS (budget, price, etc.).
 * - Strips undefined values.
 * Returns a clean payload safe to pass to Supabase.
 */
export function validateInsertPayload(
  raw: Record<string, unknown>
): ValidationResult {
  const keys = Object.keys(raw);

  // 1. Check forbidden fields first (clearer error message)
  const forbidden = checkForbidden(keys);
  if (forbidden.length > 0) {
    return {
      ok: false,
      error: `Forbidden fields are not allowed: ${forbidden.join(", ")}`,
      fields: forbidden,
    };
  }

  // 2. Check for unknown fields
  const unknown = keys.filter((k) => !INSERT_ALLOWED_KEYS.has(k as OrderSchemaKey));
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Unknown fields rejected: ${unknown.join(", ")}`,
      fields: unknown,
    };
  }

  // 3. Build clean payload (only allowed keys, drop undefineds)
  const payload: Record<string, unknown> = {};
  for (const key of INSERT_ALLOWED_KEYS) {
    if (key in raw && raw[key] !== undefined) {
      payload[key] = raw[key];
    }
  }

  return { ok: true, payload: payload as Record<OrderSchemaKey, unknown> };
}

/**
 * Validates a metadata-only PATCH payload (from /api/orders/[id]).
 * - Rejects status (must use workflow engine).
 * - Rejects any field not in METADATA_PATCH_ALLOWED_KEYS.
 */
export function validatePatchPayload(
  raw: Record<string, unknown>
): ValidationResult {
  const keys = Object.keys(raw);

  // Status is hard-blocked
  if ("status" in raw) {
    return {
      ok: false,
      error: "Direct status updates are not allowed. Use POST /api/orders/transition.",
      fields: ["status"],
    };
  }

  const forbidden = checkForbidden(keys);
  if (forbidden.length > 0) {
    return {
      ok: false,
      error: `Forbidden fields are not allowed: ${forbidden.join(", ")}`,
      fields: forbidden,
    };
  }

  const unknown = keys.filter(
    (k) => !METADATA_PATCH_ALLOWED_KEYS.has(k as OrderSchemaKey)
  );
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Unknown fields rejected: ${unknown.join(", ")}`,
      fields: unknown,
    };
  }

  const payload: Record<string, unknown> = {};
  for (const key of METADATA_PATCH_ALLOWED_KEYS) {
    if (key in raw && raw[key] !== undefined) {
      payload[key] = raw[key];
    }
  }

  return { ok: true, payload: payload as Record<OrderSchemaKey, unknown> };
}
