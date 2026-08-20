import { Building2, SearchX } from "lucide-react";

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
import {
  TableShell,
  TableShellBody,
  TableShellCaption,
  TableShellCell,
  TableShellHead,
  TableShellHeader,
  TableShellRow,
} from "@/components/tables/table-shell";
import type {
  PropertyDirectoryQuery,
  PropertyDirectoryResult,
} from "@/server/properties/admin-properties";

function statusVariant(status: "ACTIVE" | "SUSPENDED") {
  return status === "ACTIVE" ? "success" : "warning";
}

export function AdminPropertyDirectory({
  directory,
  filters,
}: Readonly<{
  directory: PropertyDirectoryResult;
  filters: PropertyDirectoryQuery;
}>) {
  const hasPreviousPage = directory.page > 1;
  const hasNextPage = directory.page < directory.totalPages;

  return (
    <section aria-labelledby="property-directory-title" className="grid gap-6">
      <h2 className="sr-only" id="property-directory-title">
        Authorized property directory
      </h2>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-end">
        <form
          action="/admin/properties"
          className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
        >
          <label className="grid gap-2 text-sm font-medium text-text-secondary">
            Search properties
            <Input
              defaultValue={filters.search}
              name="search"
              placeholder="Property, account, or domain"
              type="search"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-text-secondary">
            Status
            <Select defaultValue={filters.status} name="status">
              <SelectTrigger aria-label="Property status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <input name="page" type="hidden" value="1" />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {directory.items.length === 0 ? (
        <EmptyState
          description={
            filters.search || filters.status !== "ALL"
              ? "No authorized properties match those filters. Clear the filters or create a property."
              : "No properties exist yet. Create the first client account and property to begin."
          }
          icon={filters.search || filters.status !== "ALL" ? SearchX : Building2}
          title={
            filters.search || filters.status !== "ALL"
              ? "No matching properties"
              : "No properties yet"
          }
        />
      ) : (
        <>
          <TableShell>
            <TableShellCaption>Authorized client properties</TableShellCaption>
            <TableShellHeader>
              <TableShellRow>
                <TableShellHead>Property</TableShellHead>
                <TableShellHead>Client account</TableShellHead>
                <TableShellHead>Status</TableShellHead>
              </TableShellRow>
            </TableShellHeader>
            <TableShellBody>
              {directory.items.map((item) => (
                <TableShellRow key={item.id}>
                  <TableShellCell>
                    <p className="font-medium text-text-primary">{item.name}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {item.domain ?? "No domain added"}
                    </p>
                  </TableShellCell>
                  <TableShellCell>
                    <p className="font-medium text-text-primary">{item.account.name}</p>
                    {item.account.status === "SUSPENDED" ? (
                      <p className="mt-1 text-xs text-warning-foreground">Account suspended</p>
                    ) : null}
                  </TableShellCell>
                  <TableShellCell>
                    <Badge variant={statusVariant(item.status)}>
                      {item.status === "ACTIVE" ? "Active" : "Suspended"}
                    </Badge>
                  </TableShellCell>
                </TableShellRow>
              ))}
            </TableShellBody>
          </TableShell>
          <nav
            aria-label="Property directory pages"
            className="flex items-center justify-between gap-3 text-sm text-text-secondary"
          >
            <p>
              {directory.total} {directory.total === 1 ? "property" : "properties"} · Page{" "}
              {directory.page} of {directory.totalPages}
            </p>
            <div className="flex gap-2">
              {hasPreviousPage ? (
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={`/admin/properties?search=${encodeURIComponent(filters.search)}&status=${filters.status}&page=${directory.page - 1}`}
                >
                  Previous
                </a>
              ) : null}
              {hasNextPage ? (
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={`/admin/properties?search=${encodeURIComponent(filters.search)}&status=${filters.status}&page=${directory.page + 1}`}
                >
                  Next
                </a>
              ) : null}
            </div>
          </nav>
        </>
      )}
    </section>
  );
}
