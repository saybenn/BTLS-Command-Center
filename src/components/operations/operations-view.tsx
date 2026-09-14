import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OperationDetail, OperationsPage } from "@/server/operations/operations";
import { RetryOperationForm, type RetryActionResult } from "./retry-operation-form";

const linkClass =
  "text-sm font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring";
const statuses = {
  ATTENTION: "Needs attention",
  ALL: "All statuses",
  FAILED: "Failed",
  RETRY_SCHEDULED: "Retry queued",
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCEEDED: "Succeeded",
};
function dateLabel(value: Date | null) {
  return value
    ? `${new Date(value).toISOString().slice(0, 19).replace("T", " ")} UTC`
    : "Not recorded";
}
function Status({ status }: { status: keyof typeof statuses }) {
  return (
    <Badge
      variant={
        status === "FAILED"
          ? "danger"
          : status === "SUCCEEDED"
            ? "success"
            : status === "RUNNING"
              ? "info"
              : "warning"
      }
    >
      {statuses[status]}
    </Badge>
  );
}
export function OperationsList({ data }: Readonly<{ data: OperationsPage }>) {
  const pageLink = (page: number) => {
    const params = new URLSearchParams({ status: data.filters.status, page: String(page) });
    if (data.filters.propertyId) params.set("propertyId", data.filters.propertyId);
    if (data.filters.correlationId) params.set("correlationId", data.filters.correlationId);
    return `/admin/operations?${params}`;
  };
  return (
    <section aria-label="Authorized operations" className="space-y-6">
      <form
        action="/admin/operations"
        className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Status
          <Select name="status" defaultValue={data.filters.status}>
            <SelectTrigger aria-label="Operation status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statuses).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Property ID (optional)
          <Input
            name="propertyId"
            defaultValue={data.filters.propertyId}
            placeholder="Property UUID"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Correlation ID (optional)
          <Input
            name="correlationId"
            defaultValue={data.filters.correlationId}
            placeholder="Correlation UUID"
          />
        </label>
        <div className="flex items-end gap-3">
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
          <Link className={linkClass} href="/admin/operations">
            Clear
          </Link>
        </div>
      </form>
      <p className="text-sm text-text-secondary">{data.total} authorized operations</p>
      {data.jobs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching operations"
          description="No operations available to you match these filters."
        />
      ) : (
        <ol
          aria-label="Operations"
          className="divide-y divide-border rounded-xl border border-border bg-surface shadow-xs"
        >
          {data.jobs.map((job) => (
            <li key={job.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
              <div className="min-w-0 space-y-2">
                <Link className={linkClass} href={`/admin/operations/${job.id}`}>
                  {job.label} — {job.propertyName}
                </Link>
                <p className="text-sm text-text-secondary">{job.failureSummary}</p>
                <p className="break-all text-xs text-text-muted">
                  Correlation: {job.correlationId}
                </p>
                <p className="text-xs text-text-muted">
                  {job.attemptCount} attempts · Created {dateLabel(job.createdAt)}
                </p>
              </div>
              <div>
                <Status status={job.status} />
              </div>
            </li>
          ))}
        </ol>
      )}
      <nav
        aria-label="Operation pages"
        className="flex flex-wrap justify-between gap-4 text-sm text-text-secondary"
      >
        <span>
          Page {data.filters.page} of {data.totalPages}
        </span>
        <div className="flex gap-4">
          {data.filters.page > 1 && (
            <Link className={linkClass} href={pageLink(data.filters.page - 1)}>
              Previous
            </Link>
          )}
          {data.filters.page < data.totalPages && (
            <Link className={linkClass} href={pageLink(data.filters.page + 1)}>
              Next
            </Link>
          )}
        </div>
      </nav>
    </section>
  );
}
export function OperationDetails({
  detail,
  retryAction,
}: Readonly<{
  detail: OperationDetail;
  retryAction: (reason: string) => Promise<RetryActionResult>;
}>) {
  return (
    <div className="space-y-6">
      <Link className={linkClass} href={`/admin/operations?propertyId=${detail.propertyId}`}>
        Back to operations
      </Link>
      <section
        aria-label="Operation summary"
        className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">{detail.propertyName}</h2>
          <Status status={detail.status} />
        </div>
        <p className="text-sm text-text-secondary">{detail.failureSummary}</p>
        {detail.retryDelivery && (
          <p role="status" className="text-sm text-text-secondary">
            {detail.retryDelivery}
          </p>
        )}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Correlation ID</dt>
            <dd className="break-all text-text-primary">{detail.correlationId}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Last failure</dt>
            <dd className="text-text-primary">{dateLabel(detail.failedAt)}</dd>
          </div>
        </dl>
      </section>
      <section
        aria-labelledby="retry-title"
        className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-xs"
      >
        <h2 id="retry-title" className="text-lg font-semibold text-text-primary">
          Retry eligibility
        </h2>
        <p className="text-sm text-text-secondary">{detail.retry.explanation}</p>
        {detail.retry.allowed && detail.failedAttemptId ? (
          <RetryOperationForm key={detail.failedAttemptId} action={retryAction} />
        ) : (
          <Button disabled variant="secondary">
            Retry unavailable
          </Button>
        )}
      </section>
      <section aria-labelledby="attempts-title" className="space-y-4">
        <h2 id="attempts-title" className="text-lg font-semibold text-text-primary">
          Attempts ({detail.attemptCount})
        </h2>
        {detail.attempts.length === 0 ? (
          <p className="text-sm text-text-secondary">No attempt has started.</p>
        ) : (
          <ol className="divide-y divide-border rounded-xl border border-border bg-surface">
            {detail.attempts.map((attempt) => (
              <li key={attempt.id} className="space-y-2 p-4">
                <p className="text-sm font-medium text-text-primary">
                  Attempt {attempt.number} ·{" "}
                  {attempt.status === "STARTED"
                    ? "Started"
                    : attempt.status === "FAILED"
                      ? "Failed"
                      : "Succeeded"}
                </p>
                <p className="text-sm text-text-secondary">{attempt.summary}</p>
                <p className="text-xs text-text-muted">
                  Started {dateLabel(attempt.startedAt)} · Finished {dateLabel(attempt.finishedAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
        <nav
          aria-label="Attempt pages"
          className="flex flex-wrap gap-4 text-sm text-text-secondary"
        >
          <span>
            Page {detail.attemptPage} of {detail.attemptTotalPages}
          </span>
          {detail.attemptPage > 1 && (
            <Link className={linkClass} href={`?attemptPage=${detail.attemptPage - 1}`}>
              Previous attempts
            </Link>
          )}
          {detail.attemptPage < detail.attemptTotalPages && (
            <Link className={linkClass} href={`?attemptPage=${detail.attemptPage + 1}`}>
              Next attempts
            </Link>
          )}
        </nav>
      </section>
    </div>
  );
}
