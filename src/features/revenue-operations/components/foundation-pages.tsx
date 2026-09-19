import Link from "next/link";
import { FoundationNavigationBoundary } from "./foundation-navigation-boundary";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PropertyOverviewShell } from "@/components/layout/property-overview-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  listAuthorizedProperties,
  resolveAuthorizedPropertyContext,
  type AuthorizedPropertyContext,
} from "@/server/properties/property-context";
import {
  canUseFoundation,
  type FoundationCapability,
} from "@/server/properties/foundation-authorization";
import { listPropertyServices, getPropertyService } from "@/server/properties/property-services";
import { FoundationForm } from "./foundation-form";
import { FoundationSavedNotice } from "./foundation-saved-notice";
import { FoundationDirectory, Pagination } from "./foundation-directory";
import {
  activeField,
  assetFields,
  contactFields,
  customerFields,
  employeeFields,
  locationFields,
  serviceFields,
  strings,
  yesNo,
} from "./form-fields";
import { listCustomers, getCustomerDetail, detailSectionSchema } from "../services/customers";
import { listEmployees, getEmployee, getRevenueSettings } from "../services/workforce-settings";
import { listSchema } from "../schemas/foundation";
export type PageProps = {
  params: Promise<{ propertyId: string; customerId?: string; employeeId?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function authorized(propertyId: string, capability: FoundationCapability) {
  const result = await resolveAuthorizedPropertyContext(propertyId);
  if (result.status === "unauthenticated") redirect("/sign-in");
  if (result.status !== "authorized" || !canUseFoundation(result.context, capability))
    redirect("/no-access");
  return result.context;
}
function links(context: AuthorizedPropertyContext) {
  const root = `/${context.property.id}`;
  return [
    {
      label: "Customers",
      href: `${root}/revenue-operations/customers`,
      cap: "customer.view" as const,
    },
    {
      label: "Employees",
      href: `${root}/revenue-operations/employees`,
      cap: "employee.view" as const,
    },
    {
      label: "Revenue settings",
      href: `${root}/settings/revenue-operations`,
      cap: "revenue.settings.view" as const,
    },
    {
      label: "Offered services",
      href: `${root}/settings/services`,
      cap: "property.service.view" as const,
    },
  ].filter((link) => canUseFoundation(context, link.cap));
}
async function Frame({
  context,
  title,
  description,
  children,
}: {
  context: AuthorizedPropertyContext;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const result = await listAuthorizedProperties();
  return (
    <FoundationNavigationBoundary>
      <PropertyOverviewShell
        activeNavigation="revenue"
        foundationDocumentNavigation
        context={context}
        properties={result.status === "authorized" ? result.properties : []}
      >
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <PageHeader title={title} description={description} />
          <nav aria-label="Revenue foundation" className="flex flex-wrap gap-3">
            {links(context).map((link) => (
              <Link
                key={link.href}
                className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-focus-ring"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <FoundationSavedNotice />
          {children}
        </div>
      </PropertyOverviewShell>
    </FoundationNavigationBoundary>
  );
}
const stringParam = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;
function listInput(search: Record<string, string | string[] | undefined>) {
  return listSchema.parse({
    q: stringParam(search.q),
    page: stringParam(search.page),
    status: stringParam(search.status),
  });
}
export async function CustomerDirectoryPage({ params, searchParams }: PageProps) {
  const { propertyId } = await params;
  const context = await authorized(propertyId, "customer.view");
  const input = listInput(await searchParams);
  const data = await listCustomers(context, input);
  return (
    <Frame
      context={context}
      title="Customers"
      description="Your end customers and the people you work with. Revenue Operations beta."
    >
      <FoundationDirectory
        label="Customers (name, contact, email or phone)"
        total={data.total}
        page={data.page}
        statusOptions={[
          { value: "all", label: "All relationships" },
          { value: "PROSPECT", label: "Prospect" },
          { value: "CURRENT", label: "Current" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
        records={data.records.map((record) => ({
          id: record.id,
          name: record.displayName,
          detail: record.contacts[0]?.personName ?? "No primary contact",
          status: record.relationshipState.toLowerCase(),
          href: `/${propertyId}/revenue-operations/customers/${record.id}`,
        }))}
      />
      {canUseFoundation(context, "customer.manage") && (
        <Card>
          <FoundationForm
            propertyId={propertyId}
            operation="createCustomer"
            title="Create customer"
            description="Start with a customer name and one person. Addresses and equipment can be added later."
            fields={customerFields}
            submitLabel="Create customer"
          />
        </Card>
      )}
    </Frame>
  );
}
export async function CustomerDetailPage({ params, searchParams }: PageProps) {
  const { propertyId, customerId } = await params;
  const context = await authorized(propertyId, "customer.view");
  const search = await searchParams;
  const section = detailSectionSchema.parse(stringParam(search.section) ?? "contacts");
  const page = listInput(search).page;
  const data = await getCustomerDetail(context, customerId ?? "", section, page);
  const manage = canUseFoundation(context, "customer.manage");
  const base = { customerId: data.customer.id, revision: "0", id: "" };
  const root = `/${propertyId}/revenue-operations/customers/${data.customer.id}`;
  return (
    <Frame
      context={context}
      title={data.customer.displayName}
      description={`Relationship: ${data.customer.relationshipState.toLowerCase()}. Primary contact: ${data.primaryContact?.personName ?? "Not selected"}.`}
    >
      {manage && (
        <Card>
          <FoundationForm
            propertyId={propertyId}
            operation="updateCustomer"
            title="Customer details"
            base={{ id: data.customer.id, revision: String(data.customer.revision) }}
            values={strings(data.customer)}
            fields={[
              { name: "displayName", label: "Customer name", required: true },
              {
                name: "relationshipState",
                label: "Relationship",
                type: "select",
                options: [
                  { value: "PROSPECT", label: "Prospect" },
                  { value: "CURRENT", label: "Current" },
                  { value: "INACTIVE", label: "Inactive" },
                ],
              },
            ]}
          />
        </Card>
      )}
      <nav aria-label="Customer sections" className="flex flex-wrap gap-3">
        {(["contacts", "locations", "assets", "tags"] as const).map((item) => (
          <Link
            aria-current={section === item ? "page" : undefined}
            className="rounded-md border border-border px-3 py-2 text-sm text-text-primary aria-[current=page]:bg-surface-selected focus-visible:ring-2 focus-visible:ring-focus-ring"
            key={item}
            href={`${root}?section=${item}`}
          >
            {item === "assets" ? "Equipment" : item[0].toUpperCase() + item.slice(1)}
          </Link>
        ))}
      </nav>
      {(section === "locations" || section === "assets") && (
        <p className="text-sm text-text-secondary">
          Optional detail. You can manage this customer without adding locations or equipment.
        </p>
      )}
      {data.total === 0 && <Alert>No {section === "assets" ? "equipment" : section} yet.</Alert>}
      {section === "contacts" &&
        data.contacts.map((record) => (
          <Card key={record.id}>
            <h2 className="text-lg font-semibold">
              {record.personName}
              {record.isPrimary ? " · Primary" : ""}
              {!record.isActive ? " · Inactive" : ""}
            </h2>
            <p className="mt-2 break-words text-sm text-text-secondary">
              {record.email ?? "No email"} · {record.phoneDisplay ?? "No phone"}
            </p>
            {manage && (
              <div className="mt-4">
                <FoundationForm
                  propertyId={propertyId}
                  key="saveContact"
                  operation="saveContact"
                  title={`Edit ${record.personName}`}
                  base={{ ...base, id: record.id, revision: String(record.revision) }}
                  values={{ ...strings(record), phone: record.phoneDisplay ?? "" }}
                  fields={[...contactFields, yesNo("isPrimary", "Primary contact"), activeField]}
                />
              </div>
            )}
          </Card>
        ))}
      {section === "locations" &&
        data.locations.map((record) => (
          <Card key={record.id}>
            <h2 className="text-lg font-semibold">
              {record.name}
              {record.isDefault ? " · Default" : ""}
              {!record.isActive ? " · Inactive" : ""}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {record.addressLine1}, {record.locality}
            </p>
            {manage && (
              <div className="mt-4">
                <FoundationForm
                  propertyId={propertyId}
                  key="saveLocation"
                  operation="saveLocation"
                  title={`Edit ${record.name}`}
                  base={{ ...base, id: record.id, revision: String(record.revision) }}
                  values={strings(record)}
                  fields={locationFields}
                />
              </div>
            )}
          </Card>
        ))}
      {section === "assets" &&
        data.assets.map((record) => (
          <Card key={record.id}>
            <h2 className="text-lg font-semibold">
              {record.name}
              {!record.isActive ? " · Inactive" : ""}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {record.manufacturer} {record.modelName}
              {record.location ? ` · ${record.location.name}` : ""}
            </p>
            {manage && (
              <div className="mt-4">
                <FoundationForm
                  propertyId={propertyId}
                  key="saveAsset"
                  operation="saveAsset"
                  title={`Edit ${record.name}`}
                  base={{ ...base, id: record.id, revision: String(record.revision) }}
                  values={strings(record)}
                  fields={assetFields.map((field) =>
                    field.lookup && record.serviceLocationId
                      ? {
                          ...field,
                          options: [
                            {
                              value: record.serviceLocationId,
                              label: record.location?.name ?? "Current location",
                            },
                          ],
                        }
                      : field,
                  )}
                />
              </div>
            )}
          </Card>
        ))}
      {section === "tags" &&
        data.tags.map((record) => (
          <Card key={record.id}>
            <h2 className="text-lg font-semibold">
              {record.name}
              {record.assignments.length ? " · Assigned" : ""}
              {!record.isActive ? " · Inactive" : ""}
            </h2>
            {manage && (
              <div className="mt-4 space-y-6">
                <FoundationForm
                  propertyId={propertyId}
                  operation="assignTag"
                  title={`Assign ${record.name}`}
                  base={{ customerId: data.customer.id, tagId: record.id }}
                  fields={[yesNo("assigned", "Assigned to this customer")]}
                  values={{ assigned: String(record.assignments.length > 0) }}
                />
                <FoundationForm
                  propertyId={propertyId}
                  key="saveTag"
                  operation="saveTag"
                  title={`Edit tag ${record.name}`}
                  base={{ id: record.id, revision: String(record.revision) }}
                  fields={[{ name: "name", label: "Tag name", required: true }, activeField]}
                  values={strings(record)}
                />
              </div>
            )}
          </Card>
        ))}
      <Pagination total={data.total} page={data.page} />
      {manage && (
        <Card>
          {section === "contacts" ? (
            <FoundationForm
              propertyId={propertyId}
              key="saveContact"
              operation="saveContact"
              title="Add person contact"
              base={base}
              fields={[...contactFields, yesNo("isPrimary", "Primary contact"), activeField]}
              values={{ isPrimary: "false", isActive: "true" }}
              submitLabel="Add contact"
            />
          ) : section === "locations" ? (
            <FoundationForm
              propertyId={propertyId}
              key="saveLocation"
              operation="saveLocation"
              title="Add optional location"
              base={base}
              fields={locationFields}
              values={{ isDefault: "false", isActive: "true" }}
              submitLabel="Add location"
            />
          ) : section === "assets" ? (
            <FoundationForm
              propertyId={propertyId}
              key="saveAsset"
              operation="saveAsset"
              title="Add optional equipment"
              base={base}
              fields={assetFields}
              values={{ isActive: "true" }}
              submitLabel="Add equipment"
            />
          ) : (
            <FoundationForm
              propertyId={propertyId}
              key="saveTag"
              operation="saveTag"
              title="Create property tag"
              description="Tag definitions are shared within this property's Revenue records. Assign it above after saving."
              base={{ id: "", revision: "0" }}
              fields={[{ name: "name", label: "Tag name", required: true }, activeField]}
              values={{ isActive: "true" }}
              submitLabel="Create tag"
            />
          )}
        </Card>
      )}
    </Frame>
  );
}
export async function EmployeeDirectoryPage({ params, searchParams }: PageProps) {
  const { propertyId } = await params;
  const context = await authorized(propertyId, "employee.view");
  const data = await listEmployees(context, listInput(await searchParams));
  return (
    <Frame
      context={context}
      title="Employees"
      description="Workforce profiles are separate from application logins and permissions."
    >
      <FoundationDirectory
        label="Employees"
        total={data.total}
        page={data.page}
        statusOptions={[
          { value: "all", label: "All employees" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        records={data.records.map((row) => ({
          id: row.id,
          name: row.displayName,
          detail: row.jobTitle ?? "No job title",
          status: row.isActive ? "Active" : "Inactive",
          href: `/${propertyId}/revenue-operations/employees/${row.id}`,
        }))}
      />
      {canUseFoundation(context, "employee.manage") && (
        <Card>
          <FoundationForm
            propertyId={propertyId}
            operation="saveEmployee"
            title="Create employee"
            base={{ id: "", revision: "0" }}
            fields={employeeFields}
            values={{ isActive: "true" }}
            submitLabel="Create employee"
          />
        </Card>
      )}
    </Frame>
  );
}
export async function EmployeeDetailPage({ params }: PageProps) {
  const { propertyId, employeeId } = await params;
  const context = await authorized(propertyId, "employee.view");
  const record = await getEmployee(context, employeeId ?? "");
  return (
    <Frame
      context={context}
      title={record.displayName}
      description={`${record.jobTitle ?? "Employee profile"} · ${record.isActive ? "Active" : "Inactive"}`}
    >
      <Card>
        {canUseFoundation(context, "employee.manage") ? (
          <FoundationForm
            propertyId={propertyId}
            operation="saveEmployee"
            title="Employee profile"
            base={{ id: record.id, revision: String(record.revision) }}
            fields={employeeFields}
            values={strings(record)}
          />
        ) : (
          <p className="text-sm text-text-secondary">
            {record.appUserId ? "A login is linked." : "No login is linked."} This workforce profile
            does not grant application access.
          </p>
        )}
      </Card>
    </Frame>
  );
}
export async function RevenueSettingsPage({ params }: PageProps) {
  const { propertyId } = await params;
  const context = await authorized(propertyId, "revenue.settings.view");
  const record = await getRevenueSettings(context);
  return (
    <Frame
      context={context}
      title="Revenue settings"
      description="Defaults for future Revenue workflows. Provider configuration is managed separately."
    >
      <Card>
        {canUseFoundation(context, "revenue.settings.manage") ? (
          <FoundationForm
            propertyId={propertyId}
            operation="saveRevenueSettings"
            title="Revenue defaults"
            base={{ revision: String(record.revision) }}
            fields={[
              {
                name: "defaultSendingIdentityId",
                label: "Default sender",
                lookup: "sender",
                description:
                  "Optional. Choose a configured, active BTLS-managed sender. Saving does not send a message or verify a sender.",
                options: record.sendingIdentity
                  ? [
                      {
                        value: record.sendingIdentity.id,
                        label: record.sendingIdentity.displayName,
                      },
                    ]
                  : [],
              },
              {
                name: "reviewRequestDelayDays",
                label: "Review request delay (days)",
                type: "number",
                description:
                  "Optional, 0–365. Saved for the later review-request feature; no automation runs here.",
              },
            ]}
            values={strings(record)}
          />
        ) : (
          <dl className="space-y-3 text-sm">
            <dt className="text-text-muted">Default sender</dt>
            <dd>{record.sendingIdentity?.displayName ?? "Not set"}</dd>
            <dt className="text-text-muted">Review request delay</dt>
            <dd>
              {record.reviewRequestDelayDays === null
                ? "Not set"
                : `${record.reviewRequestDelayDays} days`}
            </dd>
          </dl>
        )}
      </Card>
      {record.sendingIdentity &&
        (record.sendingIdentity.status !== "ACTIVE" ||
          record.sendingIdentity.mode !== "BTLS_MANAGED") && (
          <Alert variant="warning">
            The saved sender is no longer eligible. An authorized settings manager can replace or
            clear it.
          </Alert>
        )}
    </Frame>
  );
}
export async function PropertyServicesPage({ params, searchParams }: PageProps) {
  const { propertyId } = await params;
  const context = await authorized(propertyId, "property.service.view");
  const search = await searchParams;
  const input = listInput(search);
  const data = await listPropertyServices(context, input.q, input.page);
  const edit = stringParam(search.edit);
  const record = edit ? await getPropertyService(context, edit) : null;
  return (
    <Frame
      context={context}
      title="Offered services"
      description="The shared service vocabulary used across BTLS studios."
    >
      <FoundationDirectory
        label="Offered services"
        total={data.total}
        page={data.page}
        records={data.records.map((row) => ({
          id: row.id,
          name: row.name,
          detail: row.slug,
          status: row.isActive ? "Active" : "Inactive",
          href: `/${propertyId}/settings/services?edit=${row.id}`,
        }))}
      />
      {canUseFoundation(context, "property.service.manage") && (
        <Card>
          <FoundationForm
            key={record?.id ?? "new"}
            propertyId={propertyId}
            operation="savePropertyService"
            title={record ? "Edit offered service" : "Create offered service"}
            base={{ id: record?.id ?? "", revision: String(record?.revision ?? 0) }}
            fields={serviceFields}
            values={record ? strings(record) : { isActive: "true" }}
          />
          {record && (
            <Link
              className="mt-4 inline-block text-sm text-accent underline"
              href={`/${propertyId}/settings/services`}
            >
              Create another service
            </Link>
          )}
        </Card>
      )}
    </Frame>
  );
}
