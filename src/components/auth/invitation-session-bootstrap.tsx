"use client";

import { useEffect, useState, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type InvitationSessionState = "invalid" | "loading" | "ready";

export function InvitationSessionBootstrap({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<InvitationSessionState>("loading");

  useEffect(() => {
    const establishInvitationSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setState("invalid");
          return;
        }

        window.location.replace("/invite");
        return;
      }

      const { data } = await supabase.auth.getSession();
      setState(data.session ? "ready" : "invalid");
    };

    void establishInvitationSession();
  }, []);

  if (state === "ready") {
    return <>{children}</>;
  }

  return (
    <Card aria-live="polite">
      <CardContent>
        {state === "loading" ? (
          <LoadingState label="Verifying invitation" lines={2} />
        ) : (
          <Alert assertive variant="danger">
            <AlertTitle>Invitation unavailable</AlertTitle>
            <AlertDescription>
              This invitation is invalid or has expired. Ask a BTLS administrator for a new
              invitation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
