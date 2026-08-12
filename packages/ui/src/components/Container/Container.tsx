import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface ContainerProps {
  /** 内容最大宽度(px),默认 1200 */
  maxWidth?: number;
  /** 是否带水平内边距,默认 true */
  padded?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 页面容器:水平居中的定宽内容区
 */
export function Container({
  maxWidth = 1200,
  padded = true,
  children,
  className,
  style,
}: ContainerProps) {
  return (
    <div
      className={cx("rideos-container", padded && "is-padded", className)}
      style={{ maxWidth, ...style }}
    >
      {children}
    </div>
  );
}
