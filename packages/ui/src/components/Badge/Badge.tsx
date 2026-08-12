import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface BadgeProps {
  /** 数字角标;0 时默认隐藏 */
  count?: number;
  /** 最大显示值,超出显示 max+,默认 99 */
  max?: number;
  /** 小红点模式(忽略 count 数字) */
  dot?: boolean;
  /** count 为 0 时也显示 */
  showZero?: boolean;
  /** 角标颜色语义 */
  tone?: "danger" | "brand" | "success" | "warning" | "neutral";
  /** 包裹的内容;不传则独立展示角标 */
  children?: ReactNode;
  className?: string;
}

/**
 * 徽标:数字角标 / 小红点,可包裹任意元素
 */
export function Badge({
  count = 0,
  max = 99,
  dot = false,
  showZero = false,
  tone = "danger",
  children,
  className,
}: BadgeProps) {
  const visible = dot || count > 0 || showZero;
  const label = count > max ? `${max}+` : String(count);

  const sup = visible ? (
    <sup className={cx("rideos-badge-sup", `tone-${tone}`, dot && "is-dot")}>
      {dot ? null : label}
    </sup>
  ) : null;

  if (children == null) {
    return <span className={cx("rideos-badge", "is-standalone", className)}>{sup}</span>;
  }
  return (
    <span className={cx("rideos-badge", className)}>
      {children}
      {sup}
    </span>
  );
}
