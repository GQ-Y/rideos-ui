import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface FlexProps {
  /** 主轴方向,默认 row */
  direction?: CSSProperties["flexDirection"];
  /** 交叉轴对齐(align-items) */
  align?: CSSProperties["alignItems"];
  /** 主轴对齐(justify-content) */
  justify?: CSSProperties["justifyContent"];
  /** 子项间距,数字按 px 处理 */
  gap?: number | string;
  /** 允许换行,默认 false */
  wrap?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 弹性布局:轻量 flex 容器,常用于工具条 / 表单行内排布
 */
export function Flex({
  direction,
  align,
  justify,
  gap,
  wrap = false,
  children,
  className,
  style,
}: FlexProps) {
  return (
    <div
      className={cx("rideos-flex", className)}
      style={{
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
