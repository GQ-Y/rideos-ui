import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  children?: ReactNode;
  /** 原生 button type */
  type?: "button" | "submit" | "reset";
  /** 视觉变体 */
  variant?: "default" | "primary";
  className?: string;
  disabled?: boolean;
}

/**
 * 基础按钮(Go-UI:高 32、最小宽 60、圆角 4)
 */
export function Button({
  children,
  type = "button",
  variant = "default",
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cx("rideos-btn", variant === "primary" && "rideos-btn-primary", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
