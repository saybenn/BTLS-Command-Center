"use client";
import { useEffect, type ReactNode } from "react";
import {
  registerDocumentNavigationBoundary,
  resetNavigationDrafts,
} from "@/components/navigation/draft-navigation";

// Feature 08 only. Same-route directory state stays on Next's client router.
export function FoundationNavigationBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unregister = registerDocumentNavigationBoundary(
      (target, current) =>
        target.origin !== current.origin ||
        target.pathname !== current.pathname ||
        target.searchParams.get("section") !== current.searchParams.get("section") ||
        // Selecting another offered service replaces the working form, even on this route.
        (/\/settings\/services\/?$/.test(current.pathname) &&
          (target.searchParams.get("edit") || null) !==
            (current.searchParams.get("edit") || null)) ||
        // A related-record page replaces editable forms, unlike a directory result page.
        (/\/revenue-operations\/customers\/[^/]+\/?$/.test(current.pathname) &&
          target.searchParams.get("page") !== current.searchParams.get("page")),
    );
    // pagehide means departure actually happened; never reset on a cancelled beforeunload.
    const departed = () => resetNavigationDrafts();
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pagehide", departed);
    window.addEventListener("pageshow", restored);
    return () => {
      unregister();
      window.removeEventListener("pagehide", departed);
      window.removeEventListener("pageshow", restored);
    };
  }, []);
  return children;
}
