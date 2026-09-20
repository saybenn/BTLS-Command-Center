import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RetryOperationForm } from "@/components/operations/retry-operation-form";
import { OperationsList } from "@/components/operations/operations-view";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("operations UI", () => {
  it("submits a retry by keyboard, reports success and prevents repeat submission", async () => {
    const user = userEvent.setup();
    const action = vi
      .fn()
      .mockResolvedValue({ status: "success", message: "Retry queued and audited." });
    render(<RetryOperationForm action={action} />);
    await user.type(
      screen.getByRole("textbox", { name: "Reason for retry" }),
      "Provider recovered",
    );
    const button = screen.getByRole("button", { name: "Request safe retry" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenCalledWith("Provider recovered");
    expect(await screen.findByText("Retry queued and audited.")).toBeVisible();
    expect(button).toBeDisabled();
  });
  it("shows a failed request without pretending retry succeeded", async () => {
    const user = userEvent.setup();
    render(<RetryOperationForm action={vi.fn().mockRejectedValue(new Error("network"))} />);
    await user.type(
      screen.getByRole("textbox", { name: "Reason for retry" }),
      "Provider recovered",
    );
    await user.click(screen.getByRole("button", { name: "Request safe retry" }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Could not request a retry");
      expect(screen.getByRole("button", { name: "Request safe retry" })).toBeEnabled();
      expect(screen.getByRole("textbox", { name: "Reason for retry" })).toBeEnabled();
    });
    expect(screen.getByRole("textbox", { name: "Reason for retry" })).toHaveValue(
      "Provider recovered",
    );
  });
  it("renders an accessible empty filtered list", () => {
    render(
      <OperationsList
        data={{ jobs: [], filters: { page: 1, status: "ATTENTION" }, total: 0, totalPages: 1 }}
      />,
    );
    expect(screen.getByText("No matching operations")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Operation status" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Operation pages" })).toHaveTextContent(
      "Page 1 of 1",
    );
  });
});
