/**
 * safeInsert.ts — validated Supabase insert wrapper for the orders table.
 *
 * Enforces the contract layer before any DB write:
 *   1. Validates payload via order.validate.ts (rejects unknown + forbidden fields)
 *   2. Strips fields that are not in INSERT_ALLOWED_KEYS
 *   3. Performs the Supabase insert via admin client
 *   4. Returns a structured result — never throws
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { validateInsertPayload } from "@/lib/contracts/order.validate";

type SafeInsertResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: string[] };

export async function safeInsertOrder(
  raw: Record<string, unknown>
): Promise<SafeInsertResult> {
  // 1. Validate and strip payload
  const validation = validateInsertPayload(raw);
  if (!validation.ok) {
    console.error("[safeInsert] validation failed:", validation.error, validation.fields);
    return { ok: false, error: validation.error, fields: validation.fields };
  }

  const payload = validation.payload;

  // 2. Insert via admin client (bypasses RLS — only used server-side)
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("[safeInsert] Supabase INSERT failed:", error.message, error.code);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data.id };
}
