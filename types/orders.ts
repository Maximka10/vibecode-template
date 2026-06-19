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
  status: OrderStatus;
  user_id: string | null;

  // Template
  template_id: string;
  template_name: string | null;

  // Client contact
  client_name: string | null;
  client_phone: string | null;
  client_telegram: string | null;

  // Order details
  selected_services: string[] | null;
  selected_options: Record<string, unknown> | null;
  notes: string | null;

  // Pricing — total_price is the ONLY valid pricing field; budget is forbidden
  total_price: number | null;

  // Customization
  primary_color: string | null;
  bg_color: string | null;

  // Delivery
  project_url: string | null;
  domain: string | null;
  launch_date: string | null;
  admin_url: string | null;
}

export const ORDER_ALLOWED_INSERT_KEYS: ReadonlyArray<keyof Omit<Order, "id" | "created_at">> = [
  "status",
  "user_id",
  "template_id",
  "template_name",
  "client_name",
  "client_phone",
  "client_telegram",
  "selected_services",
  "selected_options",
  "notes",
  "total_price",
  "primary_color",
  "bg_color",
  "project_url",
  "domain",
  "launch_date",
  "admin_url",
];

export const ORDER_METADATA_PATCH_KEYS: ReadonlyArray<keyof Order> = [
  "project_url",
  "domain",
  "notes",
  "launch_date",
  "admin_url",
];
