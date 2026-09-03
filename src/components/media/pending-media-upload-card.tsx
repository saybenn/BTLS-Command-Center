"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type PendingMediaUploadDisplay = {
  byteSize: number;
  displayFilename: string;
  finalizationDeadlineAt: Date | string;
  mediaAssetId: string;
  mimeType: string;
  profile: "ATTACHMENT" | "CONTENT_IMAGE";
  recoveryState: "EXPIRED" | "FINALIZE" | "RESTART" | "UNAVAILABLE";
};

export function PendingMediaUploadCard({
  canManage,
  onFinalize,
  upload,
}: Readonly<{
  canManage: boolean;
  onFinalize: (upload: PendingMediaUploadDisplay) => Promise<void>;
  upload: PendingMediaUploadDisplay;
}>) {
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const description =
    upload.recoveryState === "FINALIZE"
      ? "The file reached storage and can be finalized."
      : upload.recoveryState === "RESTART"
        ? "No uploaded bytes were found. Choose the file again to restart."
        : upload.recoveryState === "EXPIRED"
          ? "This reservation expired. Choose the file again to start a new upload."
          : "Recovery status could not be checked. Try again shortly.";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">
            Interrupted upload: {upload.displayFilename}
          </p>
          <p className="text-sm text-text-secondary">{description}</p>
          {finalizeError ? <p className="mt-1 text-sm text-danger">{finalizeError}</p> : null}
        </div>
        {canManage && upload.recoveryState === "FINALIZE" ? (
          <Button
            disabled={isFinalizing}
            onClick={async () => {
              setFinalizeError(null);
              setIsFinalizing(true);
              try {
                await onFinalize(upload);
              } catch {
                setFinalizeError("The upload could not be finalized. Please try again.");
              } finally {
                setIsFinalizing(false);
              }
            }}
            variant="secondary"
          >
            {isFinalizing ? "Finalizing…" : "Finalize upload"}
          </Button>
        ) : upload.recoveryState === "UNAVAILABLE" ? (
          <Button onClick={() => window.location.reload()} variant="secondary">
            Check again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
