import { useState } from "react";
import PropTypes from "prop-types";
import { MenuFoldOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

function MenuGroup({ item, expanded, collapsed, onToggle, onNavigate, pathname }) {
  const Icon = item.icon;
  const isHome = item.key === "home";
  const childActive = item.children?.some((child) => pathname === child.path);
  const active = pathname === item.path || childActive || (!isHome && pathname.startsWith(`${item.path}/`));
  const hasChildren = Boolean(item.children?.length) && !isHome;
  const showSubmenu = hasChildren && (collapsed || expanded);
  const [flyoutPos, setFlyoutPos] = useState(null);

  function handleMouseEnter(event) {
    if (!collapsed || !hasChildren) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 56 + item.children.length * 38;
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
            onNavigate(item.path);
            return;
          }
          if (hasChildren && !collapsed) {
            onToggle(item.key);
            if (!expanded) onNavigate(item.children[0]?.path ?? item.path);
            return;
          }
          onNavigate(item.path);
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
                <small>{item.children.length} 个功能入口</small>
              </div>
            </div>
          )}
          {item.children.map((child) => (
            <button
              type="button"
              key={child.path}
              role={collapsed ? "menuitem" : undefined}
              className={pathname === child.path ? "active" : ""}
              onClick={() => onNavigate(child.path)}
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

MenuGroup.propTypes = {
  item: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
  collapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  onNavigate: PropTypes.func,
  pathname: PropTypes.string,
};

/** 深色侧栏：品牌 Logo + 一/二级菜单 + 底部收起 */
export function Sidebar({
  brandTitle = "RideOS",
  items,
  expandedKeys,
  collapsed,
  onToggleCollapse,
  onToggleKey,
  onNavigate,
  pathname,
  onBrandClick,
}) {
  return (
    <aside className={cx("rideos-sidebar", collapsed && "collapsed")} aria-label="左侧业务菜单">
      <button type="button" className="rideos-sidebar-brand" onClick={onBrandClick} aria-label="返回首页">
        <span className="rideos-sidebar-logo" aria-hidden="true">R</span>
        {!collapsed && <strong>{brandTitle}</strong>}
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

Sidebar.propTypes = {
  brandTitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  expandedKeys: PropTypes.instanceOf(Set).isRequired,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  onToggleKey: PropTypes.func,
  onNavigate: PropTypes.func,
  pathname: PropTypes.string,
  onBrandClick: PropTypes.func,
};
