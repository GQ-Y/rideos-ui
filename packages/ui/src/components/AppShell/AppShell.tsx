import type { ReactNode } from "react";
import { BrandBar } from "../BrandBar";
import type {
  BrandBarNotification,
  BrandBarQuickEntry,
  BrandBarUserMenuItem,
} from "../BrandBar";
import { AppPageTabs } from "../AppPageTabs";
import type { AppPageTab } from "../AppPageTabs";
import { Sidebar } from "../Sidebar";
import type { SidebarMenuItem } from "../Sidebar";
import { cx } from "../../utils/cx";

export interface AppShellProps {
  brandTitle?: string;
  /** 品牌副标题(集团/平台定位文案) */
  brandSubtitle?: ReactNode;
  /** 顶栏环境标识(如 生产环境/演示环境) */
  envLabel?: ReactNode;
  onBrandClick?: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  quickEntries?: BrandBarQuickEntry[];
  onQuickEntry?: (path: string) => void;
  dateLabel?: string;
  dateValue?: string;
  onDateChange?: (date: string) => void;
  notificationCount?: number;
  notifications?: BrandBarNotification[];
  onNotificationItemClick?: (item: BrandBarNotification) => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: () => void;
  userName?: string;
  userRole?: string;
  userMenuItems?: BrandBarUserMenuItem[];
  onUserMenuClick?: (key: string) => void;
  onUserClick?: () => void;
  /** 顶栏右侧扩展区(透传 BrandBar.extra) */
  brandBarExtra?: ReactNode;
  tabs: AppPageTab[];
  activePath: string;
  onActivateTab: (tab: AppPageTab) => void;
  onCloseTab: (tab: AppPageTab) => void;
  onCloseOtherTabs?: (tab: AppPageTab) => void;
  onPinTabTop?: (tab: AppPageTab) => void;
  onToggleTabAffix?: (tab: AppPageTab) => void;
  menuItems: SidebarMenuItem[];
  expandedKeys: Set<string>;
  onToggleMenuKey?: (key: string) => void;
  onNavigate?: (path: string) => void;
  pathname?: string;
  children?: ReactNode;
}

/**
 * 管理后台壳层（设计稿）：深色侧栏 + 白顶栏 + 页签 + 内容区
 */
export function AppShell({
  brandTitle,
  brandSubtitle,
  envLabel,
  onBrandClick,
  sidebarCollapsed,
  onToggleCollapse,
  searchValue,
  onSearchChange,
  quickEntries,
  onQuickEntry,
  dateLabel,
  dateValue,
  onDateChange,
  notificationCount,
  notifications,
  onNotificationItemClick,
  onMarkAllRead,
  onNotificationClick,
  userName,
  userRole,
  userMenuItems,
  onUserMenuClick,
  onUserClick,
  brandBarExtra,
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
}: AppShellProps) {
  return (
    <div className={cx("rideos-shell", sidebarCollapsed && "sidebar-collapsed")}>
      <Sidebar
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
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
          envLabel={envLabel}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          quickEntries={quickEntries}
          onQuickEntry={onQuickEntry}
          dateLabel={dateLabel}
          dateValue={dateValue}
          onDateChange={onDateChange}
          notificationCount={notificationCount}
          notifications={notifications}
          onNotificationItemClick={onNotificationItemClick}
          onMarkAllRead={onMarkAllRead}
          onNotificationClick={onNotificationClick}
          userName={userName}
          userRole={userRole}
          userMenuItems={userMenuItems}
          onUserMenuClick={onUserMenuClick}
          onUserClick={onUserClick}
          extra={brandBarExtra}
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
