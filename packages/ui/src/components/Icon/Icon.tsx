import type { ComponentType, CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface IconProps {
  /** 图标组件(如 @ant-design/icons 的图标)或任意 SVG 节点 */
  component?: ComponentType<{ className?: string; style?: CSSProperties }>;
  children?: ReactNode;
  /** 尺寸(px),默认继承字号 */
  size?: number;
  /** 颜色,默认继承 currentColor */
  color?: string;
  /** 旋转动画(loading 场景) */
  spin?: boolean;
  /** 静态旋转角度 */
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * 图标封装:统一尺寸/颜色/旋转控制,兼容 @ant-design/icons 与自有 SVG
 */
export function Icon({
  component: Component,
  children,
  size,
  color,
  spin = false,
  rotate,
  className,
  style,
  "aria-label": ariaLabel,
}: IconProps) {
  const mergedStyle: CSSProperties = {
    fontSize: size,
    color,
    transform: rotate != null ? `rotate(${rotate}deg)` : undefined,
    ...style,
  };
  return (
    <span
      className={cx("rideos-icon", spin && "is-spin", className)}
      style={mergedStyle}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {Component ? <Component /> : children}
    </span>
  );
}
