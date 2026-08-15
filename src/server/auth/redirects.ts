import "server-only";

import { requireApplicationUrlEnvironment } from "@/server/env";

const fixedAuthPaths = ["/dashboard", "/invite", "/reset-password", "/sign-in"] as const;
const postAuthPaths = ["/dashboard", "/invite", "/reset-password"] as const;

export type FixedAuthPath = (typeof fixedAuthPaths)[number];
export type PostAuthPath = (typeof postAuthPaths)[number];

export function isAllowedPostAuthPath(value: string | null | undefined): value is PostAuthPath {
  return postAuthPaths.some((path) => path === value);
}

export function getFixedAuthUrl(path: FixedAuthPath): string {
  if (!fixedAuthPaths.includes(path)) {
    throw new Error("The requested auth destination is not allowlisted.");
  }
  const { appUrl } = requireApplicationUrlEnvironment();
  return new URL(path, `${appUrl}/`).toString();
}

export function getAuthRedirectUrl(path: PostAuthPath): string {
  return getFixedAuthUrl(path);
}
