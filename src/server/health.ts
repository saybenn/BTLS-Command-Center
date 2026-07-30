export const publicHealthStatus = { status: "ok" } as const;

export function getPublicHealthStatus() {
  return publicHealthStatus;
}
