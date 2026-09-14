import { serve } from "inngest/next";

import { inngest } from "@/server/jobs/inngest";
import { feature07InngestFunctions } from "@/server/jobs/feature-07-inngest-functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: feature07InngestFunctions,
});
