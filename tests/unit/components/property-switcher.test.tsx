import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: () => undefined,
  });
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: () => undefined,
  });
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { PropertySwitcher } from "@/components/properties/property-switcher";

const properties = [
  {
    account: { id: "account-one", name: "Oak Services" },
    effectiveRole: "CLIENT_VIEWER" as const,
    property: { id: "property-one", name: "Oak HVAC", domain: "oak.example" },
  },
  {
    account: { id: "account-two", name: "Pine Services" },
    effectiveRole: "CLIENT_MANAGER" as const,
    property: { id: "property-two", name: "Pine Plumbing", domain: "pine.example" },
  },
];

describe("PropertySwitcher", () => {
  it("renders only server-resolved options and routes to the selected overview", async () => {
    const user = userEvent.setup();
    push.mockReset();

    render(<PropertySwitcher currentPropertyId="property-one" properties={properties} />);

    await user.click(screen.getByRole("combobox", { name: "Switch property" }));
    await user.click(screen.getByRole("option", { name: "Pine Plumbing · Pine Services" }));

    expect(push).toHaveBeenCalledWith("/property-two/overview");
    expect(screen.queryByText("Unassigned property")).not.toBeInTheDocument();
  });

  it("does not show a redundant switcher when only one authorized property exists", () => {
    const { container } = render(
      <PropertySwitcher currentPropertyId="property-one" properties={[properties[0]]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
