"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { THEME_STORAGE_KEY } from "./theme-script";

export const themePreferences = ["dark", "light", "system"] as const;

export type ThemePreference = (typeof themePreferences)[number];

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return themePreferences.some((theme) => theme === value);
}

function getStoredThemePreference(): ThemePreference {
  const documentTheme = document.documentElement.dataset.theme;

  if (isThemePreference(documentTheme)) {
    return documentTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (isThemePreference(storedTheme)) {
      return storedTheme;
    }
  } catch {
    // Local storage may be unavailable in private or restricted browsing contexts.
  }

  return "dark";
}

function applyThemePreference(theme: ThemePreference, systemPrefersLight?: boolean) {
  const prefersLight =
    systemPrefersLight ?? window.matchMedia("(prefers-color-scheme: light)").matches;
  const resolvedTheme = theme === "system" ? (prefersLight ? "light" : "dark") : theme;

  document.documentElement.classList.toggle("light", resolvedTheme === "light");
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof document === "undefined") {
      return "dark";
    }

    return getStoredThemePreference();
  });

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (event: MediaQueryListEvent) => {
      applyThemePreference("system", event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Theme selection should still work when persistence is unavailable.
    }

    applyThemePreference(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [setTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
