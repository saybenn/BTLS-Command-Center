import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  action: vi.fn(),
  lookup: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/features/revenue-operations/components/foundation-navigation", () => ({
  navigateFoundation: mocks.push,
}));
vi.mock("@/features/revenue-operations/actions/foundation-actions", () => ({
  foundationAction: mocks.action,
  foundationLookupAction: mocks.lookup,
}));
import { FoundationForm } from "@/features/revenue-operations/components/foundation-form";
const propertyId = "77129d44-c659-40b9-8a75-6f752b7a1f8c";
const fields = [
  { name: "displayName", label: "Customer name", required: true },
  { name: "personName", label: "Person's name", required: true },
];
beforeEach(() => {
  vi.clearAllMocks();
  mocks.lookup.mockResolvedValue({ ok: true, options: [] });
});
it("preserves entries and the same request ID after an interrupted response", async () => {
  const user = userEvent.setup();
  mocks.action
    .mockRejectedValueOnce(new Error("network"))
    .mockResolvedValueOnce({ ok: true, id: "customer" });
  render(
    <FoundationForm
      propertyId={propertyId}
      operation="createCustomer"
      title="Create customer"
      fields={fields}
      submitLabel="Create customer"
    />,
  );
  await user.type(screen.getByLabelText(/^Customer name/), "Family");
  await user.type(screen.getByLabelText(/^Person's name/), "Ada");
  await user.click(screen.getByRole("button", { name: "Create customer" }));
  await expect(screen.findByText(/response was interrupted/)).resolves.toBeTruthy();
  expect(screen.getByLabelText(/^Customer name/)).toHaveValue("Family");
  await user.click(screen.getByRole("button", { name: "Create customer" }));
  await waitFor(() => expect(mocks.push).toHaveBeenCalled());
  expect(mocks.action.mock.calls[0][2].requestId).toBe(mocks.action.mock.calls[1][2].requestId);
});
it("requires explicit duplicate confirmation bound to unchanged input", async () => {
  const user = userEvent.setup();
  mocks.action.mockResolvedValue({
    ok: false,
    message: "Possible duplicates",
    reviewToken: "review",
    candidates: [{ id: "existing", displayName: "Existing family", reason: "Same email" }],
  });
  render(
    <FoundationForm
      propertyId={propertyId}
      operation="createCustomer"
      title="Create customer"
      fields={fields}
      submitLabel="Create customer"
    />,
  );
  await user.type(screen.getByLabelText(/^Customer name/), "Family");
  await user.type(screen.getByLabelText(/^Person's name/), "Ada");
  await user.click(screen.getByRole("button", { name: "Create customer" }));
  await screen.findByText("Same email");
  expect(mocks.action.mock.calls[0][2].confirmSeparate).toBeUndefined();
  await user.click(screen.getByRole("button", { name: /I reviewed these/ }));
  expect(mocks.action.mock.calls[1][2]).toMatchObject({
    confirmSeparate: true,
    reviewToken: "review",
  });
});
it("gives repeated controls unique IDs and associates server field errors", async () => {
  const user = userEvent.setup();
  mocks.action.mockResolvedValue({
    ok: false,
    message: "Check fields",
    fieldErrors: { displayName: ["Name is unavailable."] },
  });
  render(
    <>
      <FoundationForm
        propertyId={propertyId}
        operation="createCustomer"
        title="First"
        fields={fields}
        submitLabel="First"
      />
      <FoundationForm
        propertyId={propertyId}
        operation="createCustomer"
        title="Second"
        fields={fields}
        submitLabel="Second"
      />
    </>,
  );
  const names = screen.getAllByLabelText(/^Customer name/);
  expect(names[0].id).not.toBe(names[1].id);
  await user.type(names[0], "Family");
  await user.type(screen.getAllByLabelText(/^Person's name/)[0], "Ada");
  await user.click(screen.getByRole("button", { name: "First" }));
  await screen.findByText("Name is unavailable.");
  expect(names[0]).toHaveAttribute("aria-invalid", "true");
});

it("makes one atomic discard decision and clears abandoned validation across dirty forms", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  mocks.action.mockResolvedValue({
    ok: false,
    message: "Check fields",
    fieldErrors: { displayName: ["Rejected draft."] },
  });
  render(
    <>
      <a href="?section=locations" onClick={(event) => event.preventDefault()}>
        Locations
      </a>
      <FoundationForm
        propertyId={propertyId}
        operation="updateCustomer"
        title="First"
        fields={[fields[0]]}
        base={{ id: "first", revision: "1" }}
        values={{ displayName: "Persisted first" }}
        submitLabel="Save first"
      />
      <FoundationForm
        propertyId={propertyId}
        operation="updateCustomer"
        title="Second"
        fields={[fields[0]]}
        base={{ id: "second", revision: "1" }}
        values={{ displayName: "Persisted second" }}
      />
    </>,
  );
  const names = screen.getAllByLabelText(/^Customer name/);
  await user.clear(names[0]);
  await user.type(names[0], "Draft first");
  await user.clear(names[1]);
  await user.type(names[1], "Draft second");
  await user.click(screen.getByRole("button", { name: "Save first" }));
  await screen.findByText("Rejected draft.");
  await user.click(screen.getByRole("link", { name: "Locations" }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(names[0]).toHaveValue("Draft first");
  expect(names[1]).toHaveValue("Draft second");
  expect(screen.getByText("Rejected draft.")).toBeVisible();
  confirm.mockReturnValue(true);
  await user.click(screen.getByRole("link", { name: "Locations" }));
  expect(confirm).toHaveBeenCalledTimes(2);
  expect(names[0]).toHaveValue("Persisted first");
  expect(names[1]).toHaveValue("Persisted second");
  expect(screen.queryByText("Rejected draft.")).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Locations" }));
  expect(confirm).toHaveBeenCalledTimes(2);
  confirm.mockRestore();
});
it("clears duplicate-review state when a creation draft is discarded", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  mocks.action.mockResolvedValue({
    ok: false,
    message: "Possible duplicate",
    reviewToken: "review",
    candidates: [{ id: "other", displayName: "Other", reason: "Same name" }],
  });
  render(
    <>
      <a href="?page=2" onClick={(event) => event.preventDefault()}>
        Next page
      </a>
      <FoundationForm
        propertyId={propertyId}
        operation="createCustomer"
        title="Create"
        fields={fields}
        submitLabel="Create"
      />
    </>,
  );
  await user.type(screen.getByLabelText(/^Customer name/), "Draft");
  await user.type(screen.getByLabelText(/^Person's name/), "Person");
  await user.click(screen.getByRole("button", { name: "Create" }));
  await screen.findByText("Possible duplicate");
  await user.click(screen.getByRole("link", { name: "Next page" }));
  expect(screen.getByLabelText(/^Customer name/)).toHaveValue("");
  expect(screen.queryByRole("button", { name: /I reviewed/ })).not.toBeInTheDocument();
  confirm.mockRestore();
});
