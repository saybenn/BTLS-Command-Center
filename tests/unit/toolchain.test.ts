import { describe, expect, it } from "vitest";

describe("test tooling", () => {
  it("provides the configured DOM matchers", () => {
    const element = document.createElement("p");

    element.textContent = "BTLS test tooling is ready";

    expect(element).toHaveTextContent("BTLS test tooling is ready");
  });
});
