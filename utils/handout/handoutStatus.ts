import type { HandoutStatus } from "@/types/handoutTypes";

// Tailwind class পুরো লেখা থাকতে হয়, তাই আলাদা করে map করে রাখা হয়েছে
export const HANDOUT_STATUS_STYLE: Record<
  HandoutStatus,
  { badge: string; text: string; border: string }
> = {
  draft: {
    badge: "bg-yellow-500/15",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500",
  },
  published: {
    badge: "bg-accent-transparent",
    text: "text-accent",
    border: "border-accent",
  },
  auto_hidden: {
    badge: "bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500",
  },
  under_review: {
    badge: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500",
  },
};
