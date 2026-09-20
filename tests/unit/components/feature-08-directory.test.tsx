import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, it, expect, vi } from "vitest";
const navigation = vi.hoisted(() => ({
  search: new URLSearchParams(),
  replace: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.search,
  usePathname: () => "/property/revenue-operations/customers",
  useRouter: () => navigation,
}));
vi.mock("next/link", () => ({
  default: ({
    onNavigate,
    ...props
  }: import("react").AnchorHTMLAttributes<HTMLAnchorElement> & {
    onNavigate?: (event: { preventDefault: () => void }) => void;
  }) => (
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.(event);
      }}
    />
  ),
}));
import { FoundationDirectory } from "@/features/revenue-operations/components/foundation-directory";
const props = { records: [], total: 0, page: 1, label: "Customers" };
beforeEach(() => {
  navigation.search = new URLSearchParams();
  navigation.replace.mockClear();
  navigation.push.mockClear();
  window.history.replaceState(null, "", "/");
});
it("retains the focused DOM input and newer typing when an earlier search response arrives", async () => {
  const user = userEvent.setup();
  const view = render(<FoundationDirectory {...props} />);
  const input = screen.getByLabelText("Search customers");
  await user.type(input, "Ada");
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenCalledWith(expect.stringContaining("q=Ada")),
  );
  await user.type(input, " Jones");
  navigation.search = new URLSearchParams("q=Ada&status=all&page=1");
  view.rerender(<FoundationDirectory {...props} />);
  expect(screen.getByLabelText("Search customers")).toBe(input);
  expect(input).toHaveValue("Ada Jones");
  expect(input).toHaveFocus();
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenCalledWith(expect.stringContaining("q=Ada+Jones")),
  );
  navigation.search = new URLSearchParams("q=Ada+Jones&status=all&page=1");
  view.rerender(<FoundationDirectory {...props} />);
  expect(input).toHaveValue("Ada Jones");
  expect(input).toHaveFocus();
});
it("restores externally navigated queries without remounting the search control", async () => {
  const view = render(<FoundationDirectory {...props} />);
  const input = screen.getByLabelText("Search customers");
  navigation.search = new URLSearchParams("q=First");
  view.rerender(<FoundationDirectory {...props} />);
  expect(input).toHaveValue("First");
  act(() => {
    window.history.replaceState(null, "", "?q=Second");
    navigation.search = new URLSearchParams("q=Second");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  view.rerender(<FoundationDirectory {...props} />);
  expect(screen.getByLabelText("Search customers")).toBe(input);
  expect(input).toHaveValue("Second");
});
it("cancels pending typing when a status selection submits the complete latest intent", async () => {
  const user = userEvent.setup();
  const options = [
    { value: "all", label: "All" },
    { value: "CURRENT", label: "Current" },
  ];
  const view = render(<FoundationDirectory {...props} statusOptions={options} />);
  await user.type(screen.getByLabelText("Search customers"), "Pending");
  await user.selectOptions(screen.getByLabelText("Status"), "CURRENT");
  await waitFor(() => expect(navigation.replace).toHaveBeenCalledTimes(1));
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(navigation.replace).toHaveBeenCalledTimes(1);
  const url = navigation.replace.mock.calls[0][0];
  expect(url).toContain("q=Pending");
  expect(url).toContain("status=CURRENT");
  await user.type(screen.getByLabelText("Search customers"), " newer");
  navigation.search = new URLSearchParams(url.split("?")[1]);
  view.rerender(<FoundationDirectory {...props} statusOptions={options} />);
  expect(screen.getByLabelText("Status")).toHaveValue("CURRENT");
  expect(screen.getByLabelText("Search customers")).toHaveValue("Pending newer");
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenLastCalledWith(
      expect.stringContaining("q=Pending+newer&status=CURRENT"),
    ),
  );
});
it("clear and pagination use the latest status and cancel pending query work", async () => {
  const user = userEvent.setup();
  render(
    <FoundationDirectory
      {...props}
      total={60}
      statusOptions={[
        { value: "all", label: "All" },
        { value: "CURRENT", label: "Current" },
      ]}
    />,
  );
  await user.selectOptions(screen.getByLabelText("Status"), "CURRENT");
  await user.type(screen.getByLabelText("Search customers"), "abandoned");
  await user.clear(screen.getByLabelText("Search customers"));
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenLastCalledWith(
      expect.stringContaining("q=&status=CURRENT&page=1"),
    ),
  );
  await user.type(screen.getByLabelText("Search customers"), "new");
  await user.click(screen.getByRole("link", { name: "Next" }));
  await waitFor(() =>
    expect(navigation.push).toHaveBeenLastCalledWith(
      expect.stringContaining("q=new&status=CURRENT&page=2"),
    ),
  );
  await user.click(screen.getByRole("link", { name: "Next" }));
  await waitFor(() =>
    expect(navigation.push).toHaveBeenLastCalledWith(
      expect.stringContaining("q=new&status=CURRENT&page=3"),
    ),
  );
  const count = navigation.replace.mock.calls.length;
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(navigation.replace).toHaveBeenCalledTimes(count);
});
it("history cancels pending input and restores query, status and page together", async () => {
  const user = userEvent.setup();
  const options = [
    { value: "all", label: "All" },
    { value: "CURRENT", label: "Current" },
  ];
  const view = render(<FoundationDirectory {...props} total={60} statusOptions={options} />);
  await user.type(screen.getByLabelText("Search customers"), "abandoned");
  act(() => {
    window.history.replaceState(null, "", "?q=History&status=CURRENT&page=2");
    navigation.search = new URLSearchParams(window.location.search);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  view.rerender(<FoundationDirectory {...props} total={60} page={2} statusOptions={options} />);
  expect(screen.getByLabelText("Search customers")).toHaveValue("History");
  expect(screen.getByLabelText("Status")).toHaveValue("CURRENT");
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(navigation.replace).not.toHaveBeenCalled();
});
