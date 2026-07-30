export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center"
    >
      <p>Loading application…</p>
    </main>
  );
}
