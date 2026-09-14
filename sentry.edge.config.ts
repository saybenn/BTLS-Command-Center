import * as Sentry from "@sentry/nextjs";

import { createSentryOptions } from "@/observability/sentry-options";

Sentry.init(createSentryOptions(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN));
