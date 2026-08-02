export default function DevelopmentStatusPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium text-text-secondary">Development area</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
        Internal references
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        These routes support implementation and verification. They contain illustrative data only
        and are unavailable in production.
      </p>
      <section className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-base font-semibold text-text-primary">UI Foundation</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Review approved primitives, feedback states, data display, theme controls, and the
          responsive application shell.
        </p>
        <a
          className="mt-4 inline-flex rounded-md text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/development-status/ui-foundation"
        >
          Open UI Foundation showcase
        </a>
      </section>
    </main>
  );
}
