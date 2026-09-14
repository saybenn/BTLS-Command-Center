import "server-only";

export type ProviderFailureDisposition = "REJECTED" | "UNCERTAIN";

export class ProviderDispatchError extends Error {
  readonly category: string;
  readonly disposition: ProviderFailureDisposition;
  readonly retryAt?: Date;

  constructor(input: {
    category: string;
    disposition: ProviderFailureDisposition;
    message?: string;
    retryAt?: Date;
  }) {
    super(input.message ?? "The provider dispatch did not complete.");
    this.name = "ProviderDispatchError";
    this.category = input.category;
    this.disposition = input.disposition;
    this.retryAt = input.retryAt;
  }
}
