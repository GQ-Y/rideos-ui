import PropTypes from "prop-types";
import { cx } from "../../utils/cx";

/**
 * 基础按钮（Go-UI：高 32、最小宽 60、圆角 4）
 */
export function Button({
  children,
  type = "button",
  variant = "default",
  className,
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cx(
        "rideos-btn",
        variant === "primary" && "rideos-btn-primary",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["default", "primary"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
