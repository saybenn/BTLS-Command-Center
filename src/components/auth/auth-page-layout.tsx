import type { ReactNode } from "react";

export function AuthPageLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow-sm">
            B
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-text-primary">BTLS</p>
            <p className="text-xs text-text-muted">Command Center</p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
