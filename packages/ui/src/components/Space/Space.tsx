import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export type SpaceSize = number | "small" | "middle" | "large";

export type SpaceAlign = "start" | "end" | "center" | "baseline" | "stretch";

const SPACE_SIZE: Record<"small" | "middle" | "large", number> = {
  small: 8,
  middle: 12,
  large: 16,
};

export interface SpaceProps {
  /** 间距:预设 small=8 / middle=12 / large=16,或自定义像素值,默认 middle */
  size?: SpaceSize;
  /** 排列方向,默认 horizontal */
  direction?: "horizontal" | "vertical";
  /** 交叉轴对齐;水平默认 center,垂直默认 stretch */
  align?: SpaceAlign;
  /** 是否换行(水平方向) */
  wrap?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 间距:以 flex + gap 均匀排布子元素
 */
export function Space({
  size = "middle",
  direction = "horizontal",
  align,
  wrap = false,
  children,
  className,
  style,
}: SpaceProps) {
  const gap = typeof size === "number" ? size : SPACE_SIZE[size];
  const alignItems =
    align === "start" ? "flex-start" : align === "end" ? "flex-end" : align;

  return (
    <div
      className={cx("rideos-space", `is-${direction}`, wrap && "is-wrap", className)}
      style={{ gap, alignItems, ...style }}
    >
      {children}
    </div>
  );
}
