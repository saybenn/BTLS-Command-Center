import "server-only";

import twilio from "twilio";

import { ProviderDispatchError } from "@/server/integrations/provider-errors";

import { smsProviderInputSchema, smsProviderResultSchema, type SmsProvider } from "./sms-provider";

type TwilioClient = {
  messages: {
    create(input: {
      body: string;
      messagingServiceSid: string;
      statusCallback?: string;
      to: string;
    }): Promise<{ sid: string; dateCreated?: Date | null }>;
  };
};

function twilioFailure(error: unknown): ProviderDispatchError {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const rejected = status !== undefined && status >= 400 && status < 500;
  return new ProviderDispatchError({
    category: rejected ? "TWILIO_REJECTED" : "TWILIO_OUTCOME_UNCERTAIN",
    disposition: rejected ? "REJECTED" : "UNCERTAIN",
  });
}

export function createTwilioSmsProvider(input: {
  accountSid?: string;
  authToken?: string;
  messagingServiceSid: string;
  statusCallbackUrl?: string;
  client?: TwilioClient;
  now?: () => Date;
}): SmsProvider {
  const messagingServiceSid = input.messagingServiceSid.trim();
  if (!messagingServiceSid) {
    throw new ProviderDispatchError({
      category: "TWILIO_CONFIGURATION_MISSING",
      disposition: "REJECTED",
    });
  }
  const client =
    input.client ??
    (() => {
      if (!input.accountSid?.trim() || !input.authToken?.trim()) {
        throw new ProviderDispatchError({
          category: "TWILIO_CONFIGURATION_MISSING",
          disposition: "REJECTED",
        });
      }
      return twilio(input.accountSid, input.authToken);
    })();
  const now = input.now ?? (() => new Date());

  return {
    async sendMessage(rawInput) {
      const message = smsProviderInputSchema.parse(rawInput);
      try {
        const response = await client.messages.create({
          body: message.body,
          messagingServiceSid,
          statusCallback: input.statusCallbackUrl,
          to: message.to,
        });
        return smsProviderResultSchema.parse({
          acceptedAt: response.dateCreated ?? now(),
          providerMessageId: response.sid,
          providerName: "TWILIO",
        });
      } catch (error) {
        if (error instanceof ProviderDispatchError) throw error;
        throw twilioFailure(error);
      }
    },
  };
}
