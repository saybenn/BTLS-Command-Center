import { redirect } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";
import { OperationDetails } from "@/components/operations/operations-view";
import { getOperation, OperationsAccessError } from "@/server/operations/operations";
import { retryOperationAction } from "../actions";
export const dynamic = "force-dynamic";
export default async function OperationPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ jobExecutionId: string }>;
  searchParams: Promise<{ attemptPage?: string }>;
}>) {
  const { jobExecutionId } = await params;
  if (!z.string().uuid().safeParse(jobExecutionId).success) redirect("/no-access");
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .safeParse((await searchParams).attemptPage ?? 1);
  let detail;
  try {
    detail = await getOperation({ jobExecutionId, attemptPage: page.success ? page.data : 1 });
  } catch (error) {
    if (error instanceof OperationsAccessError) redirect("/no-access");
    throw error;
  }
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader title={detail.label} description="Execution history and safe recovery." />
      <OperationDetails
        detail={detail}
        retryAction={retryOperationAction.bind(
          null,
          detail.id,
          detail.propertyId,
          detail.failedAttemptId ?? "",
        )}
      />
    </main>
  );
}
