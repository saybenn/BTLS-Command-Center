import "server-only";

import { ServerClient } from "postmark";

import { ProviderDispatchError } from "@/server/integrations/provider-errors";

import {
  transactionalEmailInputSchema,
  transactionalEmailResultSchema,
  type TransactionalEmailProvider,
} from "./transactional-email-provider";

type PostmarkClient = {
  sendEmail(input: {
    From: string;
    To: string;
    Subject: string;
    TextBody?: string;
    HtmlBody?: string;
    ReplyTo?: string;
    MessageStream: string;
    Metadata: Record<string, string>;
  }): Promise<{ MessageID: string; SubmittedAt: string }>;
};

function formatMailbox(address: string, name?: string): string {
  if (!name) return address;
  const quotedName = name.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${quotedName}" <${address}>`;
}

function postmarkFailure(error: unknown): ProviderDispatchError {
  const statusCode =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode?: unknown }).statusCode)
      : undefined;
  const rejected = statusCode !== undefined && statusCode >= 400 && statusCode < 500;
  return new ProviderDispatchError({
    category: rejected ? "POSTMARK_REJECTED" : "POSTMARK_OUTCOME_UNCERTAIN",
    disposition: rejected ? "REJECTED" : "UNCERTAIN",
  });
}

export function createPostmarkTransactionalEmailProvider(input: {
  serverToken?: string;
  messageStream?: string;
  client?: PostmarkClient;
}): TransactionalEmailProvider {
  const messageStream = input.messageStream?.trim() || "outbound";
  const client =
    input.client ??
    (() => {
      const token = input.serverToken?.trim();
      if (!token) {
        throw new ProviderDispatchError({
          category: "POSTMARK_CONFIGURATION_MISSING",
          disposition: "REJECTED",
        });
      }
      return new ServerClient(token);
    })();

  return {
    async sendTransactionalEmail(rawInput) {
      const email = transactionalEmailInputSchema.parse(rawInput);
      if (email.identity.mode !== "BTLS_MANAGED") {
        throw new ProviderDispatchError({
          category: "SENDING_IDENTITY_MODE_UNSUPPORTED",
          disposition: "REJECTED",
        });
      }

      try {
        const response = await client.sendEmail({
          From: formatMailbox(email.identity.fromAddress, email.identity.displayName),
          To: email.recipients
            .map((recipient) => formatMailbox(recipient.email, recipient.name))
            .join(", "),
          Subject: email.subject,
          TextBody: email.textBody,
          HtmlBody: email.htmlBody,
          ReplyTo: email.identity.replyToAddress ?? undefined,
          MessageStream: messageStream,
          Metadata: {
            correlationId: email.correlationId,
            idempotencyKey: email.idempotencyKey,
            ...(email.providerCorrelationId
              ? { providerCorrelationId: email.providerCorrelationId }
              : {}),
          },
        });
        return transactionalEmailResultSchema.parse({
          acceptedAt: response.SubmittedAt,
          providerMessageId: response.MessageID,
          providerName: "POSTMARK",
        });
      } catch (error) {
        if (error instanceof ProviderDispatchError) throw error;
        throw postmarkFailure(error);
      }
    },
  };
}
