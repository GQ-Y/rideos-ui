import PropTypes from "prop-types";
import { BrandBar } from "../BrandBar";
import { AppPageTabs } from "../AppPageTabs";
import { Sidebar } from "../Sidebar";
import { cx } from "../../utils/cx";

/**
 * 管理后台壳层（设计稿）：深色侧栏 + 白顶栏 + 页签 + 内容区
 */
export function AppShell({
  brandTitle,
  onBrandClick,
  sidebarCollapsed,
  onToggleCollapse,
  searchValue,
  onSearchChange,
  quickEntries,
  onQuickEntry,
  dateLabel,
  notificationCount,
  onNotificationClick,
  userName,
  userRole,
  onUserClick,
  tabs,
  activePath,
  onActivateTab,
  onCloseTab,
  onCloseOtherTabs,
  onPinTabTop,
  onToggleTabAffix,
  menuItems,
  expandedKeys,
  onToggleMenuKey,
  onNavigate,
  pathname,
  children,
}) {
  return (
    <div className={cx("rideos-shell", sidebarCollapsed && "sidebar-collapsed")}>
      <Sidebar
        brandTitle={brandTitle}
        items={menuItems}
        expandedKeys={expandedKeys}
        collapsed={sidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
        onToggleKey={onToggleMenuKey}
        onNavigate={onNavigate}
        pathname={pathname}
        onBrandClick={onBrandClick}
      />
      <div className="rideos-main-column">
        <BrandBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={onToggleCollapse}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          quickEntries={quickEntries}
          onQuickEntry={onQuickEntry}
          dateLabel={dateLabel}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          userName={userName}
          userRole={userRole}
          onUserClick={onUserClick}
        />
        <AppPageTabs
          tabs={tabs}
          activePath={activePath}
          onActivate={onActivateTab}
          onClose={onCloseTab}
          onCloseOthers={onCloseOtherTabs}
          onPinTop={onPinTabTop}
          onToggleAffix={onToggleTabAffix}
        />
        <main className="rideos-page-host">
          {children}
        </main>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  brandTitle: PropTypes.string,
  onBrandClick: PropTypes.func,
  sidebarCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  quickEntries: PropTypes.array,
  onQuickEntry: PropTypes.func,
  dateLabel: PropTypes.string,
  notificationCount: PropTypes.number,
  onNotificationClick: PropTypes.func,
  userName: PropTypes.string,
  userRole: PropTypes.string,
  onUserClick: PropTypes.func,
  tabs: PropTypes.array.isRequired,
  activePath: PropTypes.string.isRequired,
  onActivateTab: PropTypes.func.isRequired,
  onCloseTab: PropTypes.func.isRequired,
  onCloseOtherTabs: PropTypes.func,
  onPinTabTop: PropTypes.func,
  onToggleTabAffix: PropTypes.func,
  menuItems: PropTypes.array.isRequired,
  expandedKeys: PropTypes.instanceOf(Set).isRequired,
  onToggleMenuKey: PropTypes.func,
  onNavigate: PropTypes.func,
  pathname: PropTypes.string,
  children: PropTypes.node,
};
