"use client";

type RootErrorProps = {
  reset: () => void;
};

export default function RootError({ reset }: RootErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p>Try the request again. If the problem continues, contact BTLS support.</p>
      <button
        className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
