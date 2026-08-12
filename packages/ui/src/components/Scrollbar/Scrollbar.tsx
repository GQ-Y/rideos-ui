import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface ScrollbarProps {
  /** 固定高度,数字按 px */
  height?: number | string;
  /** 最大高度,数字按 px,内容超出时出现滚动条 */
  maxHeight?: number | string;
  children?: ReactNode;
  className?: string;
}

/** 数字尺寸转 px 字符串 */
function toSize(value?: number | string): string | undefined {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * 滚动容器:原生滚动 + CSS 美化滚动条
 * WebKit 下 6px 圆角 thumb(n300 / hover n400),Firefox 走 scrollbar-width: thin。
 */
export function Scrollbar({ height, maxHeight, children, className }: ScrollbarProps) {
  const style: CSSProperties = { height: toSize(height), maxHeight: toSize(maxHeight) };
  return (
    <div className={cx("rideos-scrollbar", className)} style={style}>
      {children}
    </div>
  );
}
