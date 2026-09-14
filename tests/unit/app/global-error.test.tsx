import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
}));

import GlobalError from "@/app/global-error";

describe("GlobalError", () => {
  it("keeps the dark semantic-token baseline and a retry action", () => {
    const markup = renderToStaticMarkup(<GlobalError reset={vi.fn()} />);
    const document = new DOMParser().parseFromString(markup, "text/html");
    const heading = document.querySelector("h1");
    const retryButton = document.querySelector("button");

    expect(heading?.textContent).toContain("Application unavailable");
    expect(retryButton?.textContent).toContain("Try again");
    expect(retryButton?.classList.contains("bg-accent")).toBe(true);
    expect(retryButton?.classList.contains("focus-visible:outline-focus-ring")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
