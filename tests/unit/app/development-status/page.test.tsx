import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DevelopmentStatusLayout from "@/app/development-status/layout";
import DevelopmentStatusPage from "@/app/development-status/page";

const { getDevelopmentStatus, getServerEnvironment, isProductionEnvironment, notFound } =
  vi.hoisted(() => ({
    getDevelopmentStatus: vi.fn(),
    getServerEnvironment: vi.fn(),
    isProductionEnvironment: vi.fn(),
    notFound: vi.fn(),
  }));

vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/server/env", () => ({ getServerEnvironment, isProductionEnvironment }));
vi.mock("@/server/development-status", () => ({ getDevelopmentStatus }));

describe("development status area", () => {
  beforeEach(() => {
    getServerEnvironment.mockReturnValue({
      applicationEnvironment: "development",
      nodeEnvironment: "development",
    });
    isProductionEnvironment.mockReturnValue(false);
    getDevelopmentStatus.mockResolvedValue({
      applicationEnvironment: "development",
      configuration: {
        applicationDatabase: "configured",
        migrationDatabase: "configured",
        supabaseBrowser: "configured",
        supabaseServiceRole: "configured",
      },
      databaseReachability: "healthy",
    });
    notFound.mockReset();
  });

  it("links the internal index to the UI Foundation showcase and shows safe status details", async () => {
    render(await DevelopmentStatusPage());

    expect(screen.getByRole("heading", { name: "Internal references" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Open UI Foundation showcase" })).toHaveAttribute(
      "href",
      "/development-status/ui-foundation",
    );
    expect(screen.getByText(/illustrative data only/i)).toBeVisible();
    expect(screen.getByLabelText("Database and environment status")).toBeVisible();
    expect(screen.getByText("Reachable")).toBeVisible();
    expect(
      screen.queryByText(/postgresql:|service_role|publishable key value/i),
    ).not.toBeInTheDocument();
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
