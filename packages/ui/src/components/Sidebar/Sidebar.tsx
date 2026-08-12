import { useState } from "react";
import type { ComponentType, CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { MenuFoldOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

/** 菜单图标组件(以 `<Icon aria-hidden="true" />` 方式渲染) */
export type SidebarMenuIcon = ComponentType<{
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/** 二级菜单项 */
export interface SidebarMenuChild {
  path: string;
  label: ReactNode;
}

/** 一级菜单项 */
export interface SidebarMenuItem {
  key: string;
  label: string;
  path: string;
  icon?: SidebarMenuIcon;
  children?: SidebarMenuChild[];
}

interface MenuGroupProps {
  item: SidebarMenuItem;
  expanded?: boolean;
  collapsed?: boolean;
  onToggle?: (key: string) => void;
  onNavigate?: (path: string) => void;
  pathname?: string;
}

function MenuGroup({ item, expanded, collapsed, onToggle, onNavigate, pathname }: MenuGroupProps) {
  const Icon = item.icon;
  const isHome = item.key === "home";
  const childActive = item.children?.some((child) => pathname === child.path);
  const active = pathname === item.path || childActive || (!isHome && pathname?.startsWith(`${item.path}/`));
  const hasChildren = Boolean(item.children?.length) && !isHome;
  const showSubmenu = hasChildren && (collapsed || expanded);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);

  function handleMouseEnter(event: ReactMouseEvent<HTMLDivElement>) {
    if (!collapsed || !hasChildren) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 56 + (item.children?.length ?? 0) * 38;
    const top = Math.max(8, Math.min(rect.top, window.innerHeight - estimatedHeight - 8));
    setFlyoutPos({ top, left: rect.right + 6 });
  }

  function handleMouseLeave() {
    if (collapsed) setFlyoutPos(null);
  }

  return (
    <div
      className={cx("rideos-menu-group", active && "active", collapsed && hasChildren && "has-flyout")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={cx("rideos-menu-row", active && "active")}
        aria-label={collapsed ? item.label : undefined}
        aria-expanded={hasChildren && !collapsed ? expanded : undefined}
        aria-haspopup={hasChildren && collapsed ? "menu" : undefined}
        title={collapsed ? item.label : undefined}
        onClick={() => {
          if (isHome) {
            onNavigate?.(item.path);
            return;
          }
          if (hasChildren && !collapsed) {
            onToggle?.(item.key);
            if (!expanded) onNavigate?.(item.children?.[0]?.path ?? item.path);
            return;
          }
          onNavigate?.(item.path);
        }}
      >
        {Icon && <Icon aria-hidden="true" />}
        <span className="rideos-menu-row-label">{item.label}</span>
        {hasChildren && <RightOutlined className={cx("row-arrow", expanded && "open")} aria-hidden="true" />}
      </button>
      {showSubmenu && (
        <div
          className={cx(
            "rideos-submenu",
            collapsed && "rideos-submenu-flyout",
            collapsed && flyoutPos && "open",
          )}
          role={collapsed ? "menu" : undefined}
          style={collapsed && flyoutPos ? { top: flyoutPos.top, left: flyoutPos.left } : undefined}
        >
          {collapsed && (
            <div className="rideos-submenu-flyout-head">
              <span>{Icon && <Icon aria-hidden="true" />}</span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.children?.length} 个功能入口</small>
              </div>
            </div>
          )}
          {item.children?.map((child) => (
            <button
              type="button"
              key={child.path}
              role={collapsed ? "menuitem" : undefined}
              className={pathname === child.path ? "active" : ""}
              onClick={() => onNavigate?.(child.path)}
            >
              <span className="rideos-submenu-dot" />
              <span className="rideos-submenu-label">{child.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export interface SidebarProps {
  brandTitle?: string;
  /** 品牌副标题(集团/平台定位文案,收起时隐藏) */
  brandSubtitle?: ReactNode;
  items: SidebarMenuItem[];
  expandedKeys: Set<string>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggleKey?: (key: string) => void;
  onNavigate?: (path: string) => void;
  pathname?: string;
  onBrandClick?: () => void;
}

/** 深色侧栏：品牌 Logo + 一/二级菜单 + 底部收起 */
export function Sidebar({
  brandTitle = "RideOS",
  brandSubtitle,
  items,
  expandedKeys,
  collapsed,
  onToggleCollapse,
  onToggleKey,
  onNavigate,
  pathname,
  onBrandClick,
}: SidebarProps) {
  return (
    <aside className={cx("rideos-sidebar", collapsed && "collapsed")} aria-label="左侧业务菜单">
      <button type="button" className="rideos-sidebar-brand" onClick={onBrandClick} aria-label="返回首页">
        <span className="rideos-sidebar-logo" aria-hidden="true">R</span>
        {!collapsed && (
          <span className="rideos-sidebar-brand-meta">
            <strong>{brandTitle}</strong>
            {brandSubtitle && <small>{brandSubtitle}</small>}
          </span>
        )}
      </button>

      <div className="rideos-side-scroll">
        {items.map((item) => (
          <MenuGroup
            key={item.key}
            item={item}
            expanded={expandedKeys.has(item.key)}
            collapsed={collapsed}
            onToggle={onToggleKey}
            onNavigate={onNavigate}
            pathname={pathname}
          />
        ))}
      </div>

      <button
        type="button"
        className="rideos-sidebar-footer"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "展开菜单" : "收起菜单"}
      >
        <MenuFoldOutlined />
        {!collapsed && <span>收起菜单</span>}
      </button>
    </aside>
  );
}
