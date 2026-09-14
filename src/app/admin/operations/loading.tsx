import { LoadingState } from "@/components/feedback/loading-state";
export default function LoadingOperations() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6" aria-busy="true">
      <LoadingState label="Loading authorized operations" lines={6} />
    </main>
  );
}
