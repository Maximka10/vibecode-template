export const ORDER_STATUSES = ["new", "contacted", "in_progress", "waiting_client", "completed", "cancelled"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_ACTIONS = ["CONFIRM_PAYMENT", "START_WORK", "REQUEST_CLIENT_INPUT", "RESUME_WORK", "COMPLETE_ORDER", "REOPEN_ORDER", "CANCEL_ORDER"] as const;
export type OrderAction = typeof ORDER_ACTIONS[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новая",
  contacted: "Связались",
  in_progress: "В работе",
  waiting_client: "Ожидает клиента",
  completed: "Готово",
  cancelled: "Отменена",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  waiting_client: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  completed: "bg-green-500/15 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
};

export const ACTION_LABELS: Record<OrderAction, string> = {
  CONFIRM_PAYMENT: "Подтвердить оплату",
  START_WORK: "Начать работу",
  REQUEST_CLIENT_INPUT: "Ожидать клиента",
  RESUME_WORK: "Возобновить работу",
  COMPLETE_ORDER: "Завершить заказ",
  REOPEN_ORDER: "Вернуть в работу",
  CANCEL_ORDER: "Отменить заказ",
};

// Which actions are available from each status (admin only, client actions excluded)
export const ADMIN_ACTIONS_BY_STATUS: Partial<Record<OrderStatus, OrderAction[]>> = {
  new: ["START_WORK", "CANCEL_ORDER"],
  contacted: ["START_WORK", "REQUEST_CLIENT_INPUT", "CANCEL_ORDER"],
  in_progress: ["REQUEST_CLIENT_INPUT", "COMPLETE_ORDER", "CANCEL_ORDER"],
  waiting_client: ["RESUME_WORK", "COMPLETE_ORDER", "CANCEL_ORDER"],
  completed: ["REOPEN_ORDER"],
  cancelled: [],
};
