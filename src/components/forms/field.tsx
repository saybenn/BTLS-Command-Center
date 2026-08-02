import { cloneElement, type ReactElement, useId } from "react";

import { cn } from "@/lib/utils";

import { Label } from "./label";

type FieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  id?: string;
};

export type FieldProps = {
  children: ReactElement<FieldControlProps>;
  className?: string;
  description?: string;
  error?: string;
  id?: string;
  label: string;
  required?: boolean;
};

export function Field({
  children,
  className,
  description,
  error,
  id,
  label,
  required = false,
}: Readonly<FieldProps>) {
  const generatedId = useId();
  const controlId = children.props.id ?? id ?? `field-${generatedId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], descriptionId, errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={controlId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </Label>
      {cloneElement(children, {
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        id: controlId,
      })}
      {description ? (
        <p id={descriptionId} className="text-xs leading-5 text-text-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm leading-5 text-danger-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
