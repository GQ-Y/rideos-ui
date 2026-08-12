import { useState } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface MenuItemData {
  key: string;
  label: ReactNode;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  children?: MenuItemData[];
  disabled?: boolean;
}

export interface MenuProps {
  items: MenuItemData[];
  /** 布局:vertical 垂直展开(默认)/ horizontal 水平悬浮子菜单 */
  mode?: "vertical" | "horizontal";
  /** 主题,默认 light;dark 为深色导航 */
  theme?: "light" | "dark";
  /** 受控选中项 */
  selectedKey?: string | null;
  defaultSelectedKey?: string;
  onSelect?: (key: string, item: MenuItemData) => void;
  /** 受控展开的子菜单(仅 vertical) */
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;
  className?: string;
}

/**
 * 导航菜单:通用化的水平/垂直菜单(由业务侧栏抽象而来)
 * 垂直模式子菜单展开收起;水平模式悬浮下拉。
 */
export function Menu({
  items,
  mode = "vertical",
  theme = "light",
  selectedKey: selectedProp,
  defaultSelectedKey,
  onSelect,
  openKeys: openProp,
  defaultOpenKeys = [],
  onOpenChange,
  className,
}: MenuProps) {
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelectedKey ?? null);
  const [innerOpen, setInnerOpen] = useState<string[]>(defaultOpenKeys);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const selected = selectedProp !== undefined ? selectedProp : innerSelected;
  const openKeys = openProp ?? innerOpen;

  function select(item: MenuItemData) {
    if (item.disabled) return;
    if (selectedProp === undefined) setInnerSelected(item.key);
    onSelect?.(item.key, item);
    setHoverKey(null);
  }

  function toggleOpen(key: string) {
    const next = openKeys.includes(key)
      ? openKeys.filter((k) => k !== key)
      : [...openKeys, key];
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  }

  /** 子孙中包含选中项时,父项高亮 */
  function containsSelected(item: MenuItemData): boolean {
    if (item.key === selected) return true;
    return (item.children ?? []).some(containsSelected);
  }

  function renderVertical(nodes: MenuItemData[]): ReactNode {
    return nodes.map((item) => {
      const Icon = item.icon;
      const hasChildren = Boolean(item.children && item.children.length > 0);
      const isOpen = openKeys.includes(item.key);
      return (
        <div key={item.key} className="rideos-menu-sub">
          <button
            type="button"
            disabled={item.disabled}
            className={cx(
              "rideos-menu-item",
              item.key === selected && "is-selected",
              hasChildren && containsSelected(item) && "is-active-parent",
            )}
            onClick={() => (hasChildren ? toggleOpen(item.key) : select(item))}
          >
            {Icon && <Icon className="rideos-menu-item-icon" />}
            <span className="rideos-menu-item-label">{item.label}</span>
            {hasChildren && (
              <DownOutlined className={cx("rideos-menu-item-arrow", isOpen && "is-open")} />
            )}
          </button>
          {hasChildren && isOpen && (
            <div className="rideos-menu-children">{renderVertical(item.children!)}</div>
          )}
        </div>
      );
    });
  }

  function renderHorizontal(nodes: MenuItemData[]): ReactNode {
    return nodes.map((item) => {
      const Icon = item.icon;
      const hasChildren = Boolean(item.children && item.children.length > 0);
      return (
        <div
          key={item.key}
          className="rideos-menu-hitem-wrap"
          onMouseEnter={() => hasChildren && setHoverKey(item.key)}
          onMouseLeave={() => hasChildren && setHoverKey(null)}
        >
          <button
            type="button"
            disabled={item.disabled}
            className={cx(
              "rideos-menu-item",
              "rideos-menu-hitem",
              (item.key === selected || containsSelected(item)) && "is-selected",
            )}
            onClick={() => (hasChildren ? undefined : select(item))}
          >
            {Icon && <Icon className="rideos-menu-item-icon" />}
            <span className="rideos-menu-item-label">{item.label}</span>
            {hasChildren && <RightOutlined className="rideos-menu-item-arrow rotate-down" />}
          </button>
          {hasChildren && hoverKey === item.key && (
            <div className="rideos-menu-flyout" role="menu">
              {item.children!.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <button
                    type="button"
                    key={child.key}
                    role="menuitem"
                    disabled={child.disabled}
                    className={cx(
                      "rideos-menu-flyout-item",
                      child.key === selected && "is-selected",
                    )}
                    onClick={() => select(child)}
                  >
                    {ChildIcon && <ChildIcon />}
                    <span>{child.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <nav
      className={cx("rideos-menu", `mode-${mode}`, `theme-${theme}`, className)}
      role="menubar"
      aria-orientation={mode === "horizontal" ? "horizontal" : "vertical"}
    >
      {mode === "horizontal" ? renderHorizontal(items) : renderVertical(items)}
    </nav>
  );
}
