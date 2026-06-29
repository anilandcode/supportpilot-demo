import type { BillingInterval, BillingTierKey } from "@/lib/enterprise/types";

export function parseBillingTier(value: unknown): BillingTierKey | null {
  return value === "launch" || value === "pro" || value === "enterprise" ? value : null;
}

export function parseBillingInterval(value: unknown): BillingInterval {
  return value === "annual" ? "annual" : "monthly";
}
