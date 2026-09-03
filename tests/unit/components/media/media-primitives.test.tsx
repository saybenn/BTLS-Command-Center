import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MediaFileCard, type MediaDisplayAsset } from "@/components/media/media-file-card";
import {
  MediaUploadControl,
  type MediaUploadHandler,
} from "@/components/media/media-upload-control";
import { MediaPicker } from "@/components/media/media-picker";

const asset: MediaDisplayAsset = {
  mediaAssetId: "11111111-1111-4111-8111-111111111111",
  displayFilename: "approved-image.webp",
  mimeType: "image/webp",
  byteSize: 1536,
  previewUrl: "https://public.example/approved-image.webp",
};

const uploadResult: MediaDisplayAsset = {
  mediaAssetId: "22222222-2222-4222-8222-222222222222",
  displayFilename: "finalized-image.webp",
  mimeType: "image/webp",
  byteSize: 120,
  previewUrl: "https://public.example/finalized-image.webp",
};

afterEach(() => {
  vi.restoreAllMocks();
});

function renderUploadControl(
  overrides: Partial<React.ComponentProps<typeof MediaUploadControl>> = {},
) {
  const onUpload = vi.fn<MediaUploadHandler>().mockResolvedValue(uploadResult);
  render(
    <MediaUploadControl
      accept="image/jpeg,image/webp"
      allowedMimeTypes={["image/jpeg", "image/webp"]}
      cameraCapture
      label="Add photo"
      maximumByteSize={1024}
      onUpload={onUpload}
      {...overrides}
    />,
  );
  return { onUpload };
}

describe("Feature 06 reusable media UI primitives", () => {
  it("provides a labelled image input with a progressive camera-capture hint and responsive actions", () => {
    renderUploadControl();

    const input = screen.getByLabelText("Add photo");

    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/webp");
    expect(input).toHaveAttribute("capture", "environment");
    expect(screen.getByRole("button", { name: "Add photo" })).toHaveClass("w-full", "sm:w-auto");
  });

  it("validates a selected file locally and associates the error with the input", async () => {
    const user = userEvent.setup();
    const { onUpload } = renderUploadControl({ accept: "image/jpeg,image/webp,application/pdf" });
    const input = screen.getByLabelText("Add photo");

    await user.upload(input, new File(["x"], "unsafe.pdf", { type: "application/pdf" }));

    expect(screen.getByRole("alert")).toHaveTextContent("This file type is not allowed");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("shows local image preview, upload progress, finalization, and the finalized file card", async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi.fn().mockReturnValue("blob:preview");
    vi.stubGlobal("URL", { ...URL, createObjectURL: createObjectUrl, revokeObjectURL: vi.fn() });
    let resolveUpload: ((value: MediaDisplayAsset) => void) | undefined;
    const onUpload = vi.fn<MediaUploadHandler>(
      (_file, { reportProgress }) =>
        new Promise<MediaDisplayAsset>((resolve) => {
          reportProgress(100);
          resolveUpload = resolve;
        }),
    );

    renderUploadControl({ onUpload });
    await user.upload(
      screen.getByLabelText("Add photo"),
      new File(["image"], "field-photo.webp", { type: "image/webp" }),
    );

    expect(screen.getByAltText("Preview of field-photo.webp")).toHaveAttribute(
      "src",
      "blob:preview",
    );
    await user.click(screen.getByRole("button", { name: "Upload file" }));

    expect(screen.getByRole("status")).toHaveTextContent("Finalizing upload");
    resolveUpload?.(uploadResult);

    await waitFor(() => {
      expect(screen.getByText("finalized-image.webp")).toBeVisible();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("preserves the selected file for retry after a safe upload failure", async () => {
    const user = userEvent.setup();
    const onUpload = vi
      .fn<MediaUploadHandler>()
      .mockRejectedValueOnce(new Error("storage token must not appear"))
      .mockResolvedValueOnce(uploadResult);

    renderUploadControl({ onUpload });
    await user.upload(
      screen.getByLabelText("Add photo"),
      new File(["image"], "retry.webp", { type: "image/webp" }),
    );
    await user.click(screen.getByRole("button", { name: "Upload file" }));

    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "selected file is still available to retry",
    );
    expect(screen.getByRole("button", { name: "Retry upload" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Retry upload" }));

    await waitFor(() => expect(screen.getByText("finalized-image.webp")).toBeVisible());
    expect(onUpload).toHaveBeenCalledTimes(2);
  });

  it("uses the replacement handler and keeps destructive removal separate", async () => {
    const user = userEvent.setup();
    const onReplace = vi.fn<MediaUploadHandler>().mockResolvedValue(uploadResult);
    const onRemove = vi.fn().mockResolvedValue(undefined);
    const { onUpload } = renderUploadControl({ initialAsset: asset, onReplace, onRemove });

    expect(screen.getByRole("button", { name: "Remove file" })).toHaveClass("sm:ml-auto");
    await user.upload(
      screen.getByLabelText("Add photo"),
      new File(["image"], "replacement.webp", { type: "image/webp" }),
    );
    await user.click(screen.getByRole("button", { name: "Replace file" }));

    await waitFor(() => expect(onReplace).toHaveBeenCalledTimes(1));
    expect(onUpload).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Remove file" }));

    await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
    expect(onRemove).toHaveBeenCalledWith(uploadResult);
  });

  it("offers an explicit recovery action for an abandoned upload", async () => {
    const user = userEvent.setup();
    const onRecover = vi.fn().mockResolvedValue({ status: "READY", asset });

    renderUploadControl({
      onRecover,
      recoveryMessage: "The last upload did not finish.",
    });

    expect(screen.getByText("Previous upload available for recovery")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Recover upload" }));

    await waitFor(() => expect(screen.getByText("approved-image.webp")).toBeVisible());
    expect(onRecover).toHaveBeenCalledTimes(1);
  });

  it("makes reselecting a file an explicit successful recovery outcome", async () => {
    const user = userEvent.setup();
    const onRecover = vi.fn().mockResolvedValue({ status: "RESELECT_FILE" });

    renderUploadControl({
      onRecover,
      recoveryMessage: "A new reservation is ready. Choose the file again.",
    });

    await user.click(screen.getByRole("button", { name: "Recover upload" }));

    await waitFor(() => {
      expect(screen.queryByText("approved-image.webp")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add photo" })).toBeVisible();
    });
    expect(onRecover).toHaveBeenCalledTimes(1);
  });

  it("renders a reusable safe preview/file card without exposing storage paths", () => {
    render(<MediaFileCard asset={{ ...asset, previewUrl: undefined }} />);

    expect(screen.getByText("approved-image.webp")).toBeVisible();
    expect(screen.getByText("image/webp · 2 KB")).toBeVisible();
    expect(screen.queryByText(/attachment\//)).not.toBeInTheDocument();
  });

  it("selects only finalized content images and returns safe public display data", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const contentImage = {
      ...asset,
      profile: "CONTENT_IMAGE" as const,
      publicDeliveryUrl: "https://public.example/approved-image.webp",
    };

    render(
      <MediaPicker
        assets={[contentImage]}
        onSelect={onSelect}
        selectedMediaAssetId={asset.mediaAssetId}
      />,
    );

    const option = screen.getByRole("option", { name: /approved-image.webp/i });
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("listbox")).toHaveClass("sm:grid-cols-2", "lg:grid-cols-3");

    await user.click(option);

    expect(onSelect).toHaveBeenCalledWith({
      mediaAssetId: asset.mediaAssetId,
      displayFilename: "approved-image.webp",
      mimeType: "image/webp",
      byteSize: 1536,
      publicDeliveryUrl: "https://public.example/approved-image.webp",
    });
  });

  it("uses an accessible empty state when no content image is available", () => {
    render(<MediaPicker assets={[]} onSelect={vi.fn()} />);

    expect(screen.getByText("No content images available")).toBeVisible();
  });
});
