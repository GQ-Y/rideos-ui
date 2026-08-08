import PropTypes from "prop-types";
import { cx } from "../../utils/cx";

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}) {
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

FormField.propTypes = {
  label: PropTypes.node,
  required: PropTypes.bool,
  hint: PropTypes.node,
  error: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
