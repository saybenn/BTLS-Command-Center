import { CircleCheck } from "lucide-react";

type SystemStatusProps = {
  message: string;
};

export function SystemStatus({ message }: SystemStatusProps) {
  return (
    <section
      aria-label="Application status"
      className="rounded-xl border border-border bg-surface p-6 shadow-xs"
      role="status"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success-foreground">
          <CircleCheck aria-hidden="true" className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-sm font-medium text-text-secondary">Application status</p>
          <p className="text-lg font-semibold text-text-primary">Available</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{message}</p>
    </section>
  );
}
