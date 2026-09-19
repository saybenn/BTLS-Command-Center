"use client";

// Shared mechanics; a feature must explicitly opt into document navigation.
const drafts = new Set<() => void>();
let documentBoundary: ((target: URL, current: URL) => boolean) | null = null;
function beforeUnload(event: BeforeUnloadEvent) {
  if (drafts.size) {
    event.preventDefault();
    event.returnValue = "";
  }
}
function syncListeners() {
  window.removeEventListener("beforeunload", beforeUnload);
  document.removeEventListener("click", navigate, true);
  if (drafts.size) window.addEventListener("beforeunload", beforeUnload);
  if (drafts.size || documentBoundary) document.addEventListener("click", navigate, true);
}
export function resetNavigationDrafts() {
  const abandoned = [...drafts];
  drafts.clear();
  // Remove beforeunload synchronously, before React processes the resets or navigation starts.
  syncListeners();
  for (const discard of abandoned) discard();
}
export function discardNavigationDrafts() {
  if (!drafts.size) return true;
  if (!window.confirm("Discard unsaved changes?")) return false;
  resetNavigationDrafts();
  return true;
}
export function navigateDocument(href: string) {
  if (!discardNavigationDrafts()) return false;
  window.location.assign(href);
  return true;
}
function navigate(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  const current = new URL(window.location.href);
  const target = new URL(link.href, current);
  if (!["http:", "https:"].includes(target.protocol) || target.href === current.href) return;
  const documentNavigation = documentBoundary?.(target, current) ?? false;
  // Directory-only state transitions keep the working forms mounted.
  if (!documentNavigation && link.hasAttribute("data-preserve-drafts")) return;
  if (!discardNavigationDrafts()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  } else if (documentNavigation) {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(target.href);
  }
}
export function registerNavigationDraft(discard: () => void) {
  drafts.add(discard);
  syncListeners();
  return () => {
    drafts.delete(discard);
    syncListeners();
  };
}
export function registerDocumentNavigationBoundary(
  predicate: (target: URL, current: URL) => boolean,
) {
  documentBoundary = predicate;
  syncListeners();
  return () => {
    if (documentBoundary === predicate) documentBoundary = null;
    syncListeners();
  };
}
