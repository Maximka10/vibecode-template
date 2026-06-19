/**
 * order.contract.ts — canonical source of truth for the orders table.
 *
 * Matches EXACT Supabase schema. No CRM fields. No legacy fields.
 * Any field not in ORDER_SCHEMA must never reach Supabase.
 */

import type { OrderStatus } from "@/types/orders";

export const ORDER_SCHEMA = {
  id: "uuid",
  created_at: "timestamp",
  updated_at: "timestamp",
  user_id: "uuid | null",
  status: "enum:OrderStatus",
  template_id: "string",
  template_name: "string | null",
  selected_options: "json | null",
  total_price: "number | null",
  primary_color: "string | null",
  bg_color: "string | null",
  notes: "string | null",
  cancel_reason: "string | null",
  cancelled_by: "string | null",
  cancelled_at: "timestamp | null",
} as const;

export type OrderSchemaKey = keyof typeof ORDER_SCHEMA;

/** Columns /api/lead may set on insert. */
export const INSERT_ALLOWED_KEYS = new Set<OrderSchemaKey>([
  "user_id",
  "status",
  "template_id",
  "template_name",
  "selected_options",
  "total_price",
  "primary_color",
  "bg_color",
  "notes",
]);

/** Columns admins may patch via PATCH /api/orders/[id]. Status is blocked — use workflow. */
export const METADATA_PATCH_ALLOWED_KEYS = new Set<OrderSchemaKey>([
  "notes",
  "updated_at",
  "cancel_reason",
  "cancelled_by",
  "cancelled_at",
]);

/** Delivery fields admins may set after order completion. */
export const DELIVERY_PATCH_ALLOWED_KEYS = new Set<OrderSchemaKey>([
  "notes",
  "updated_at",
]);

/**
 * Fields that must NEVER reach Supabase.
 * Includes all removed CRM fields and legacy pricing aliases.
 */
export const FORBIDDEN_FIELDS = new Set([
  // CRM fields (removed from DB)
  "client_name",
  "client_phone",
  "client_email",
  "client_telegram",
  "business_type",
  "selected_services",
  // Legacy pricing aliases
  "budget",
  "price",
  "estimated_price",
  "price_total",
  "amount",
  // Frontend camelCase variants (should never reach snake_case layer)
  "clientName",
  "clientPhone",
  "clientEmail",
  "clientTelegram",
  "businessType",
  "selectedServices",
]);

export const VALID_STATUSES: ReadonlyArray<OrderStatus> = [
  "new",
  "contacted",
  "in_progress",
  "waiting_client",
  "completed",
  "cancelled",
];
