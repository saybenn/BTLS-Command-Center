"use client";

import { Image as ImageIcon } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { MediaFileCard, type MediaDisplayAsset } from "@/components/media/media-file-card";
import { cn } from "@/lib/utils";

export type MediaPickerAsset = MediaDisplayAsset & {
  profile: "CONTENT_IMAGE";
  publicDeliveryUrl: string;
};

export type MediaPickerSelection = Pick<
  MediaPickerAsset,
  "mediaAssetId" | "displayFilename" | "mimeType" | "byteSize" | "publicDeliveryUrl"
>;

export type MediaPickerProps = {
  assets: readonly MediaPickerAsset[];
  className?: string;
  disabled?: boolean;
  label?: string;
  onSelect: (selection: MediaPickerSelection) => void;
  selectedMediaAssetId?: string;
};

export function MediaPicker({
  assets,
  className,
  disabled = false,
  label = "Choose a content image",
  onSelect,
  selectedMediaAssetId,
}: Readonly<MediaPickerProps>) {
  const contentImages = assets.filter((asset) => asset.profile === "CONTENT_IMAGE");
  if (contentImages.length === 0) {
    return (
      <EmptyState
        className={className}
        description="Upload a content image to this property before selecting one."
        icon={ImageIcon}
        title="No content images available"
      />
    );
  }

  return (
    <section className={cn("space-y-3", className)} aria-label={label}>
      <p className="text-sm text-text-secondary">{label}</p>
      <div aria-label={label} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="listbox">
        {contentImages.map((asset) => {
          const selected = selectedMediaAssetId === asset.mediaAssetId;
          return (
            <button
              aria-selected={selected}
              className="rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              key={asset.mediaAssetId}
              onClick={() =>
                onSelect({
                  mediaAssetId: asset.mediaAssetId,
                  displayFilename: asset.displayFilename,
                  mimeType: asset.mimeType,
                  byteSize: asset.byteSize,
                  publicDeliveryUrl: asset.publicDeliveryUrl,
                })
              }
              role="option"
              type="button"
            >
              <MediaFileCard
                asset={{ ...asset, previewUrl: asset.publicDeliveryUrl }}
                selected={selected}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
