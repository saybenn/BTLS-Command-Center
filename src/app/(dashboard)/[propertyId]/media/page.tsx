import { redirect } from "next/navigation";

import {
  finalizeMediaLibraryUploadAction,
  getMediaLibraryAssetDeliveryAction,
  recoverMediaLibraryUploadAction,
  removeMediaLibraryAssetAction,
  reserveMediaLibraryReplacementAction,
  reserveMediaLibraryUploadAction,
} from "@/app/(dashboard)/[propertyId]/media/actions";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyOverviewShell } from "@/components/layout/property-overview-shell";
import { MediaLibrary, type MediaLibraryAsset } from "@/components/media/media-library";
import {
  listAuthorizedProperties,
  resolveAuthorizedPropertyContext,
} from "@/server/properties/property-context";
import { listMediaLibraryAssets } from "@/server/storage/media-access";
import { listMediaLibraryPendingUploads } from "@/server/storage/media-recovery";

export const dynamic = "force-dynamic";

function canManageMedia(
  context: Extract<
    Awaited<ReturnType<typeof resolveAuthorizedPropertyContext>>,
    { status: "authorized" }
  >,
) {
  return (
    context.context.capabilities.platform.includes("platform.media.manage") ||
    context.context.capabilities.property.includes("media.manage")
  );
}

function toLibraryAsset(
  asset: Awaited<ReturnType<typeof listMediaLibraryAssets>>[number],
): MediaLibraryAsset {
  return {
    byteSize: asset.byteSize,
    displayFilename: asset.displayFilename,
    mediaAssetId: asset.mediaAssetId,
    mimeType: asset.mimeType,
    profile: asset.profile,
    ...(asset.publicDeliveryUrl ? { publicDeliveryUrl: asset.publicDeliveryUrl } : {}),
  };
}

export default async function MediaLibraryPage({
  params,
}: Readonly<{
  params: Promise<{ propertyId: string }>;
}>) {
  const { propertyId } = await params;
  const resolution = await resolveAuthorizedPropertyContext(propertyId);

  if (resolution.status === "unauthenticated") {
    redirect("/sign-in");
  }
  if (resolution.status === "disabled") {
    redirect("/unauthorized?reason=disabled");
  }
  if (resolution.status !== "authorized") {
    redirect("/no-access");
  }
  const context = resolution.context;
  const hasMediaView =
    context.capabilities.platform.includes("platform.media.view") ||
    context.capabilities.property.includes("media.view");
  if (!hasMediaView) {
    redirect("/no-access");
  }

  const [properties, contentImages, attachments, pendingUploads] = await Promise.all([
    listAuthorizedProperties(),
    listMediaLibraryAssets(context, { profile: "CONTENT_IMAGE", propertyId }),
    listMediaLibraryAssets(context, { profile: "ATTACHMENT", propertyId }),
    listMediaLibraryPendingUploads(context, { propertyId }),
  ]);
  const authorizedProperties = properties.status === "authorized" ? properties.properties : [];

  return (
    <PropertyOverviewShell
      activeNavigation="media"
      context={context}
      properties={authorizedProperties}
    >
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <PageHeader
          description="A shared, property-scoped library for public content images and private attachments."
          title="Media library"
        />
        <MediaLibrary
          actions={{
            finalize: finalizeMediaLibraryUploadAction.bind(null, propertyId),
            getDelivery: getMediaLibraryAssetDeliveryAction.bind(null, propertyId),
            recover: recoverMediaLibraryUploadAction.bind(null, propertyId),
            remove: removeMediaLibraryAssetAction.bind(null, propertyId),
            reserve: reserveMediaLibraryUploadAction.bind(null, propertyId),
            reserveReplacement: reserveMediaLibraryReplacementAction.bind(null, propertyId),
          }}
          canManage={canManageMedia(resolution)}
          initialAttachments={attachments.map(toLibraryAsset)}
          initialContentImages={contentImages.map(toLibraryAsset)}
          initialPendingUploads={pendingUploads}
        />
      </div>
    </PropertyOverviewShell>
  );
}
