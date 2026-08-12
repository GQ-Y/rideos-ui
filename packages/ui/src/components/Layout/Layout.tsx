import { Children, isValidElement } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface LayoutProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface LayoutSiderProps {
  /** 展开宽度(px),默认 220 */
  width?: number;
  /** 是否折叠 */
  collapsed?: boolean;
  /** 折叠后宽度(px),默认 72 */
  collapsedWidth?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 布局容器:纵向堆叠 Header / Content / Footer;
 * 子级包含 LayoutSider 时自动切换为横向排列。
 */
export function Layout({ children, className, style }: LayoutProps) {
  const hasSider = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === LayoutSider,
  );

  return (
    <section
      className={cx("rideos-layout", hasSider && "rideos-layout-has-sider", className)}
      style={style}
    >
      {children}
    </section>
  );
}

/**
 * 布局顶栏
 */
export function LayoutHeader({ children, className, style }: LayoutProps) {
  return (
    <header className={cx("rideos-layout-header", className)} style={style}>
      {children}
    </header>
  );
}

/**
 * 布局侧栏:固定宽度,支持折叠
 */
export function LayoutSider({
  width = 220,
  collapsed = false,
  collapsedWidth = 72,
  children,
  className,
  style,
}: LayoutSiderProps) {
  const resolved = collapsed ? collapsedWidth : width;
  return (
    <aside
      className={cx("rideos-layout-sider", collapsed && "is-collapsed", className)}
      style={{ width: resolved, flex: `0 0 ${resolved}px`, ...style }}
    >
      {children}
    </aside>
  );
}

/**
 * 布局主内容区:自动撑满剩余空间
 */
export function LayoutContent({ children, className, style }: LayoutProps) {
  return (
    <main className={cx("rideos-layout-content", className)} style={style}>
      {children}
    </main>
  );
}

/**
 * 布局底栏
 */
export function LayoutFooter({ children, className, style }: LayoutProps) {
  return (
    <footer className={cx("rideos-layout-footer", className)} style={style}>
      {children}
    </footer>
  );
}
