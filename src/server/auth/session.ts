import "server-only";

import type { AppUser } from "@/generated/prisma/client";

import { prisma } from "@/server/database/prisma";

import { createSupabaseServerClient } from "./supabase-server";

type ClaimsResult = {
  data: { claims?: { sub?: string } } | null;
  error: unknown;
};

type AuthenticatedAppUserDependencies = {
  getClaims: () => Promise<ClaimsResult>;
  findAppUser: (userId: string) => PromiseLike<AppUser | null>;
};

export async function requireAuthenticatedAppUserWith(
  dependencies: AuthenticatedAppUserDependencies,
) {
  const { data, error } = await dependencies.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    throw new Error("You must sign in to continue.");
  }

  const user = await dependencies.findAppUser(userId);

  if (!user) {
    throw new Error("Your account is not authorized for BTLS.");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Your BTLS account is disabled.");
  }

  return user;
}

export async function requireAuthenticatedAppUser() {
  const supabase = await createSupabaseServerClient();

  return requireAuthenticatedAppUserWith({
    getClaims: () => supabase.auth.getClaims(),
    findAppUser: (userId) => prisma.appUser.findUnique({ where: { id: userId } }),
  });
}

export async function getAuthenticatedAppUserResult(): Promise<
  { status: "active"; user: AppUser } | { status: "disabled" } | { status: "unauthorized" }
> {
  try {
    return { status: "active", user: await requireAuthenticatedAppUser() };
  } catch (error) {
    if (error instanceof Error && error.message === "Your BTLS account is disabled.") {
      return { status: "disabled" };
    }

    return { status: "unauthorized" };
  }
}
