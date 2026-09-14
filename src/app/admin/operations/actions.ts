"use server";
import { revalidatePath } from "next/cache";
import {
  requestOperationRetry,
  OperationsAccessError,
  RetryDeniedError,
} from "@/server/operations/operations";
import type { RetryActionResult } from "@/components/operations/retry-operation-form";
export async function retryOperationAction(
  jobExecutionId: string,
  propertyId: string,
  failedAttemptId: string,
  reason: string,
): Promise<RetryActionResult> {
  try {
    await requestOperationRetry({ jobExecutionId, propertyId, failedAttemptId, reason });
    revalidatePath("/admin/operations");
    revalidatePath(`/admin/operations/${jobExecutionId}`);
    return {
      status: "success",
      message:
        "Retry queued and audited. Delivery will resume automatically when the worker is available.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof OperationsAccessError || error instanceof RetryDeniedError
          ? error.message
          : "Could not request a retry. Check the reason and reload the operation.",
    };
  }
}
