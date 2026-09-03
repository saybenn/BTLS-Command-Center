"use client";

import { Camera, RefreshCw, RotateCcw, Trash2, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MediaFileCard, type MediaDisplayAsset } from "@/components/media/media-file-card";
import { cn } from "@/lib/utils";

type UploadStage = "idle" | "selected" | "uploading" | "finalizing" | "failed" | "ready";

export type MediaUploadProgressReporter = (progress: number) => void;

export type MediaUploadHandler = (
  file: File,
  controls: { reportProgress: MediaUploadProgressReporter },
) => Promise<MediaDisplayAsset>;

export type MediaUploadRecoveryResult =
  { status: "READY"; asset: MediaDisplayAsset } | { status: "RESELECT_FILE" };

export type MediaUploadControlProps = {
  accept: string;
  allowedMimeTypes: readonly string[];
  cameraCapture?: boolean;
  className?: string;
  initialAsset?: MediaDisplayAsset;
  label: string;
  maximumByteSize: number;
  onRecover?: () => Promise<MediaUploadRecoveryResult>;
  onRemove?: (asset: MediaDisplayAsset) => Promise<void>;
  onReplace?: MediaUploadHandler;
  onUpload: MediaUploadHandler;
  recoveryMessage?: string;
};

function safeFailureMessage(): string {
  return "We could not finish this upload. Your selected file is still available to retry.";
}

function fileToDisplayAsset(file: File, previewUrl?: string): MediaDisplayAsset {
  return {
    mediaAssetId: "local-preview",
    displayFilename: file.name,
    mimeType: file.type || "application/octet-stream",
    byteSize: file.size,
    ...(previewUrl ? { previewUrl } : {}),
  };
}

function validateFile(
  file: File,
  allowedMimeTypes: readonly string[],
  maximumByteSize: number,
): string | null {
  if (!allowedMimeTypes.includes(file.type)) {
    return "This file type is not allowed for this upload.";
  }
  if (file.size > maximumByteSize) {
    return "This file is larger than the allowed upload size.";
  }
  return null;
}

export function MediaUploadControl({
  accept,
  allowedMimeTypes,
  cameraCapture = false,
  className,
  initialAsset,
  label,
  maximumByteSize,
  onRecover,
  onRemove,
  onReplace,
  onUpload,
  recoveryMessage,
}: Readonly<MediaUploadControlProps>) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [asset, setAsset] = useState<MediaDisplayAsset | undefined>(initialAsset);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replacementTarget, setReplacementTarget] = useState<MediaDisplayAsset | undefined>();
  const [stage, setStage] = useState<UploadStage>(initialAsset ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function clearLocalPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function selectFile(file: File | undefined) {
    clearLocalPreview();
    setError(null);
    if (!file) return;

    const validationError = validateFile(file, allowedMimeTypes, maximumByteSize);
    if (validationError) {
      setSelectedFile(null);
      setReplacementTarget(undefined);
      setStage("failed");
      setError(validationError);
      return;
    }

    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    previewUrlRef.current = previewUrl ?? null;
    setSelectedFile(file);
    setReplacementTarget(asset && asset.mediaAssetId !== "local-preview" ? asset : undefined);
    setAsset(fileToDisplayAsset(file, previewUrl));
    setProgress(0);
    setStage("selected");
  }

  async function uploadSelectedFile() {
    if (!selectedFile) return;
    setError(null);
    setProgress(0);
    setStage("uploading");

    try {
      const handler = replacementTarget && onReplace ? onReplace : onUpload;
      const finalizedAsset = await handler(selectedFile, {
        reportProgress(nextProgress) {
          const boundedProgress = Math.max(0, Math.min(100, Math.round(nextProgress)));
          setProgress(boundedProgress);
          if (boundedProgress === 100) setStage("finalizing");
        },
      });
      clearLocalPreview();
      setAsset(finalizedAsset);
      setSelectedFile(null);
      setReplacementTarget(undefined);
      setProgress(100);
      setStage("ready");
    } catch {
      setStage("failed");
      setError(safeFailureMessage());
    }
  }

  async function removeAsset() {
    if (!asset || !onRemove || asset.mediaAssetId === "local-preview") return;
    setIsRemoving(true);
    setError(null);
    try {
      await onRemove(asset);
      setAsset(undefined);
      setSelectedFile(null);
      setReplacementTarget(undefined);
      setProgress(0);
      setStage("idle");
    } catch {
      setError("We could not remove this file. Please try again.");
      setStage("ready");
    } finally {
      setIsRemoving(false);
    }
  }

  async function recoverUpload() {
    if (!onRecover) return;
    setIsRecovering(true);
    setError(null);
    try {
      const result = await onRecover();
      clearLocalPreview();
      setSelectedFile(null);
      setReplacementTarget(undefined);
      setProgress(0);
      if (result.status === "READY") {
        setAsset(result.asset);
        setStage("ready");
      } else {
        setAsset(undefined);
        setStage("idle");
      }
    } catch {
      setError("We could not recover this upload. Please choose the file again.");
      setStage("failed");
    } finally {
      setIsRecovering(false);
    }
  }

  const hasSelectedFile = selectedFile !== null;
  const isWorking = stage === "uploading" || stage === "finalizing" || isRemoving || isRecovering;
  const choosingReplacement = Boolean(replacementTarget && hasSelectedFile);

  return (
    <section className={cn("space-y-4", className)} aria-label={`${label} uploader`}>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input
        accept={accept}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={Boolean(error)}
        capture={cameraCapture ? "environment" : undefined}
        className="sr-only"
        disabled={isWorking}
        id={inputId}
        onChange={(event) => selectFile(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />

      {asset ? (
        <MediaFileCard
          asset={asset}
          action={
            initialAsset && !hasSelectedFile ? (
              <span className="text-xs font-medium text-text-secondary">Current file</span>
            ) : undefined
          }
        />
      ) : null}

      {stage === "uploading" || stage === "finalizing" ? (
        <div aria-live="polite" className="space-y-2" role="status">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-text-primary">
              {stage === "finalizing" ? "Finalizing upload" : "Uploading file"}
            </span>
            <span className="text-text-secondary">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <Alert assertive variant="danger">
          <AlertTitle>Upload needs attention</AlertTitle>
          <AlertDescription id={`${inputId}-error`}>{error}</AlertDescription>
        </Alert>
      ) : null}

      {recoveryMessage && stage === "idle" && onRecover ? (
        <Alert variant="warning">
          <AlertTitle>Previous upload available for recovery</AlertTitle>
          <AlertDescription>{recoveryMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          className="w-full sm:w-auto"
          disabled={isWorking}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant={hasSelectedFile ? "secondary" : "primary"}
        >
          {cameraCapture ? (
            <Camera aria-hidden="true" className="size-4" />
          ) : (
            <Upload aria-hidden="true" className="size-4" />
          )}
          {asset || hasSelectedFile ? "Choose another file" : label}
        </Button>
        {hasSelectedFile && stage !== "failed" ? (
          <Button
            className="w-full sm:w-auto"
            loading={isWorking}
            onClick={uploadSelectedFile}
            type="button"
          >
            <Upload aria-hidden="true" className="size-4" />
            {choosingReplacement ? "Replace file" : "Upload file"}
          </Button>
        ) : null}
        {stage === "failed" && selectedFile ? (
          <Button
            className="w-full sm:w-auto"
            onClick={uploadSelectedFile}
            type="button"
            variant="secondary"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry upload
          </Button>
        ) : null}
        {stage === "idle" && recoveryMessage && onRecover ? (
          <Button
            className="w-full sm:w-auto"
            loading={isRecovering}
            onClick={recoverUpload}
            type="button"
            variant="secondary"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Recover upload
          </Button>
        ) : null}
        {asset && asset.mediaAssetId !== "local-preview" && !hasSelectedFile && onRemove ? (
          <Button
            className="w-full sm:w-auto sm:ml-auto"
            disabled={isWorking}
            loading={isRemoving}
            onClick={removeAsset}
            type="button"
            variant="danger"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Remove file
          </Button>
        ) : null}
      </div>
    </section>
  );
}
