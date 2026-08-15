import "server-only";

export const authAnalyticsEvents = [
  "auth.sign_in_succeeded",
  "auth.sign_in_failed",
  "auth.invitation_accepted",
] as const;

export type AuthAnalyticsEvent = (typeof authAnalyticsEvents)[number];

export async function recordAuthAnalyticsEvent(_event: AuthAnalyticsEvent): Promise<void> {
  // Production analytics delivery is intentionally unconfigured for Feature 04.
  void _event;
}
