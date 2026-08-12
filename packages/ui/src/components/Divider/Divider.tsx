import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface DividerProps {
  /** 方向,默认水平 */
  direction?: "horizontal" | "vertical";
  /** 文案位置(仅水平),默认 center */
  textAlign?: "left" | "center" | "right";
  /** 虚线 */
  dashed?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * 分割线:水平(可带文案)/ 垂直
 */
export function Divider({
  direction = "horizontal",
  textAlign = "center",
  dashed = false,
  children,
  className,
}: DividerProps) {
  if (direction === "vertical") {
    return <span className={cx("rideos-divider-vertical", className)} role="separator" />;
  }
  return (
    <div
      className={cx(
        "rideos-divider",
        dashed && "is-dashed",
        children != null && `has-text align-${textAlign}`,
        className,
      )}
      role="separator"
    >
      {children != null && <span className="rideos-divider-text">{children}</span>}
    </div>
  );
}
