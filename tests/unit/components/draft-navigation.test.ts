import { expect, it, vi } from "vitest";
import {
  discardNavigationDrafts,
  registerNavigationDraft,
  registerDocumentNavigationBoundary,
} from "@/components/navigation/draft-navigation";
function unload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}
it("protects only dirty drafts and removes native protection before accepted navigation", () => {
  expect(unload()).toBe(false);
  const first = vi.fn(),
    second = vi.fn();
  const removeFirst = registerNavigationDraft(first);
  const removeSecond = registerNavigationDraft(second);
  expect(unload()).toBe(true);
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  expect(discardNavigationDrafts()).toBe(false);
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
  expect(unload()).toBe(true);
  confirm.mockReturnValue(true);
  expect(discardNavigationDrafts()).toBe(true);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
  expect(unload()).toBe(false);
  expect(discardNavigationDrafts()).toBe(true);
  expect(confirm).toHaveBeenCalledTimes(2);
  removeFirst();
  removeSecond();
  confirm.mockRestore();
});
it("preserves modified clicks and cancels a scoped document exit before downstream handlers", () => {
  const cleanup = registerDocumentNavigationBoundary(() => true);
  const discard = vi.fn();
  const remove = registerNavigationDraft(discard);
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const link = document.createElement("a");
  link.href = "/elsewhere";
  const downstream = vi.fn((event: Event) => event.preventDefault());
  link.addEventListener("click", downstream);
  document.body.append(link);
  link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));
  expect(confirm).not.toHaveBeenCalled();
  expect(downstream).toHaveBeenCalledTimes(1);
  link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(downstream).toHaveBeenCalledTimes(1);
  expect(discard).not.toHaveBeenCalled();
  remove();
  cleanup();
  link.remove();
  confirm.mockRestore();
});
