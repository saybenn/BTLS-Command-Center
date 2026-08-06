import { LoadingState } from "@/components/feedback/loading-state";

export default function DevelopmentStatusLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium text-text-secondary">Development area</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
        Internal references
      </h1>
      <section className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-xs">
        <LoadingState label="Loading database and environment status" lines={5} />
      </section>
    </main>
  );
}
