import type { FormField } from "./foundation-form";
export const activeField: FormField = {
  name: "isActive",
  label: "Active",
  type: "select",
  options: [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ],
};
export const contactFields: FormField[] = [
  {
    name: "personName",
    label: "Person's name",
    required: true,
    description: "A real person at this customer, not a company or department.",
  },
  { name: "email", label: "Email address", type: "email" },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    description:
      "Include + and country code. Optional; adding a number does not grant messaging consent.",
  },
];
export const customerFields: FormField[] = [
  { name: "displayName", label: "Customer name", required: true },
  ...contactFields,
];
export const yesNo = (name: string, label: string): FormField => ({
  name,
  label,
  type: "select",
  options: [
    { value: "false", label: "No" },
    { value: "true", label: "Yes" },
  ],
});
export const locationFields: FormField[] = [
  { name: "name", label: "Location name", required: true },
  { name: "addressLine1", label: "Street address", required: true },
  { name: "addressLine2", label: "Address line 2" },
  { name: "locality", label: "City / locality", required: true },
  { name: "region", label: "State / region" },
  { name: "postalCode", label: "Postal code" },
  {
    name: "countryCode",
    label: "Country code",
    required: true,
    description: "Two letters, such as US or GB.",
  },
  yesNo("isDefault", "Default location"),
  activeField,
];
export const assetFields: FormField[] = [
  { name: "name", label: "Equipment / item name", required: true },
  { name: "manufacturer", label: "Manufacturer" },
  { name: "modelName", label: "Model" },
  { name: "serialNumber", label: "Serial number" },
  {
    name: "serviceLocationId",
    label: "Location",
    lookup: "location",
    description: "Optional; select a location only when it is useful.",
  },
  activeField,
];
export const employeeFields: FormField[] = [
  { name: "displayName", label: "Employee name", required: true },
  { name: "jobTitle", label: "Job title" },
  {
    name: "appUserId",
    label: "Linked login",
    lookup: "user",
    description:
      "Optional. Select an existing authorized user; this does not invite anyone or change permissions.",
  },
  activeField,
];
export const serviceFields: FormField[] = [
  { name: "name", label: "Service name", required: true },
  {
    name: "slug",
    label: "Service slug",
    required: true,
    description: "Stable lowercase words separated by hyphens.",
  },
  {
    name: "parentServiceId",
    label: "Parent service",
    lookup: "service",
    description: "Optional shared service grouping.",
  },
  activeField,
];
export function strings(record: object): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([, value]) => typeof value !== "object" || value === null)
      .map(([key, value]) => [key, value == null ? "" : String(value)]),
  );
}
