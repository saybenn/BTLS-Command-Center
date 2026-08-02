import { afterEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY, themeInitializerScript } from "@/components/theme/theme-script";

describe("theme initializer", () => {
  afterEach(() => {
    document.documentElement.classList.remove("light");
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("applies a persisted light preference before React hydrates", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    new Function(themeInitializerScript)();

    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("resolves the system preference before React hydrates", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    window.localStorage.setItem(THEME_STORAGE_KEY, "system");

    new Function(themeInitializerScript)();

    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement.dataset.theme).toBe("system");
  });
});
