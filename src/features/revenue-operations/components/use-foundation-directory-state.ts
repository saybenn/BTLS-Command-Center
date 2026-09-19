"use client";
import { useEffect, useReducer, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Selection = { q: string; status: string; page: number };
const read = (search: string): Selection => {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") ?? "",
    status: params.get("status") ?? "all",
    page: Number(params.get("page")) || 1,
  };
};
function serialize(base: string, selection: Selection) {
  const params = new URLSearchParams(base);
  params.set("q", selection.q);
  params.set("status", selection.status);
  params.set("page", String(selection.page));
  return params.toString();
}
type State = {
  desired: Selection;
  observed: string;
  issued: string[];
  command: { search: string; delay: number; method: "push" | "replace" } | null;
};
type Action =
  | { type: "change"; patch: Partial<Selection>; delay: number; method: "push" | "replace" }
  | { type: "observed"; search: string; history?: boolean }
  | { type: "issued"; search: string };
function reducer(state: State, action: Action): State {
  if (action.type === "issued") return { ...state, issued: [...state.issued, action.search] };
  if (action.type === "observed") {
    if (!action.history && state.issued.includes(action.search)) {
      // An acknowledgment may update results, but never the newer desired controls.
      return { ...state, observed: action.search };
    }
    return { desired: read(action.search), observed: action.search, issued: [], command: null };
  }
  const desired = { ...state.desired, ...action.patch };
  return {
    ...state,
    desired,
    command: {
      search: serialize(state.observed, desired),
      delay: action.delay,
      method: action.method,
    },
  };
}
export function useFoundationDirectoryState() {
  const path = usePathname();
  const search = useSearchParams().toString();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, search, (initial) => ({
    desired: read(initial),
    observed: initial,
    issued: [],
    command: null,
  }));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, startTransition] = useTransition();
  if (state.observed !== search) dispatch({ type: "observed", search });
  useEffect(() => {
    const restore = () => {
      if (timer.current) clearTimeout(timer.current);
      dispatch({ type: "observed", search: window.location.search.slice(1), history: true });
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const command = state.command;
  useEffect(() => {
    if (!command) return;
    timer.current = setTimeout(() => {
      dispatch({ type: "issued", search: command.search });
      startTransition(() => router[command.method](`${path}?${command.search}`));
    }, command.delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [command, path, router]);
  function change(patch: Partial<Selection>, delay = 0, method: "push" | "replace" = "replace") {
    // Cancel before scheduling React work: older debounce callbacks cannot win this event.
    if (timer.current) clearTimeout(timer.current);
    dispatch({ type: "change", patch, delay, method });
  }
  return {
    ...state.desired,
    pending,
    change,
    pageHref: (page: number) => `${path}?${serialize(state.observed, { ...state.desired, page })}`,
  };
}
