/**
 * safeInsert.ts — contract-enforced Supabase insert for orders table.
 *
 * Validates via order.validate.ts before every write.
 * HARD FAIL on any field not in DB schema — no silent stripping.
 * Error format: "FIELD_NOT_IN_DB_SCHEMA: <field>"
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { validateInsertPayload } from "@/lib/contracts/order.validate";

type SafeInsertResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: string[]; code: "FORBIDDEN" | "DB_ERROR" };

export async function safeInsertOrder(
  raw: Record<string, unknown>
): Promise<SafeInsertResult> {
  // Validate — hard fail on any unknown or forbidden field
  const validation = validateInsertPayload(raw);
  if (!validation.ok) {
    return { ok: false, error: validation.error, fields: validation.fields, code: "FORBIDDEN" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert(validation.payload)
    .select("id")
    .single();

  if (error) {
    console.error("[safeInsert] Supabase INSERT failed:", error.message, error.code);
    return { ok: false, error: error.message, code: "DB_ERROR" };
  }

  return { ok: true, id: data.id };
}
