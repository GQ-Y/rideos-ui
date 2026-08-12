import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface FormFieldProps {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <label className={cx("rideos-form-field", className)}>
      {label && (
        <span className="rideos-form-label">
          {label}
          {required && <em>*</em>}
        </span>
      )}
      {children}
      {hint && !error && <small className="rideos-form-hint">{hint}</small>}
      {error && <small className="rideos-form-error">{error}</small>}
    </label>
  );
}
