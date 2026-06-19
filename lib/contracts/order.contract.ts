/**
 * order.contract.ts — canonical source of truth for the orders table.
 *
 * This file defines every field that may exist in Supabase's orders table.
 * All API routes, insert helpers, and the workflow engine must derive their
 * allowed-field sets from this file — never from ad-hoc local lists.
 *
 * FORBIDDEN FIELDS (schema drift culprits — must never reach Supabase):
 *   budget | price | estimated_price | price_total
 */

import type { OrderStatus } from "@/types/orders";

// ── Column types (informational, not enforced at runtime by TS alone) ─────────

export const ORDER_SCHEMA = {
  // Identity
  id: "uuid",
  created_at: "timestamp",
  updated_at: "timestamp",
  user_id: "uuid | null",
  status: "enum:OrderStatus",

  // Client contact
  client_name: "string | null",
  client_phone: "string | null",
  client_telegram: "string | null",

  // Template
  template_id: "string",
  template_name: "string | null",

  // Order details
  selected_services: "json | null",
  selected_options: "json | null",
  notes: "string | null",

  // Pricing — total_price is the ONLY valid field; budget/price/estimated_price are BANNED
  total_price: "number | null",

  // Customisation
  primary_color: "string | null",
  bg_color: "string | null",

  // Delivery metadata (admin-settable only)
  project_url: "string | null",
  domain: "string | null",
  launch_date: "string | null",
  admin_url: "string | null",
} as const;

export type OrderSchemaKey = keyof typeof ORDER_SCHEMA;

// ── Allowed column sets ────────────────────────────────────────────────────────

/** Columns the /api/lead insert may set (excludes server-generated fields). */
export const INSERT_ALLOWED_KEYS = new Set<OrderSchemaKey>([
  "user_id",
  "status",
  "client_name",
  "client_phone",
  "client_telegram",
  "template_id",
  "template_name",
  "selected_services",
  "selected_options",
  "notes",
  "total_price",
  "primary_color",
  "bg_color",
]);

/** Columns admins may patch via PATCH /api/orders/[id] (excludes status — use workflow). */
export const METADATA_PATCH_ALLOWED_KEYS = new Set<OrderSchemaKey>([
  "project_url",
  "domain",
  "notes",
  "launch_date",
  "admin_url",
  "updated_at",
]);

/** Fields that are explicitly banned everywhere in the codebase. */
export const FORBIDDEN_FIELDS = new Set([
  "budget",
  "price",
  "estimated_price",
  "price_total",
  "amount",
  "business_type",
  "client_email",
]);

// ── Valid statuses (mirrors types/orders.ts — kept in sync here for runtime use) ─

export const VALID_STATUSES: ReadonlyArray<OrderStatus> = [
  "new",
  "contacted",
  "in_progress",
  "waiting_client",
  "completed",
  "cancelled",
];
