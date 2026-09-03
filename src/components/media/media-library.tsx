"use client";

import { ExternalLink, Settings2 } from "lucide-react";
import { useState } from "react";

import { uploadToSignedMediaTarget } from "@/client/media/signed-media-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFileCard, type MediaDisplayAsset } from "@/components/media/media-file-card";
import { MediaPicker, type MediaPickerAsset } from "@/components/media/media-picker";
import {
  PendingMediaUploadCard,
  type PendingMediaUploadDisplay,
} from "@/components/media/pending-media-upload-card";
import {
  MediaUploadControl,
  type MediaUploadHandler,
  type MediaUploadProgressReporter,
} from "@/components/media/media-upload-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MediaLibraryAsset = MediaDisplayAsset & {
  profile: "ATTACHMENT" | "CONTENT_IMAGE";
  publicDeliveryUrl?: string;
};

export type MediaLibraryUploadTarget = {
  mediaAssetId: string;
  uploadUrl: string;
};

type UploadIntent = "ATTACHMENT" | "CONTENT_IMAGE";

type MediaLibraryActions = {
  finalize: (mediaAssetId: string) => Promise<MediaLibraryAsset>;
  getDelivery: (mediaAssetId: string) => Promise<{ kind: "PRIVATE" | "PUBLIC"; url: string }>;
  recover: (mediaAssetId: string) => Promise<MediaLibraryUploadTarget>;
  remove: (mediaAssetId: string) => Promise<void>;
  reserve: (
    intent: UploadIntent,
    file: { name: string; size: number; type: string },
  ) => Promise<MediaLibraryUploadTarget>;
  reserveReplacement: (
    replacesMediaAssetId: string,
    file: { name: string; size: number; type: string },
  ) => Promise<MediaLibraryUploadTarget>;
};

type PendingUpload = MediaLibraryUploadTarget & {
  file: { name: string; size: number; type: string };
};

function fileDeclaration(file: File) {
  return { name: file.name, size: file.size, type: file.type };
}

function sameFileDeclaration(file: File, pending: PendingUpload) {
  return (
    pending.file.name === file.name &&
    pending.file.size === file.size &&
    pending.file.type === file.type
  );
}

function displayAsset(asset: MediaLibraryAsset): MediaDisplayAsset {
  return {
    byteSize: asset.byteSize,
    displayFilename: asset.displayFilename,
    mediaAssetId: asset.mediaAssetId,
    mimeType: asset.mimeType,
    ...(asset.publicDeliveryUrl ? { previewUrl: asset.publicDeliveryUrl } : {}),
  };
}

function AttachmentAccessButton({
  asset,
  getDelivery,
}: Readonly<{
  asset: MediaLibraryAsset;
  getDelivery: MediaLibraryActions["getDelivery"];
}>) {
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  async function openAttachment() {
    setError(null);
    setOpening(true);
    try {
      const delivery = await getDelivery(asset.mediaAssetId);
      window.open(delivery.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("This attachment could not be opened. Please try again.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button loading={opening} onClick={openAttachment} size="sm" variant="secondary">
        <ExternalLink aria-hidden="true" className="size-4" />
        Open
      </Button>
      {error ? <p className="max-w-48 text-xs text-danger-foreground">{error}</p> : null}
    </div>
  );
}

export function MediaLibrary({
  actions,
  canManage,
  initialAttachments,
  initialContentImages,
  initialPendingUploads,
}: Readonly<{
  actions: MediaLibraryActions;
  canManage: boolean;
  initialAttachments: readonly MediaLibraryAsset[];
  initialContentImages: readonly MediaLibraryAsset[];
  initialPendingUploads: readonly PendingMediaUploadDisplay[];
}>) {
  const [attachments, setAttachments] = useState<MediaLibraryAsset[]>([...initialAttachments]);
  const [contentImages, setContentImages] = useState<MediaLibraryAsset[]>([
    ...initialContentImages,
  ]);
  const [selectedContentId, setSelectedContentId] = useState<string>();
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string>();
  const [recoveredUploads, setRecoveredUploads] = useState([...initialPendingUploads]);
  const [pendingUploads, setPendingUploads] = useState<
    Partial<Record<UploadIntent, PendingUpload>>
  >({});

  const selectedContent = contentImages.find((asset) => asset.mediaAssetId === selectedContentId);
  const selectedAttachment = attachments.find(
    (asset) => asset.mediaAssetId === selectedAttachmentId,
  );

  async function upload(
    intent: UploadIntent,
    file: File,
    reportProgress: MediaUploadProgressReporter,
    replacesMediaAssetId?: string,
  ): Promise<MediaDisplayAsset> {
    const pending = pendingUploads[intent];
    const target =
      pending && !replacesMediaAssetId && sameFileDeclaration(file, pending)
        ? pending
        : replacesMediaAssetId
          ? await actions.reserveReplacement(replacesMediaAssetId, fileDeclaration(file))
          : await actions.reserve(intent, fileDeclaration(file));

    setPendingUploads((current) => ({
      ...current,
      [intent]: { ...target, file: fileDeclaration(file) },
    }));
    await uploadToSignedMediaTarget({ file, reportProgress, uploadUrl: target.uploadUrl });
    const finalized = await actions.finalize(target.mediaAssetId);
    setPendingUploads((current) => {
      const remaining = { ...current };
      delete remaining[intent];
      return remaining;
    });

    if (intent === "CONTENT_IMAGE") {
      setContentImages((current) => [
        finalized,
        ...current.filter((asset) => asset.mediaAssetId !== finalized.mediaAssetId),
      ]);
      setSelectedContentId(finalized.mediaAssetId);
    } else {
      setAttachments((current) => [
        finalized,
        ...current.filter((asset) => asset.mediaAssetId !== finalized.mediaAssetId),
      ]);
      setSelectedAttachmentId(finalized.mediaAssetId);
    }

    return displayAsset(finalized);
  }

  function uploadHandler(intent: UploadIntent): MediaUploadHandler {
    return (file, { reportProgress }) => upload(intent, file, reportProgress);
  }

  function replacementHandler(intent: UploadIntent, asset: MediaLibraryAsset): MediaUploadHandler {
    return (file, { reportProgress }) => upload(intent, file, reportProgress, asset.mediaAssetId);
  }

  async function removeAsset(intent: UploadIntent, asset: MediaDisplayAsset) {
    await actions.remove(asset.mediaAssetId);
    if (intent === "CONTENT_IMAGE") {
      setContentImages((current) =>
        current.filter((candidate) => candidate.mediaAssetId !== asset.mediaAssetId),
      );
      setSelectedContentId((current) => (current === asset.mediaAssetId ? undefined : current));
    } else {
      setAttachments((current) =>
        current.filter((candidate) => candidate.mediaAssetId !== asset.mediaAssetId),
      );
      setSelectedAttachmentId((current) => (current === asset.mediaAssetId ? undefined : current));
    }
  }

  async function recover(intent: UploadIntent) {
    const pending = pendingUploads[intent];
    if (!pending) return { status: "RESELECT_FILE" as const };

    const recovery = await actions.recover(pending.mediaAssetId);
    setPendingUploads((current) => ({ ...current, [intent]: { ...recovery, file: pending.file } }));
    return { status: "RESELECT_FILE" as const };
  }

  async function finalizeRecoveredUpload(upload: PendingMediaUploadDisplay) {
    const finalized = await actions.finalize(upload.mediaAssetId);
    setRecoveredUploads((current) =>
      current.filter((item) => item.mediaAssetId !== upload.mediaAssetId),
    );
    if (upload.profile === "CONTENT_IMAGE") setContentImages((current) => [finalized, ...current]);
    else setAttachments((current) => [finalized, ...current]);
  }

  const contentPickerAssets: MediaPickerAsset[] = contentImages.flatMap((asset) =>
    asset.profile === "CONTENT_IMAGE" && asset.publicDeliveryUrl
      ? [
          {
            ...displayAsset(asset),
            profile: asset.profile,
            publicDeliveryUrl: asset.publicDeliveryUrl,
          },
        ]
      : [],
  );

  return (
    <Tabs className="space-y-6" defaultValue="content-images">
      <TabsList aria-label="Media library sections">
        <TabsTrigger value="content-images">Content images</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>

      <TabsContent value="content-images">
        <div className="space-y-6">
          {recoveredUploads
            .filter((upload) => upload.profile === "CONTENT_IMAGE")
            .map((upload) => (
              <PendingMediaUploadCard
                canManage={canManage}
                key={upload.mediaAssetId}
                onFinalize={finalizeRecoveredUpload}
                upload={upload}
              />
            ))}
          {canManage ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload public image</CardTitle>
                <CardDescription>
                  Public content images can be selected by later feature workflows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUploadControl
                  accept="image/jpeg,image/png,image/webp"
                  allowedMimeTypes={["image/jpeg", "image/png", "image/webp"]}
                  cameraCapture
                  label="Upload content image"
                  maximumByteSize={10 * 1024 * 1024}
                  onRecover={() => recover("CONTENT_IMAGE")}
                  onUpload={uploadHandler("CONTENT_IMAGE")}
                  recoveryMessage={
                    pendingUploads.CONTENT_IMAGE
                      ? "A previous upload can be recovered with the same file."
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          ) : null}

          <MediaPicker
            assets={contentPickerAssets}
            label="Select a public content image"
            onSelect={(selection) => setSelectedContentId(selection.mediaAssetId)}
            selectedMediaAssetId={selectedContentId}
          />

          {canManage && selectedContent ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage selected image</CardTitle>
                <CardDescription>
                  Replacing an image creates a new immutable MediaAsset.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUploadControl
                  accept="image/jpeg,image/png,image/webp"
                  allowedMimeTypes={["image/jpeg", "image/png", "image/webp"]}
                  cameraCapture
                  initialAsset={displayAsset(selectedContent)}
                  key={selectedContent.mediaAssetId}
                  label="Replace selected image"
                  maximumByteSize={10 * 1024 * 1024}
                  onRecover={() => recover("CONTENT_IMAGE")}
                  onRemove={(asset) => removeAsset("CONTENT_IMAGE", asset)}
                  onReplace={replacementHandler("CONTENT_IMAGE", selectedContent)}
                  onUpload={uploadHandler("CONTENT_IMAGE")}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </TabsContent>

      <TabsContent value="attachments">
        <div className="space-y-6">
          {recoveredUploads
            .filter((upload) => upload.profile === "ATTACHMENT")
            .map((upload) => (
              <PendingMediaUploadCard
                canManage={canManage}
                key={upload.mediaAssetId}
                onFinalize={finalizeRecoveredUpload}
                upload={upload}
              />
            ))}
          {canManage ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload private attachment</CardTitle>
                <CardDescription>
                  Private attachments require a new short-lived, authorized access link each time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUploadControl
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                  allowedMimeTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/heic",
                    "image/heif",
                    "application/pdf",
                  ]}
                  label="Upload attachment"
                  maximumByteSize={25 * 1024 * 1024}
                  onRecover={() => recover("ATTACHMENT")}
                  onUpload={uploadHandler("ATTACHMENT")}
                  recoveryMessage={
                    pendingUploads.ATTACHMENT
                      ? "A previous upload can be recovered with the same file."
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          ) : null}

          {attachments.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-text-secondary">
                No private attachments are available for this property.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((asset) => (
                <MediaFileCard
                  action={
                    <div className="flex flex-col gap-2">
                      <AttachmentAccessButton asset={asset} getDelivery={actions.getDelivery} />
                      {canManage ? (
                        <Button
                          onClick={() => setSelectedAttachmentId(asset.mediaAssetId)}
                          size="sm"
                          variant="ghost"
                        >
                          <Settings2 aria-hidden="true" className="size-4" />
                          Manage
                        </Button>
                      ) : null}
                    </div>
                  }
                  asset={displayAsset(asset)}
                  key={asset.mediaAssetId}
                  selected={asset.mediaAssetId === selectedAttachmentId}
                />
              ))}
            </div>
          )}

          {canManage && selectedAttachment ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage selected attachment</CardTitle>
                <CardDescription>
                  Replacement creates a new private file and does not overwrite finalized bytes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUploadControl
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                  allowedMimeTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/heic",
                    "image/heif",
                    "application/pdf",
                  ]}
                  initialAsset={displayAsset(selectedAttachment)}
                  key={selectedAttachment.mediaAssetId}
                  label="Replace selected attachment"
                  maximumByteSize={25 * 1024 * 1024}
                  onRecover={() => recover("ATTACHMENT")}
                  onRemove={(asset) => removeAsset("ATTACHMENT", asset)}
                  onReplace={replacementHandler("ATTACHMENT", selectedAttachment)}
                  onUpload={uploadHandler("ATTACHMENT")}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </TabsContent>
    </Tabs>
  );
}
