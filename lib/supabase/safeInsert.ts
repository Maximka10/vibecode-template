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
  | { ok: false; error: string; fields?: string[]; code: "FORBIDDEN" | "DB_ERROR"; rawError?: unknown; payload?: Record<string, unknown> };

export async function safeInsertOrder(
  raw: Record<string, unknown>
): Promise<SafeInsertResult> {
  // Validate — hard fail on any unknown or forbidden field
  const validation = validateInsertPayload(raw);
  if (!validation.ok) {
    return { ok: false, error: validation.error, fields: validation.fields, code: "FORBIDDEN" };
  }

  const admin = createAdminClient();

  // ── Guard: user_id must survive validation unchanged ──────────────────────
  const rawUserId = raw["user_id"];
  const validatedUserId = validation.payload["user_id"];
  console.log("[safeInsert] raw.user_id:", rawUserId);
  console.log("[safeInsert] validated.user_id:", validatedUserId);
  if (rawUserId !== validatedUserId) {
    console.error(
      "[safeInsert] user_id was mutated by validateInsertPayload —",
      "raw:", rawUserId, "→ validated:", validatedUserId
    );
  }

  // ── Detect if user_id was silently dropped ────────────────────────────────
  if (!("user_id" in validation.payload) || validation.payload["user_id"] == null) {
    console.error("[safeInsert] user_id is missing or null in validated payload — INSERT will violate RLS");
  }

  console.log("[safeInsert] final payload keys:", Object.keys(validation.payload));
  console.log("[safeInsert] full payload (safe fields):", {
    user_id: validation.payload["user_id"],
    template_id: validation.payload["template_id"],
    status: validation.payload["status"],
    has_selected_options: !!validation.payload["selected_options"],
  });

  const { data, error } = await admin
    .from("orders")
    .insert(validation.payload)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message, code: "DB_ERROR", rawError: error, payload: validation.payload };
  }

  return { ok: true, id: data.id };
}
