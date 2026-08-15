import "server-only";

import { z } from "zod";

import { getAuthRedirectUrl } from "./redirects";
import { createSupabaseAdminClient } from "./supabase-admin";

const invitationInputSchema = z.object({ email: z.string().trim().email() });

export type CreateInvitationInput = z.infer<typeof invitationInputSchema>;

export async function createInvitation(
  input: CreateInvitationInput,
): Promise<{ email: string; userId: string }> {
  const { email } = invitationInputSchema.parse(input);
  const { data, error } = await createSupabaseAdminClient().auth.admin.inviteUserByEmail(email, {
    redirectTo: getAuthRedirectUrl("/invite"),
  });

  if (error || !data.user) {
    throw error ?? new Error("Supabase Auth did not create an invitation.");
  }

  return { email: data.user.email ?? email, userId: data.user.id };
}
