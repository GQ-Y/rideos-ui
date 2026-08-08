import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  BellOutlined,
  CalendarOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";

/**
 * 顶栏（白底）：折叠、全局搜索、快速入口、日期、消息铃铛、用户身份
 * 对齐 RideOS 总平台设计稿右上角细节
 */
export function BrandBar({
  sidebarCollapsed = false,
  onToggleCollapse,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "搜索菜单、数据、功能或帮助",
  quickEntries = [],
  onQuickEntry,
  dateLabel,
  notificationCount = 0,
  onNotificationClick,
  userName = "平台管理员",
  userRole = "超级管理员",
  onUserClick,
}) {
  const [quickOpen, setQuickOpen] = useState(false);
  const quickRef = useRef(null);

  useEffect(() => {
    if (!quickOpen) return undefined;
    function onPointer(event) {
      if (!quickRef.current?.contains(event.target)) setQuickOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [quickOpen]);

  return (
    <header className="rideos-topbar">
      <div className="rideos-topbar-left">
        <button
          type="button"
          className="rideos-topbar-icon-btn"
          aria-label={sidebarCollapsed ? "展开菜单" : "收起菜单"}
          onClick={onToggleCollapse}
        >
          {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
        <label className="rideos-topbar-search">
          <SearchOutlined aria-hidden="true" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>
      </div>

      <div className="rideos-topbar-right">
        <div className="rideos-quick-entry" ref={quickRef}>
          <button
            type="button"
            className={`rideos-topbar-pill${quickOpen ? " open" : ""}`}
            aria-haspopup="menu"
            aria-expanded={quickOpen}
            onClick={() => setQuickOpen((value) => !value)}
          >
            <ThunderboltOutlined />
            <span>快速入口</span>
            <DownOutlined className="rideos-caret" />
          </button>
          {quickOpen && (
            <div className="rideos-quick-menu" role="menu">
              {quickEntries.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.path}
                    role="menuitem"
                    onClick={() => {
                      setQuickOpen(false);
                      onQuickEntry?.(item.path);
                    }}
                  >
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button type="button" className="rideos-topbar-pill rideos-date-pill" aria-label="业务日期">
          <CalendarOutlined />
          <span>{dateLabel}</span>
        </button>

        <button
          type="button"
          className="rideos-notify-btn"
          aria-label={`消息通知，${notificationCount} 条`}
          onClick={onNotificationClick}
        >
          <BellOutlined />
          {notificationCount > 0 && (
            <b>{notificationCount > 99 ? "99+" : notificationCount}</b>
          )}
        </button>

        <button type="button" className="rideos-user-block" aria-label="用户菜单" onClick={onUserClick}>
          <span className="rideos-user-avatar" aria-hidden="true">
            <UserOutlined />
          </span>
          <span className="rideos-user-meta">
            <strong>{userName}</strong>
            <small>{userRole}</small>
          </span>
          <DownOutlined className="rideos-caret" />
        </button>
      </div>
    </header>
  );
}

BrandBar.propTypes = {
  sidebarCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  quickEntries: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
  })),
  onQuickEntry: PropTypes.func,
  dateLabel: PropTypes.string,
  notificationCount: PropTypes.number,
  onNotificationClick: PropTypes.func,
  userName: PropTypes.string,
  userRole: PropTypes.string,
  onUserClick: PropTypes.func,
};
