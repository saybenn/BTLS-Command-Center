import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DevelopmentStatusLayout from "@/app/development-status/layout";
import DevelopmentStatusPage from "@/app/development-status/page";

const { getServerEnvironment, isProductionEnvironment, notFound } = vi.hoisted(() => ({
  getServerEnvironment: vi.fn(),
  isProductionEnvironment: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/server/env", () => ({ getServerEnvironment, isProductionEnvironment }));

describe("development status area", () => {
  beforeEach(() => {
    getServerEnvironment.mockReturnValue({
      applicationEnvironment: "development",
      nodeEnvironment: "development",
    });
    isProductionEnvironment.mockReturnValue(false);
    notFound.mockReset();
  });

  it("links the internal index to the UI Foundation showcase", () => {
    render(<DevelopmentStatusPage />);

    expect(screen.getByRole("heading", { name: "Internal references" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Open UI Foundation showcase" })).toHaveAttribute(
      "href",
      "/development-status/ui-foundation",
    );
    expect(screen.getByText(/illustrative data only/i)).toBeVisible();
  });

  it("blocks every development-status child route in production", () => {
    isProductionEnvironment.mockReturnValue(true);

    render(
      <DevelopmentStatusLayout>
        <p>Internal child content</p>
      </DevelopmentStatusLayout>,
    );

    expect(notFound).toHaveBeenCalledOnce();
  });
});
