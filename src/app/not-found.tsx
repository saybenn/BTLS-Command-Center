import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p>The page you requested is unavailable or you do not have access to it.</p>
      <Link
        className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        href="/"
      >
        Return home
      </Link>
    </main>
  );
}
