"use client";

import { FileText, Image as ImageIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MediaDisplayAsset = {
  mediaAssetId: string;
  displayFilename: string;
  mimeType: string;
  byteSize: number;
  previewUrl?: string;
};

export function formatMediaByteSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} B`;
  const kibibytes = byteSize / 1024;
  if (kibibytes < 1024) return `${Math.round(kibibytes)} KB`;
  return `${(kibibytes / 1024).toFixed(1)} MB`;
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export type MediaFileCardProps = ComponentProps<"article"> & {
  asset: MediaDisplayAsset;
  action?: ReactNode;
  selected?: boolean;
};

export function MediaFileCard({
  action,
  asset,
  className,
  selected = false,
  ...props
}: Readonly<MediaFileCardProps>) {
  const canPreviewImage = Boolean(asset.previewUrl && isImageMimeType(asset.mimeType));

  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface-secondary",
        selected && "border-border-focus bg-surface-selected",
        className,
      )}
      {...props}
    >
      <div className="flex min-h-28 items-center justify-center bg-surface-tertiary p-3">
        {canPreviewImage ? (
          // The caller supplies only an already-authorized, safe display URL.
          // eslint-disable-next-line @next/next/no-img-element -- signed and Blob preview URLs must not use Next image optimization as a private-media proxy.
          <img
            alt={`Preview of ${asset.displayFilename}`}
            className="max-h-48 w-full rounded-md object-contain"
            src={asset.previewUrl}
          />
        ) : (
          <FileText aria-hidden="true" className="size-9 text-text-muted" />
        )}
      </div>
      <div className="flex items-start gap-3 p-3">
        <span className="mt-0.5 text-text-muted" aria-hidden="true">
          {isImageMimeType(asset.mimeType) ? (
            <ImageIcon className="size-4" />
          ) : (
            <FileText className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{asset.displayFilename}</p>
          <p className="mt-1 text-xs text-text-muted">
            {asset.mimeType} · {formatMediaByteSize(asset.byteSize)}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </article>
  );
}
