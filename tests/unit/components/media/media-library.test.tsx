import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MediaLibrary } from "@/components/media/media-library";

const contentImage = {
  byteSize: 1200,
  displayFilename: "team.webp",
  mediaAssetId: "11111111-1111-4111-8111-111111111111",
  mimeType: "image/webp",
  profile: "CONTENT_IMAGE" as const,
  publicDeliveryUrl: "https://public.example/team.webp",
};

const attachment = {
  byteSize: 2200,
  displayFilename: "scope.pdf",
  mediaAssetId: "22222222-2222-4222-8222-222222222222",
  mimeType: "application/pdf",
  profile: "ATTACHMENT" as const,
};

const actions = {
  finalize: async () => contentImage,
  getDelivery: async () => ({ kind: "PRIVATE" as const, url: "https://private.example/signed" }),
  recover: async () => ({
    mediaAssetId: contentImage.mediaAssetId,
    uploadUrl: "https://upload.example",
  }),
  remove: async () => undefined,
  reserve: async () => ({
    mediaAssetId: contentImage.mediaAssetId,
    uploadUrl: "https://upload.example",
  }),
  reserveReplacement: async () => ({
    mediaAssetId: contentImage.mediaAssetId,
    uploadUrl: "https://upload.example",
  }),
};

describe("MediaLibrary", () => {
  it("lets a viewer browse safe content and attachment metadata without mutation controls", () => {
    render(
      <MediaLibrary
        actions={actions}
        canManage={false}
        initialAttachments={[attachment]}
        initialContentImages={[contentImage]}
        initialPendingUploads={[]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Content images" })).toBeVisible();
    expect(screen.getByRole("option", { name: /team.webp/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Upload content image" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage" })).not.toBeInTheDocument();
  });

  it("renders upload and management controls only for media managers", async () => {
    const user = userEvent.setup();
    render(
      <MediaLibrary
        actions={actions}
        canManage
        initialAttachments={[attachment]}
        initialContentImages={[contentImage]}
        initialPendingUploads={[]}
      />,
    );

    expect(screen.getByRole("button", { name: "Upload content image" })).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Attachments" }));
    expect(screen.getByRole("button", { name: "Manage" })).toBeVisible();
  });
  it("shows rediscovered recovery state to viewers without a recovery mutation", () => {
    render(
      <MediaLibrary
        actions={actions}
        canManage={false}
        initialAttachments={[]}
        initialContentImages={[]}
        initialPendingUploads={[
          {
            byteSize: 123,
            displayFilename: "interrupted.webp",
            finalizationDeadlineAt: "2026-09-03T12:00:00.000Z",
            mediaAssetId: "33333333-3333-4333-8333-333333333333",
            mimeType: "image/webp",
            profile: "CONTENT_IMAGE",
            recoveryState: "FINALIZE",
          },
        ]}
      />,
    );

    expect(screen.getByText("Interrupted upload: interrupted.webp")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Finalize upload" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Interrupted upload: interrupted.webp")).toHaveLength(1);
  });
  it("lets a media manager finalize rediscovered uploaded bytes through the existing action", async () => {
    const user = userEvent.setup();
    const finalize = vi.fn().mockResolvedValue(contentImage);

    render(
      <MediaLibrary
        actions={{ ...actions, finalize }}
        canManage
        initialAttachments={[]}
        initialContentImages={[]}
        initialPendingUploads={[
          {
            byteSize: 123,
            displayFilename: "interrupted.webp",
            finalizationDeadlineAt: "2026-09-03T12:00:00.000Z",
            mediaAssetId: "33333333-3333-4333-8333-333333333333",
            mimeType: "image/webp",
            profile: "CONTENT_IMAGE",
            recoveryState: "FINALIZE",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Finalize upload" }));
    expect(finalize).toHaveBeenCalledWith("33333333-3333-4333-8333-333333333333");
  });
});
