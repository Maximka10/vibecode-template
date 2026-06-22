/**
 * order.validate.ts — runtime validation before any DB write.
 *
 * HARD RULE: any field not in the allowed set throws immediately.
 * NO silent stripping. NO fallback. Unknown field = error with field name.
 */

import {
  FORBIDDEN_FIELDS,
  INSERT_ALLOWED_KEYS,
  METADATA_PATCH_ALLOWED_KEYS,
  type OrderSchemaKey,
} from "./order.contract";

type ValidationResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string; fields: string[] };

function checkForbidden(keys: string[]): string[] {
  return keys.filter((k) => FORBIDDEN_FIELDS.has(k));
}

/**
 * Validates a raw insert payload (from /api/lead).
 * Hard fails on any field not in INSERT_ALLOWED_KEYS.
 */
export function validateInsertPayload(raw: Record<string, unknown>): ValidationResult {
  const keys = Object.keys(raw);

  // 1. Forbidden fields (removed CRM fields, legacy aliases)
  const forbidden = checkForbidden(keys);
  if (forbidden.length > 0) {
    const msg = `FIELD_NOT_IN_DB_SCHEMA: ${forbidden.join(", ")}`;
    console.error(`[validate] ${msg}`);
    return { ok: false, error: msg, fields: forbidden };
  }

  // 2. Unknown fields (not in allowed set)
  const unknown = keys.filter((k) => !INSERT_ALLOWED_KEYS.has(k as OrderSchemaKey));
  if (unknown.length > 0) {
    const msg = `FIELD_NOT_IN_DB_SCHEMA: ${unknown.join(", ")}`;
    console.error(`[validate] ${msg}`);
    return { ok: false, error: msg, fields: unknown };
  }

  // 3. Build clean payload
  const payload: Record<string, unknown> = {};
  for (const key of INSERT_ALLOWED_KEYS) {
    if (key in raw && raw[key] !== undefined) {
      payload[key] = raw[key];
    }
  }

  return { ok: true, payload };
}

/**
 * Validates a metadata PATCH payload (from /api/orders/[id]).
 * Status is hard-blocked — must use workflow engine.
 */
export function validatePatchPayload(raw: Record<string, unknown>): ValidationResult {
  const keys = Object.keys(raw);

  if ("status" in raw) {
    return {
      ok: false,
      error: "Direct status updates are not allowed. Use POST /api/orders/transition.",
      fields: ["status"],
    };
  }

  const forbidden = checkForbidden(keys);
  if (forbidden.length > 0) {
    const msg = `FIELD_NOT_IN_DB_SCHEMA: ${forbidden.join(", ")}`;
    console.error(`[validate] ${msg}`);
    return { ok: false, error: msg, fields: forbidden };
  }

  const unknown = keys.filter(
    (k) => !METADATA_PATCH_ALLOWED_KEYS.has(k as OrderSchemaKey)
  );
  if (unknown.length > 0) {
    const msg = `FIELD_NOT_IN_DB_SCHEMA: ${unknown.join(", ")}`;
    console.error(`[validate] ${msg}`);
    return { ok: false, error: msg, fields: unknown };
  }

  const payload: Record<string, unknown> = {};
  for (const key of METADATA_PATCH_ALLOWED_KEYS) {
    if (key in raw && raw[key] !== undefined) {
      payload[key] = raw[key];
    }
  }

  return { ok: true, payload };
}
