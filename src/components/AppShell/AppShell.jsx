import PropTypes from "prop-types";
import { BrandBar } from "../BrandBar";
import { AppPageTabs } from "../AppPageTabs";
import { Sidebar } from "../Sidebar";
import { cx } from "../../utils/cx";

/**
 * 管理后台壳层：顶栏 + 页签 + 侧栏 + 内容区
 */
export function AppShell({
  title,
  userLabel,
  fontLarge,
  onToggleFont,
  onHome,
  onFullscreen,
  roleOptions,
  roleValue,
  onRoleChange,
  brandActions,
  tabs,
  activePath,
  onActivateTab,
  onCloseTab,
  menuTitle,
  menuItems,
  expandedKeys,
  sidebarCollapsed,
  onToggleCollapse,
  onToggleMenuKey,
  onNavigate,
  pathname,
  children,
}) {
  return (
    <div className={cx("rideos-shell", fontLarge && "font-large", sidebarCollapsed && "sidebar-collapsed")}>
      <BrandBar
        title={title}
        userLabel={userLabel}
        fontLarge={fontLarge}
        onToggleFont={onToggleFont}
        onHome={onHome}
        onFullscreen={onFullscreen}
        roleOptions={roleOptions}
        roleValue={roleValue}
        onRoleChange={onRoleChange}
        actions={brandActions}
      />
      <AppPageTabs
        tabs={tabs}
        activePath={activePath}
        onActivate={onActivateTab}
        onClose={onCloseTab}
      />
      <div className="rideos-workspace">
        <Sidebar
          title={menuTitle}
          items={menuItems}
          expandedKeys={expandedKeys}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleCollapse}
          onToggleKey={onToggleMenuKey}
          onNavigate={onNavigate}
          pathname={pathname}
        />
        <main className="rideos-page-host">
          {children}
        </main>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  title: PropTypes.string,
  userLabel: PropTypes.string,
  fontLarge: PropTypes.bool,
  onToggleFont: PropTypes.func,
  onHome: PropTypes.func,
  onFullscreen: PropTypes.func,
  roleOptions: PropTypes.array,
  roleValue: PropTypes.string,
  onRoleChange: PropTypes.func,
  brandActions: PropTypes.node,
  tabs: PropTypes.array.isRequired,
  activePath: PropTypes.string.isRequired,
  onActivateTab: PropTypes.func.isRequired,
  onCloseTab: PropTypes.func.isRequired,
  menuTitle: PropTypes.string,
  menuItems: PropTypes.array.isRequired,
  expandedKeys: PropTypes.instanceOf(Set).isRequired,
  sidebarCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  onToggleMenuKey: PropTypes.func,
  onNavigate: PropTypes.func,
  pathname: PropTypes.string,
  children: PropTypes.node,
};
