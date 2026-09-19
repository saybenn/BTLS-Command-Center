import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
const guard = vi.hoisted(() => ({
  register: vi
    .fn<(predicate: (target: URL, current: URL) => boolean) => () => void>()
    .mockReturnValue(vi.fn()),
  reset: vi.fn(),
}));
vi.mock("@/components/navigation/draft-navigation", () => ({
  registerDocumentNavigationBoundary: guard.register,
  resetNavigationDrafts: guard.reset,
}));
import { FoundationNavigationBoundary } from "@/features/revenue-operations/components/foundation-navigation-boundary";

it("establishes service editor document boundaries even without dirty drafts", () => {
  const view = render(<FoundationNavigationBoundary>Editor</FoundationNavigationBoundary>);
  const predicate = guard.register.mock.lastCall![0];
  const url = (search: string) =>
    new URL(`/property/settings/services${search}`, "https://btls.test");
  for (const [current, target] of [
    ["", "?edit=a"],
    ["?edit=a", "?edit=b"],
    ["?edit=a", ""],
  ]) {
    expect(predicate(url(target), url(current))).toBe(true);
  }
  for (const [current, target] of [
    ["?edit=a", "?edit=a&q=heat&page=2"],
    ["", "?q=heat&page=2"],
    ["", "?edit="],
  ]) {
    expect(predicate(url(target), url(current))).toBe(false);
  }
  expect(
    predicate(
      new URL("https://btls.test/property/revenue-operations/customers?edit=b"),
      new URL("https://btls.test/property/revenue-operations/customers?edit=a"),
    ),
  ).toBe(false);
  expect(guard.reset).not.toHaveBeenCalled();
  view.unmount();
});
