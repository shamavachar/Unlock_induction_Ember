// App Constants & Enums

export const ORDER_STATUS = {
  WAITING: "Waiting",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLORS = {
  Waiting: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-300",
    badge: "badge-waiting",
    label: "Waiting in Queue",
  },
  Preparing: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    badge: "badge-preparing",
    label: "Preparing in Kitchen",
  },
  Ready: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    badge: "badge-ready",
    label: "Ready for Pickup",
  },
  Completed: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    badge: "badge-completed",
    label: "Completed",
  },
  Cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-300",
    badge: "badge-cancelled",
    label: "Cancelled",
  },
};

export const CATEGORIES = [
  "All",
  "Snacks",
  "Meals",
  "Beverages",
  "Fast Food",
  "South Indian",
  "Desserts",
  "Other",
];

export const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash on Counter", icon: "Banknote" },
  { id: "UPI", label: "UPI / QR Code", icon: "QrCode" },
  { id: "Card", label: "Debit/Credit Card", icon: "CreditCard" },
  { id: "Wallet", label: "College Wallet", icon: "Wallet" },
];

export const SOCKET_EVENTS = {
  ORDER_CREATED: "order:created",
  ORDER_STATUS_UPDATED: "order:status_updated",
  ORDER_MY_STATUS_CHANGED: "order:my_status_changed",
  MENU_STOCK_UPDATED: "menu:stock_updated",
  CANTEEN_CHAOS_ALERT: "canteen:chaos_alert",
  QUEUE_UPDATED: "queue:updated",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
};
