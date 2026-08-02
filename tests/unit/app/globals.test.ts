import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

const semanticTokens = [
  "background",
  "background-subtle",
  "sidebar",
  "sidebar-elevated",
  "surface",
  "surface-raised",
  "surface-secondary",
  "surface-tertiary",
  "surface-interactive",
  "surface-hover",
  "surface-selected",
  "surface-overlay",
  "border",
  "border-strong",
  "border-subtle",
  "border-focus",
  "text-primary",
  "text-secondary",
  "text-muted",
  "text-disabled",
  "text-inverse",
  "accent",
  "accent-hover",
  "accent-active",
  "accent-soft",
  "accent-muted",
  "accent-foreground",
  "accent-ring",
  "intelligence",
  "intelligence-hover",
  "intelligence-soft",
  "intelligence-foreground",
  "success",
  "info",
  "warning",
  "danger",
  "focus-ring",
  "selection",
];

function getBlock(selector: string) {
  const match = globalStyles.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`));

  return match?.[1] ?? "";
}

describe("global semantic tokens", () => {
  it("defines every foundation token in light and dark themes", () => {
    const lightTokens = getBlock(":root\\.light");
    const darkTokens = getBlock(":root,\\s*\\.dark");

    for (const token of semanticTokens) {
      expect(lightTokens).toContain(`--${token}:`);
      expect(darkTokens).toContain(`--${token}:`);
    }
  });

  it("maps foundation tokens into Tailwind semantic color utilities", () => {
    for (const token of semanticTokens.filter((token) => token !== "selection")) {
      expect(globalStyles).toContain(`--color-${token}: var(--${token});`);
    }
  });
});
