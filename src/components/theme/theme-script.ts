export const THEME_STORAGE_KEY = "btls-theme";

export const themeInitializerScript = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const root = document.documentElement;
  let preference = "dark";

  try {
    const storedPreference = window.localStorage.getItem(storageKey);

    if (storedPreference === "dark" || storedPreference === "light" || storedPreference === "system") {
      preference = storedPreference;
    }
  } catch {
    // Local storage may be unavailable in private or restricted browsing contexts.
  }

  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const resolvedTheme = preference === "system" ? (prefersLight ? "light" : "dark") : preference;

  root.classList.toggle("light", resolvedTheme === "light");
  root.dataset.theme = preference;
})();
`;
