import { useEffect, useRef, useState } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  BellOutlined,
  CalendarOutlined,
  DownOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";

/** 快速入口项 */
export interface BrandBarQuickEntry {
  label: string;
  path: string;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
}

/** 消息通知项 */
export interface BrandBarNotification {
  id: string;
  title: ReactNode;
  desc?: ReactNode;
  time?: ReactNode;
  read?: boolean;
}

/** 用户菜单项 */
export interface BrandBarUserMenuItem {
  key: string;
  label: ReactNode;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  danger?: boolean;
}

export interface BrandBarProps {
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  quickEntries?: BrandBarQuickEntry[];
  onQuickEntry?: (path: string) => void;
  /** 业务日期显示文案(不传 dateValue 时直接展示) */
  dateLabel?: string;
  /** 业务日期(YYYY-MM-DD)。与 onDateChange 搭配后,日期钮可点开月历选择 */
  dateValue?: string;
  /** 选择业务日期回调;提供后日历面板启用 */
  onDateChange?: (date: string) => void;
  /** 未读消息数(传入 notifications 时自动按未读数计算) */
  notificationCount?: number;
  /** 消息列表;提供后铃铛点开通知面板 */
  notifications?: BrandBarNotification[];
  /** 点击单条消息 */
  onNotificationItemClick?: (item: BrandBarNotification) => void;
  /** 「全部已读」回调 */
  onMarkAllRead?: () => void;
  /** 未提供 notifications 时,点击铃铛的回调(兼容旧用法) */
  onNotificationClick?: () => void;
  userName?: string;
  userRole?: string;
  /** 用户菜单项;缺省提供 个人中心/账号设置/退出登录 */
  userMenuItems?: BrandBarUserMenuItem[];
  /** 点击用户菜单项 */
  onUserMenuClick?: (key: string) => void;
  /** 未启用用户菜单时,点击用户区的回调(兼容旧用法) */
  onUserClick?: () => void;
  /** 右侧扩展区(渲染在快速入口之前,常放主题切换等) */
  extra?: ReactNode;
  /** 环境标识(如 生产环境/演示环境),渲染在折叠钮之后 */
  envLabel?: ReactNode;
}

const DEFAULT_USER_MENU: BrandBarUserMenuItem[] = [
  { key: "profile", label: "个人中心" },
  { key: "settings", label: "账号设置" },
  { key: "logout", label: "退出登录", danger: true },
];

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** 月历面板(BrandBar 内部;后续 DatePicker 组件将复用) */
function CalendarPanel({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (date: string) => void;
}) {
  const base = value ? new Date(value) : new Date();
  const valid = Number.isNaN(base.getTime()) ? new Date() : base;
  const [viewYear, setViewYear] = useState(valid.getFullYear());
  const [viewMonth, setViewMonth] = useState(valid.getMonth());

  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const now = new Date();
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  function shiftMonth(step: number) {
    const next = new Date(viewYear, viewMonth + step, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className="rideos-topbar-cal" role="dialog" aria-label="选择业务日期">
      <div className="rideos-topbar-cal-head">
        <button type="button" aria-label="上一月" onClick={() => shiftMonth(-1)}>
          <LeftOutlined />
        </button>
        <strong>
          {viewYear} 年 {viewMonth + 1} 月
        </strong>
        <button type="button" aria-label="下一月" onClick={() => shiftMonth(1)}>
          <RightOutlined />
        </button>
      </div>
      <div className="rideos-topbar-cal-grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="rideos-topbar-cal-week">
            {day}
          </span>
        ))}
        {Array.from({ length: startWeekday }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const dateStr = formatDate(viewYear, viewMonth, i + 1);
          return (
            <button
              type="button"
              key={dateStr}
              className={cx(
                "rideos-topbar-cal-day",
                dateStr === todayStr && "is-today",
                dateStr === value && "is-selected",
              )}
              onClick={() => onSelect(dateStr)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="rideos-topbar-cal-foot">
        <button type="button" onClick={() => onSelect(todayStr)}>
          回到今天
        </button>
      </div>
    </div>
  );
}

type PopKey = "quick" | "date" | "notify" | "user";

/**
 * 顶栏(白底):折叠、全局搜索、快速入口、业务日期(月历)、消息通知、用户菜单
 * 日期/消息/用户均为可交互下拉面板,由受控 props 驱动
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
  dateValue,
  onDateChange,
  notificationCount = 0,
  notifications,
  onNotificationItemClick,
  onMarkAllRead,
  onNotificationClick,
  userName = "平台管理员",
  userRole = "超级管理员",
  userMenuItems,
  onUserMenuClick,
  onUserClick,
  extra,
  envLabel,
}: BrandBarProps) {
  const [openPop, setOpenPop] = useState<PopKey | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  /* Ctrl/Cmd + K 聚焦全局搜索 */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!openPop) return undefined;
    function onPointer(event: MouseEvent) {
      if (!hostRef.current?.contains(event.target as Node | null)) setOpenPop(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPop(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openPop]);

  function togglePop(key: PopKey) {
    setOpenPop((current) => (current === key ? null : key));
  }

  const unreadCount = notifications
    ? notifications.filter((item) => !item.read).length
    : notificationCount;
  const menuItems = userMenuItems ?? (onUserMenuClick ? DEFAULT_USER_MENU : null);
  const dateInteractive = Boolean(onDateChange);

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
        {envLabel && <span className="rideos-topbar-env">{envLabel}</span>}
        <label className="rideos-topbar-search">
          <SearchOutlined aria-hidden="true" />
          <input
            ref={searchRef}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
          />
          <kbd className="rideos-topbar-kbd" aria-hidden="true">Ctrl K</kbd>
        </label>
      </div>

      <div className="rideos-topbar-right" ref={hostRef}>
        {extra}

        <div className="rideos-topbar-pop-host">
          <button
            type="button"
            className={cx("rideos-topbar-pill", openPop === "quick" && "open")}
            aria-haspopup="menu"
            aria-expanded={openPop === "quick"}
            onClick={() => togglePop("quick")}
          >
            <ThunderboltOutlined />
            <span>快速入口</span>
            <DownOutlined className="rideos-caret" />
          </button>
          {openPop === "quick" && (
            <div className="rideos-quick-menu" role="menu">
              {quickEntries.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.path}
                    role="menuitem"
                    onClick={() => {
                      setOpenPop(null);
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

        <div className="rideos-topbar-pop-host">
          <button
            type="button"
            className={cx(
              "rideos-topbar-pill",
              "rideos-date-pill",
              openPop === "date" && "open",
              !dateInteractive && "is-static",
            )}
            aria-label="业务日期"
            aria-haspopup={dateInteractive ? "dialog" : undefined}
            aria-expanded={dateInteractive ? openPop === "date" : undefined}
            onClick={dateInteractive ? () => togglePop("date") : undefined}
          >
            <CalendarOutlined />
            <span>{dateLabel}</span>
            {dateInteractive && <DownOutlined className="rideos-caret" />}
          </button>
          {openPop === "date" && dateInteractive && (
            <CalendarPanel
              value={dateValue}
              onSelect={(date) => {
                setOpenPop(null);
                onDateChange?.(date);
              }}
            />
          )}
        </div>

        <div className="rideos-topbar-pop-host">
          <button
            type="button"
            className="rideos-notify-btn"
            aria-label={`消息通知,${unreadCount} 条未读`}
            aria-haspopup={notifications ? "menu" : undefined}
            aria-expanded={notifications ? openPop === "notify" : undefined}
            onClick={() => {
              if (notifications) togglePop("notify");
              else onNotificationClick?.();
            }}
          >
            <BellOutlined />
            {unreadCount > 0 && <b>{unreadCount > 99 ? "99+" : unreadCount}</b>}
          </button>
          {openPop === "notify" && notifications && (
            <div className="rideos-notify-menu" role="menu" aria-label="消息通知">
              <div className="rideos-notify-menu-head">
                <strong>消息通知</strong>
                {unreadCount > 0 && onMarkAllRead && (
                  <button type="button" onClick={onMarkAllRead}>
                    全部已读
                  </button>
                )}
              </div>
              <div className="rideos-notify-menu-list">
                {notifications.length === 0 ? (
                  <div className="rideos-notify-menu-empty">暂无消息</div>
                ) : (
                  notifications.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      role="menuitem"
                      className={cx("rideos-notify-item", !item.read && "unread")}
                      onClick={() => {
                        setOpenPop(null);
                        onNotificationItemClick?.(item);
                      }}
                    >
                      <span className="rideos-notify-item-dot" aria-hidden="true" />
                      <span className="rideos-notify-item-main">
                        <strong>{item.title}</strong>
                        {item.desc && <small>{item.desc}</small>}
                      </span>
                      {item.time && <span className="rideos-notify-item-time">{item.time}</span>}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rideos-topbar-pop-host">
          <button
            type="button"
            className={cx("rideos-user-block", openPop === "user" && "open")}
            aria-label="用户菜单"
            aria-haspopup={menuItems ? "menu" : undefined}
            aria-expanded={menuItems ? openPop === "user" : undefined}
            onClick={() => {
              if (menuItems) togglePop("user");
              else onUserClick?.();
            }}
          >
            <span className="rideos-user-avatar" aria-hidden="true">
              <UserOutlined />
            </span>
            <span className="rideos-user-meta">
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </span>
            <DownOutlined className="rideos-caret" />
          </button>
          {openPop === "user" && menuItems && (
            <div className="rideos-quick-menu rideos-user-menu" role="menu" aria-label="用户菜单">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.key}
                    role="menuitem"
                    className={cx(item.danger && "danger")}
                    onClick={() => {
                      setOpenPop(null);
                      onUserMenuClick?.(item.key);
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
      </div>
    </header>
  );
}
