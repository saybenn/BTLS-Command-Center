"use client";
import Link from "next/link";
import { navigateFoundation } from "./foundation-navigation";
import { registerFoundationDraft } from "./foundation-drafts";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  foundationAction,
  foundationLookupAction,
  type FoundationOperation,
  type FoundationActionResult,
} from "../actions/foundation-actions";

export type FormField = {
  name: string;
  label: string;
  required?: boolean;
  type?: "email" | "tel" | "number" | "select";
  options?: Array<{ value: string; label: string }>;
  lookup?: "user" | "location" | "service" | "sender";
  description?: string;
};
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const selectClass =
  "h-10 w-full rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:text-text-disabled";
function Lookup({
  propertyId,
  field,
  value,
  onChange,
  customerId,
  validationError,
}: {
  propertyId: string;
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  customerId?: string;
  validationError?: string;
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>(
    field.options ?? [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      setLoading(true);
      void foundationLookupAction(propertyId, {
        kind: field.lookup,
        q: query,
        ...(customerId ? { customerId } : {}),
      })
        .then((result) => {
          if (!current) return;
          if (result.ok) {
            setOptions(result.options);
            setError("");
          } else setError(result.message);
          setLoading(false);
        })
        .catch(() => {
          if (current) {
            setError("Options could not be loaded. Change the search to retry.");
            setLoading(false);
          }
        });
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query, propertyId, field.lookup, customerId]);
  return (
    <div className="space-y-2">
      <Field label={`Search ${field.label.toLowerCase()}`}>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} />
      </Field>
      <Field label={field.label} description={field.description} error={validationError}>
        <select
          className={selectClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">None</option>
          {value && !options.some((option) => option.value === value) && (
            <option value={value}>
              {field.options?.find((option) => option.value === value)?.label ??
                "Current selection (search to replace)"}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      {loading ? (
        <p role="status" className="text-sm text-text-muted">
          Loading options…
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-danger-foreground">
          {error}
        </p>
      ) : (
        <p className="text-xs text-text-muted">
          {options.length
            ? "Up to 20 results. Refine your search if needed."
            : "No eligible matches. You can leave this unset."}
        </p>
      )}
    </div>
  );
}
export function FoundationForm({
  propertyId,
  operation,
  fields,
  values = {},
  base = {},
  submitLabel = "Save changes",
  title,
  description,
}: {
  propertyId: string;
  operation: FoundationOperation;
  fields: FormField[];
  values?: Record<string, string>;
  base?: Record<string, string>;
  submitLabel?: string;
  title: string;
  description?: string;
}) {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [result, setResult] = useState<FoundationActionResult | null>(null);
  const requestId = useRef<string | null>(null);
  const reviewInput = useRef<Record<string, string> | null>(null);
  const schema = useMemo(
    () =>
      z.object(
        Object.fromEntries(
          fields.map((field) => [
            field.name,
            field.required ? z.string().trim().min(1, "This field is required.") : z.string(),
          ]),
        ),
      ),
    [fields],
  );
  const defaults = Object.fromEntries(
    fields.map((field) => [field.name, values[field.name] ?? ""]),
  );
  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Record<string, string>>({ resolver: zodResolver(schema), defaultValues: defaults });
  const watchedValues = useWatch({ control });

  const discard = () => {
    reset(defaults);
    setResult(null);
    reviewInput.current = null;
    // Keep uncertain creation request identity until a successful response or remount.
  };
  useEffect(() => {
    if (!isDirty) return;
    return registerFoundationDraft(discard);
  });
  async function save(data: Record<string, string>, confirmSeparate = false) {
    requestId.current ??= crypto.randomUUID();
    setResult(null);
    let response: FoundationActionResult;
    try {
      response = await foundationAction(propertyId, operation, {
        ...base,
        ...data,
        ...(operation === "createCustomer" || base.id === ""
          ? { requestId: requestId.current }
          : {}),
        ...(confirmSeparate &&
        reviewInput.current &&
        JSON.stringify(data) === JSON.stringify(reviewInput.current) &&
        result &&
        !result.ok
          ? { confirmSeparate: true, reviewToken: result.reviewToken }
          : {}),
      });
    } catch {
      setResult({
        ok: false,
        message:
          "The response was interrupted. Your entries are preserved; retry to check or save this request.",
      });
      return;
    }
    setResult(response);
    if (!response.ok) {
      for (const [name, messages] of Object.entries(response.fieldErrors ?? {}))
        setError(name, { message: messages[0] });
      if (response.candidates) reviewInput.current = data;
      return;
    }
    reset(base.id === "" ? defaults : data);
    requestId.current = null;
  }
  useEffect(() => {
    if (!result?.ok || isDirty) return;
    const target = new URL(window.location.href);
    if (operation === "createCustomer") {
      target.pathname = `/${propertyId}/revenue-operations/customers/${result.id}`;
      target.search = "";
    }
    target.searchParams.set("saved", "1");
    navigateFoundation(target.pathname + target.search);
  }, [result, isDirty, operation, propertyId]);
  const form = (
    <form
      aria-label={title}
      onSubmit={(event) => {
        void handleSubmit((data) => save(data))(event);
      }}
      className="space-y-4"
      data-ready={ready ? "true" : "false"}
    >
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      <fieldset disabled={!ready || isSubmitting} className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">{title} fields</legend>
        {fields.map((field) => (
          <div key={field.name} className={field.lookup ? "sm:col-span-2" : undefined}>
            {field.lookup ? (
              <Lookup
                propertyId={propertyId}
                field={field}
                value={watchedValues[field.name] ?? ""}
                onChange={(value) => {
                  setValue(field.name, value, { shouldDirty: true });
                  setResult(null);
                }}
                customerId={base.customerId}
                validationError={errors[field.name]?.message}
              />
            ) : (
              <Field
                label={field.label}
                required={field.required}
                description={field.description}
                error={errors[field.name]?.message}
              >
                {field.type === "select" ? (
                  <select className={selectClass} {...register(field.name)}>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input type={field.type ?? "text"} {...register(field.name)} />
                )}
              </Field>
            )}
          </div>
        ))}
      </fieldset>
      {result &&
        (result.ok ? (
          <Alert variant="success">Changes saved.</Alert>
        ) : (
          <Alert variant={result.candidates ? "warning" : "danger"} assertive>
            <p>{result.message}</p>
            {result.candidates && (
              <div className="mt-3 space-y-3">
                <ul className="space-y-2">
                  {result.candidates.map((candidate) => (
                    <li key={candidate.id}>
                      <Link
                        className="text-accent underline"
                        href={`/${propertyId}/revenue-operations/customers/${candidate.id}`}
                      >
                        {candidate.displayName}
                      </Link>
                      <p className="text-sm">{candidate.reason}</p>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={(event) => {
                    void handleSubmit((data) => save(data, true))(event);
                  }}
                >
                  {base.id
                    ? "I reviewed these — keep this contact separate"
                    : "I reviewed these — create a separate record"}
                </Button>
              </div>
            )}
          </Alert>
        ))}
      <Button type="submit" loading={isSubmitting} disabled={!ready} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
  if (base.id && !["updateCustomer", "saveEmployee"].includes(operation))
    return (
      <details
        onToggle={(event) => {
          if (!event.currentTarget.open && isDirty) {
            if (window.confirm("Discard unsaved changes?")) discard();
            else event.currentTarget.open = true;
          }
        }}
      >
        <summary className="cursor-pointer rounded-md py-2 text-sm font-medium text-accent focus-visible:ring-2 focus-visible:ring-focus-ring">
          {title}
        </summary>
        <div className="mt-4">{form}</div>
      </details>
    );
  return form;
}
