import { DISPLAY_PRICES } from "@/lib/constants";
import { getConfig } from "@/lib/admin/config";

/**
 * Get display prices merging Redis overrides with hardcoded fallbacks.
 * Redis values take priority.
 */
export async function getDisplayPrices(): Promise<Record<string, number>> {
  const redisPrices = await getConfig<Record<string, number>>("config:display-prices", {});
  return { ...DISPLAY_PRICES, ...redisPrices };
}
