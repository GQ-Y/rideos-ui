import PropTypes from "prop-types";
import { MenuFoldOutlined, MenuUnfoldOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

function MenuGroup({ item, expanded, collapsed, onToggle, onNavigate, pathname }) {
  const Icon = item.icon;
  const childActive = item.children?.some((child) => pathname === child.path);
  const active = pathname === item.path || childActive || pathname.startsWith(`${item.path}/`);
  const hasChildren = Boolean(item.children?.length);

  return (
    <div className={cx("rideos-menu-group", active && "active")}>
      <button
        type="button"
        className={cx("rideos-menu-row", active && "active")}
        aria-label={collapsed ? item.label : undefined}
        title={collapsed ? item.label : undefined}
        onClick={() => {
          onNavigate(item.path);
          if (hasChildren && !collapsed) onToggle(item.key);
        }}
      >
        {Icon && <Icon aria-hidden="true" />}
        <span className="rideos-menu-row-label">{item.label}</span>
        {item.roleLabel && <small className="rideos-menu-role">{item.roleLabel}</small>}
        {hasChildren && <RightOutlined className={cx("row-arrow", expanded && "open")} aria-hidden="true" />}
      </button>
      {hasChildren && expanded && !collapsed && (
        <div className="rideos-submenu">
          {item.children.map((child) => (
            <button
              type="button"
              key={child.path}
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

/** 左侧业务菜单 */
export function Sidebar({
  title = "业务菜单",
  items,
  expandedKeys,
  collapsed,
  onToggleCollapse,
  onToggleKey,
  onNavigate,
  pathname,
}) {
  return (
    <aside className={cx("rideos-sidebar", collapsed && "collapsed")} aria-label="左侧业务菜单">
      <div className="rideos-sidebar-toolbar">
        <strong>{title}</strong>
        <button
          type="button"
          className="rideos-sidebar-collapse"
          aria-label={collapsed ? "展开左侧菜单" : "收起左侧菜单"}
          onClick={onToggleCollapse}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
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
    </aside>
  );
}

Sidebar.propTypes = {
  title: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  expandedKeys: PropTypes.instanceOf(Set).isRequired,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  onToggleKey: PropTypes.func,
  onNavigate: PropTypes.func,
  pathname: PropTypes.string,
};
