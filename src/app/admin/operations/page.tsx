import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { OperationsList } from "@/components/operations/operations-view";
import {
  listOperations,
  OperationsAccessError,
  operationsFiltersSchema,
} from "@/server/operations/operations";
export const dynamic = "force-dynamic";
export default async function OperationsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const parsed = operationsFiltersSchema.safeParse({
    page: first(params.page),
    status: first(params.status),
    propertyId: first(params.propertyId) || undefined,
    correlationId: first(params.correlationId) || undefined,
  });
  let data;
  try {
    data = await listOperations(parsed.success ? parsed.data : {});
  } catch (error) {
    if (error instanceof OperationsAccessError) redirect("/no-access");
    throw error;
  }
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <Link
        className="text-sm text-accent focus-visible:ring-2 focus-visible:ring-focus-ring"
        href="/dashboard"
      >
        Back to dashboard
      </Link>
      <PageHeader
        title="Operations"
        description="Inspect background failures and recovery for properties you are authorized to access."
      />
      {!parsed.success && (
        <p role="alert" className="text-sm text-danger-foreground">
          Invalid filters. Use a valid property or correlation ID. Showing the default view.
        </p>
      )}
      <OperationsList data={data} />
    </main>
  );
}
