/**
 * Order TypeScript type — mirrors exact Supabase orders table schema.
 * No CRM fields. No optional extensions.
 */

export type OrderStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "waiting_client"
  | "completed"
  | "cancelled";

export type OrderAction =
  | "CONFIRM_PAYMENT"
  | "START_WORK"
  | "REQUEST_CLIENT_INPUT"
  | "COMPLETE_ORDER"
  | "CANCEL_ORDER";

export interface Order {
  id: string;
  created_at: string;
  updated_at: string | null;
  status: OrderStatus;
  user_id: string | null;

  template_id: string;
  template_name: string | null;

  selected_options: Record<string, unknown> | null;
  notes: string | null;

  // Pricing — total_price is the ONLY valid field
  total_price: number | null;

  // Customisation
  primary_color: string | null;
  bg_color: string | null;
}

/** Keys allowed in an orders INSERT — must stay in sync with INSERT_ALLOWED_KEYS in contract. */
export const ORDER_ALLOWED_INSERT_KEYS: ReadonlyArray<keyof Omit<Order, "id" | "created_at">> = [
  "updated_at",
  "status",
  "user_id",
  "template_id",
  "template_name",
  "selected_options",
  "notes",
  "total_price",
  "primary_color",
  "bg_color",
];

/** Keys allowed in a metadata PATCH. */
export const ORDER_METADATA_PATCH_KEYS: ReadonlyArray<keyof Order> = [
  "notes",
  "updated_at",
];
