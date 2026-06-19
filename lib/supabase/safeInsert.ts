/**
 * safeInsert.ts — validated Supabase insert wrapper for the orders table.
 *
 * Two-level enforcement:
 *   LEVEL 1 — HARD FAIL on FORBIDDEN_FIELDS (budget, business_type, client_email…)
 *             Returns error immediately, never touches DB.
 *   LEVEL 2 — STRIP + WARN unknown fields (fields not in INSERT_ALLOWED_KEYS)
 *             Logs "FORBIDDEN_FIELD_DETECTED: <field>" for each stripped key,
 *             then proceeds with the clean payload.
 *             This prevents schema cache errors from undiscovered missing columns
 *             while keeping the warning visible in server logs.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { FORBIDDEN_FIELDS, INSERT_ALLOWED_KEYS, type OrderSchemaKey } from "@/lib/contracts/order.contract";

type SafeInsertResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: string[]; code?: "FORBIDDEN" | "DB_ERROR" };

export async function safeInsertOrder(
  raw: Record<string, unknown>
): Promise<SafeInsertResult> {
  const keys = Object.keys(raw);

  // ── Level 1: hard fail on explicitly forbidden fields ─────────────────────
  const forbidden = keys.filter((k) => FORBIDDEN_FIELDS.has(k));
  if (forbidden.length > 0) {
    const msg = `FORBIDDEN_FIELD_DETECTED: ${forbidden.join(", ")}`;
    console.error(`[safeInsert] ${msg}`);
    return { ok: false, error: msg, fields: forbidden, code: "FORBIDDEN" };
  }

  // ── Level 2: strip unknown fields with warning ────────────────────────────
  const unknown = keys.filter((k) => !INSERT_ALLOWED_KEYS.has(k as OrderSchemaKey));
  if (unknown.length > 0) {
    for (const field of unknown) {
      console.warn(`[safeInsert] FORBIDDEN_FIELD_DETECTED: ${field} — stripped before insert`);
    }
  }

  // ── Build clean payload (only INSERT_ALLOWED_KEYS, drop undefined/null-ish) ─
  const payload: Record<string, unknown> = {};
  for (const key of INSERT_ALLOWED_KEYS) {
    if (key in raw && raw[key] !== undefined) {
      payload[key] = raw[key];
    }
  }

  // ── Insert ────────────────────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("[safeInsert] Supabase INSERT failed:", error.message, error.code);
    return { ok: false, error: error.message, code: "DB_ERROR" };
  }

  return { ok: true, id: data.id };
}
