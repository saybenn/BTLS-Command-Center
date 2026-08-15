import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.hoisted(() => vi.fn());
const setSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({ auth: { getSession, setSession } }),
}));

import { InvitationSessionBootstrap } from "@/components/auth/invitation-session-bootstrap";

const invitationFragment = "#access_token=access-token&refresh_token=refresh-token";

describe("InvitationSessionBootstrap", () => {
  beforeEach(() => {
    getSession.mockReset();
    setSession.mockReset();
    window.history.replaceState(null, "", "/invite");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/invite");
  });

  it("establishes an invitation session and removes the fragment before fixed navigation", async () => {
    window.history.replaceState(null, "", `/invite${invitationFragment}`);
    setSession.mockResolvedValue({ error: null });
    const replaceState = vi.spyOn(window.history, "replaceState");

    render(
      <InvitationSessionBootstrap>
        <p>Invitation form</p>
      </InvitationSessionBootstrap>,
    );

    await waitFor(() => {
      expect(setSession).toHaveBeenCalledWith({
        access_token: "access-token",
        refresh_token: "refresh-token",
      });
    });
    expect(replaceState).toHaveBeenCalledWith(null, "", "/invite");
    expect(window.location.hash).toBe("");
  });

  it("renders the form for an existing invitation session", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "existing" } } });

    render(
      <InvitationSessionBootstrap>
        <p>Invitation form</p>
      </InvitationSessionBootstrap>,
    );

    expect(await screen.findByText("Invitation form")).toBeVisible();
  });

  it.each([
    ["a missing session", null],
    ["an invalid invitation session", new Error("expired")],
  ])("shows the safe unavailable state for %s", async (_description, error) => {
    if (error) {
      window.history.replaceState(null, "", `/invite${invitationFragment}`);
      setSession.mockResolvedValue({ error });
    } else {
      getSession.mockResolvedValue({ data: { session: null } });
    }

    render(
      <InvitationSessionBootstrap>
        <p>Invitation form</p>
      </InvitationSessionBootstrap>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Invitation unavailable");
    expect(screen.queryByText("Invitation form")).not.toBeInTheDocument();
  });
});
