import type { MouseEvent, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface LinkProps {
  /** 跳转地址;缺省时仍渲染 a(配合 onClick 使用) */
  href?: string;
  /** 点击回调 */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** 禁用:灰置且不可点击 */
  disabled?: boolean;
  /** 危险语义(红色) */
  danger?: boolean;
  /** 打开方式,如 "_blank" */
  target?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * 链接:品牌色文字链接,支持危险语义、禁用与新窗口打开
 */
export function Link({
  href,
  onClick,
  disabled = false,
  danger = false,
  target,
  children,
  className,
}: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <a
      className={cx("rideos-link", danger && "is-danger", disabled && "is-disabled", className)}
      href={disabled ? undefined : href}
      target={disabled ? undefined : target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      role={href && !disabled ? undefined : "link"}
      tabIndex={disabled ? -1 : href ? undefined : 0}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
