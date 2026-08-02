import { expect, test as base } from "@playwright/test";
import { writeFile } from "node:fs/promises";

type FailureEvidence = {
  consoleErrors: string[];
  networkFailures: Array<{ method: string; reason: string | null; url: string }>;
  pageErrors: string[];
};

export const test = base.extend<{ failureEvidence: void }>({
  failureEvidence: [
    async ({ page }, use, testInfo) => {
      const evidence: FailureEvidence = {
        consoleErrors: [],
        networkFailures: [],
        pageErrors: [],
      };

      page.on("console", (message) => {
        if (message.type() === "error") {
          evidence.consoleErrors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        evidence.pageErrors.push(error.message);
      });
      page.on("requestfailed", (request) => {
        evidence.networkFailures.push({
          method: request.method(),
          reason: request.failure()?.errorText ?? null,
          url: request.url(),
        });
      });

      await use();

      await writeFile(
        testInfo.outputPath("browser-failure-evidence.json"),
        JSON.stringify(evidence, null, 2),
      );
    },
    { auto: true },
  ],
});

export { expect };
