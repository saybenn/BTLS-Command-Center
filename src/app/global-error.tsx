"use client";

import { inter } from "./fonts";

type GlobalErrorProps = {
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html
      className={`${inter.variable} dark h-full antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-text-primary">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="max-w-md rounded-xl border border-border bg-surface p-6 shadow-xs">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Application unavailable
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Try the request again. If the problem continues, contact BTLS support.
            </p>
            <button
              className="mt-6 rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
