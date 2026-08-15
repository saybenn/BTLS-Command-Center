import "server-only";

export type AuthSignInFailedCategory =
  "account_disabled" | "app_user_unavailable" | "invalid_credentials" | "provider_error";

export type ProductAnalyticsEvent =
  | { name: "auth.sign_in_succeeded" }
  | { category: AuthSignInFailedCategory; name: "auth.sign_in_failed" }
  | { name: "auth.invitation_accepted" };

export interface ProductAnalyticsAdapter {
  record(event: ProductAnalyticsEvent): Promise<void>;
}

export function createInMemoryProductAnalytics(): ProductAnalyticsAdapter & {
  events: ProductAnalyticsEvent[];
} {
  const events: ProductAnalyticsEvent[] = [];

  return {
    events,
    async record(event) {
      events.push(event);
    },
  };
}

const developmentAnalytics = createInMemoryProductAnalytics();
const productionNoopAnalytics: ProductAnalyticsAdapter = { async record() {} };
let testAnalytics: ProductAnalyticsAdapter | undefined;

function getProductAnalyticsAdapter(): ProductAnalyticsAdapter {
  if (testAnalytics) {
    return testAnalytics;
  }

  // Production collection is intentionally unconfigured for Feature 04.
  return process.env.NODE_ENV === "production" ? productionNoopAnalytics : developmentAnalytics;
}

export async function recordProductAnalyticsEvent(event: ProductAnalyticsEvent): Promise<void> {
  await getProductAnalyticsAdapter().record(event);
}

export function setProductAnalyticsAdapterForTests(
  adapter: ProductAnalyticsAdapter | undefined,
): void {
  testAnalytics = adapter;
}

export function getDevelopmentAnalyticsEvents(): readonly ProductAnalyticsEvent[] {
  return [...developmentAnalytics.events];
}
