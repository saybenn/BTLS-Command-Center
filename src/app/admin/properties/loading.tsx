import { LoadingState } from "@/components/feedback/loading-state";

export default function AdminPropertiesLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-7xl space-y-8">
      <header className="border-b border-border pb-5">
        <div className="h-8 w-40 animate-pulse rounded-md bg-surface-tertiary" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded-md bg-surface-tertiary" />
      </header>
      <section className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <LoadingState label="Loading authorized properties" lines={6} />
      </section>
    </main>
  );
}
