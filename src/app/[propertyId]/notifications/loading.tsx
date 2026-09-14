import { LoadingState } from "@/components/feedback/loading-state";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <LoadingState label="Loading notifications" lines={6} />
    </div>
  );
}
