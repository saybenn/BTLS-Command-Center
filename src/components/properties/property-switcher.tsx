"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuthorizedPropertySummary } from "@/server/properties/property-context";

export function PropertySwitcher({
  currentPropertyId,
  properties,
}: Readonly<{
  currentPropertyId: string;
  properties: AuthorizedPropertySummary[];
}>) {
  const router = useRouter();

  if (properties.length < 2) {
    return null;
  }

  return (
    <Select
      onValueChange={(propertyId) => router.push(`/${propertyId}/overview`)}
      value={currentPropertyId}
    >
      <SelectTrigger aria-label="Switch property" className="max-w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {properties.map(({ account, property }) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name} · {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
