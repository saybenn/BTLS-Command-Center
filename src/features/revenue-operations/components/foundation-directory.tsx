"use client";
import Link from "next/link";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { useFoundationDirectoryState } from "./use-foundation-directory-state";
import { usePathname, useSearchParams } from "next/navigation";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import {
  TableShell,
  TableShellHeader,
  TableShellBody,
  TableShellRow,
  TableShellHead,
  TableShellCell,
  TableShellCaption,
} from "@/components/tables/table-shell";
import { EmptyState } from "@/components/feedback/empty-state";
export type DirectoryRecord = {
  id: string;
  name: string;
  detail: string;
  status: string;
  href: string;
};
const features = tableFeatures({});
const helper = createColumnHelper<typeof features, DirectoryRecord>();
const columns = helper.columns([
  helper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={row.original.href}
        data-preserve-drafts
        className="font-medium text-text-primary underline decoration-border underline-offset-4"
      >
        {row.original.name}
      </Link>
    ),
  }),
  helper.accessor("detail", { header: "Details" }),
  helper.accessor("status", { header: "Status" }),
]);
type DirectoryProps = {
  records: DirectoryRecord[];
  total: number;
  page: number;
  label: string;
  statusOptions?: Array<{ value: string; label: string }>;
};
export function FoundationDirectory({ records, total, label, statusOptions }: DirectoryProps) {
  const directory = useFoundationDirectoryState();
  const { q: query, pending } = directory;
  const stableRecords = useMemo(() => records, [records]);
  const table = useTable({ features, columns, data: stableRecords, getRowId: (row) => row.id });
  return (
    <div className="space-y-4" aria-busy={pending}>
      <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
        <Field label={`Search ${label.toLowerCase()}`}>
          <Input
            value={query}
            onChange={(event) =>
              directory.change({ q: event.target.value, page: 1 }, event.target.value ? 300 : 0)
            }
          />
        </Field>
        {statusOptions && (
          <Field label="Status">
            <select
              value={directory.status}
              className="h-10 rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring"
              onChange={(event) => directory.change({ status: event.target.value, page: 1 })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <p className="text-sm text-text-muted" role="status">
        {total} {total === 1 ? "record" : "records"}
        {pending ? " · Updating…" : ""}
      </p>
      {!records.length ? (
        <EmptyState
          icon={Users}
          title={query ? "No matching records" : "No records yet"}
          description={
            query
              ? "Try another search or clear the filters."
              : "Create the first record when you are ready."
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <TableShell>
              <TableShellCaption>{label}</TableShellCaption>
              <TableShellHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableShellRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableShellHead key={header.id}>
                        <table.FlexRender header={header} />
                      </TableShellHead>
                    ))}
                  </TableShellRow>
                ))}
              </TableShellHeader>
              <TableShellBody>
                {table.getRowModel().rows.map((row) => (
                  <TableShellRow key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableShellCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableShellCell>
                    ))}
                  </TableShellRow>
                ))}
              </TableShellBody>
            </TableShell>
          </div>
          <ul className="space-y-3 md:hidden">
            {records.map((record) => (
              <li key={record.id} className="rounded-xl border border-border bg-surface p-4">
                <Link
                  className="font-medium text-text-primary underline"
                  href={record.href}
                  data-preserve-drafts
                >
                  {record.name}
                </Link>
                <p className="mt-2 break-words text-sm text-text-secondary">{record.detail}</p>
                <p className="mt-1 text-sm text-text-muted">{record.status}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <Pagination
        total={total}
        page={directory.page}
        hrefForPage={directory.pageHref}
        onPageChange={(nextPage) => directory.change({ page: nextPage }, 0, "push")}
      />
    </div>
  );
}
export function Pagination({
  total,
  page,
  hrefForPage,
  onPageChange,
}: {
  total: number;
  page: number;
  hrefForPage?: (page: number) => string;
  onPageChange?: (page: number) => void;
}) {
  const path = usePathname();
  const search = useSearchParams();
  const href = (nextPage: number) => {
    if (hrefForPage) return hrefForPage(nextPage);
    const next = new URLSearchParams(search.toString());
    next.set("page", String(nextPage));
    return `${path}?${next}`;
  };
  return (
    <nav aria-label="Pagination" className="flex items-center gap-4 text-sm">
      {page > 1 && (
        <Link
          className="rounded-md p-2 text-accent underline focus-visible:ring-2 focus-visible:ring-focus-ring"
          href={href(page - 1)}
          data-preserve-drafts={onPageChange ? "true" : undefined}
          onNavigate={
            onPageChange
              ? (event) => {
                  event.preventDefault();
                  onPageChange(page - 1);
                }
              : undefined
          }
        >
          Previous
        </Link>
      )}
      <span className="text-text-muted">
        Page {page} of {Math.max(1, Math.ceil(total / 25))}
      </span>
      {page * 25 < total && (
        <Link
          className="rounded-md p-2 text-accent underline focus-visible:ring-2 focus-visible:ring-focus-ring"
          href={href(page + 1)}
          data-preserve-drafts={onPageChange ? "true" : undefined}
          onNavigate={
            onPageChange
              ? (event) => {
                  event.preventDefault();
                  onPageChange(page + 1);
                }
              : undefined
          }
        >
          Next
        </Link>
      )}
    </nav>
  );
}
