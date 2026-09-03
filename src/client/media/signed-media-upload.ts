"use client";

/**
 * Browser transport for an already-authorized, server-created upload target.
 * Components use this BTLS contract rather than knowing about a Storage provider.
 */
export async function uploadToSignedMediaTarget({
  file,
  reportProgress,
  uploadUrl,
}: Readonly<{
  file: File;
  reportProgress: (progress: number) => void;
  uploadUrl: string;
}>): Promise<void> {
  reportProgress(5);
  const response = await fetch(uploadUrl, {
    body: file,
    headers: {
      "cache-control": "max-age=3600",
      "content-type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("The upload could not be completed.");
  }

  reportProgress(100);
}
