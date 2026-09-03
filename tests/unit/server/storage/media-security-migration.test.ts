import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../../..");
const migrationPath = path.join(
  repositoryRoot,
  "supabase",
  "security-migrations",
  "20260830090100_storage_and_media_security.sql",
);

describe("Feature 06 Media security migration", () => {
  it("gates every Media read with property context and the appropriate Media capability", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain("function app.has_property_media_capability(");
    expect(migration).toContain("function app.can_view_media_asset(");
    expect(migration).toContain("app.can_access_property(target_property_id)");
    expect(migration).toContain("platform.media.sensitive.view");
    expect(migration).toContain("media.sensitive.view");
    expect(migration).toContain("media_assets_select_authorized");
  });

  it("permits MediaAsset creation and update but never database-row deletion", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain("grant select, insert, update on table public.media_assets");
    expect(migration).not.toContain("grant delete on table public.media_assets");
    expect(migration).toContain("media_assets_insert_authorized");
    expect(migration).toContain("media_assets_update_authorized");
  });

  it("removes browser-direct Storage policies and constrains every bucket type", async () => {
    const migration = await readFile(migrationPath, "utf8");

    for (const policy of [
      "storage_public_buckets_read",
      "storage_private_buckets_read_authorized",
      "storage_property_uploads_insert_authorized",
      "storage_property_uploads_update_authorized",
      "storage_property_uploads_delete_authorized",
    ]) {
      expect(migration).toContain(`drop policy if exists \"${policy}\" on storage.objects;`);
    }

    expect(migration).toContain("where id in ('public-media', 'public-content')");
    expect(migration).toContain("where id = 'private-media'");
    expect(migration).toContain("where id = 'temporary-uploads'");
  });
});
