import "server-only";

import pino, { type DestinationStream, type Logger } from "pino";

const sensitiveLogPaths = [
  "authorization",
  "cookie",
  "password",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "headers.authorization",
  "headers.cookie",
  "request.headers.authorization",
  "request.headers.cookie",
  "payload",
  "safePayload",
  "body",
  "recipients",
  "recipient",
  "replyTo",
  "from",
  "email",
  "phone",
  "phoneNumber",
  "objectPath",
  "displayFilename",
] as const;

export function createStructuredLogger(destination?: DestinationStream): Logger {
  return pino(
    {
      base: undefined,
      level: process.env.BTLS_LOG_LEVEL ?? "info",
      redact: {
        paths: [...sensitiveLogPaths],
        censor: "[REDACTED]",
      },
    },
    destination,
  );
}

export const logger = createStructuredLogger();
