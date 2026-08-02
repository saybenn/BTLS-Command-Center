import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeControl } from "@/components/theme/theme-control";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { THEME_STORAGE_KEY } from "@/components/theme/theme-script";

type MatchMediaController = {
  setMatches: (matches: boolean) => void;
};

function installMatchMedia(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches,
    media: "(prefers-color-scheme: light)",
    onchange: null,
    addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return {
    setMatches(nextMatches) {
      matches = nextMatches;
      Object.defineProperty(mediaQuery, "matches", { configurable: true, value: matches });

      for (const listener of listeners) {
        listener({ matches } as MediaQueryListEvent);
      }
    },
  };
}

function ThemeProbe() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <output>{theme}</output>
      <button type="button" onClick={() => setTheme("light")}>
        Use light
      </button>
    </>
  );
}

describe("ThemeProvider", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("light");
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("uses dark as the default theme", async () => {
    installMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("dark")).toBeVisible();
      expect(document.documentElement).not.toHaveClass("light");
      expect(document.documentElement.dataset.theme).toBe("dark");
    });
  });

  it("persists an explicit light preference", async () => {
    installMatchMedia(false);
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Use light" }));

    await waitFor(() => {
      expect(screen.getByText("light")).toBeVisible();
      expect(document.documentElement).toHaveClass("light");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });
  });

  it("follows the system preference only when system is selected", async () => {
    const media = installMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "system");
    document.documentElement.dataset.theme = "system";

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("system")).toBeVisible();
      expect(document.documentElement).toHaveClass("light");
    });

    media.setMatches(false);

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass("light");
    });
  });

  it("provides a labelled theme control", async () => {
    installMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeControl />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Theme" })).toBeVisible();
    });
  });

  it("generates unique label ids for repeated theme controls", async () => {
    installMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeControl />
        <ThemeControl />
      </ThemeProvider>,
    );

    await waitFor(() => {
      const labels = screen.getAllByText("Theme", { exact: true });
      const controls = screen.getAllByRole("combobox", { name: "Theme" });

      expect(labels[0]).toHaveAttribute("id");
      expect(labels[1]).toHaveAttribute("id");
      expect(labels[0].id).not.toBe(labels[1].id);
      expect(controls[0]).toHaveAttribute("aria-labelledby", labels[0].id);
      expect(controls[1]).toHaveAttribute("aria-labelledby", labels[1].id);
    });
  });
});
