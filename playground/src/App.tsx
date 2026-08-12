import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  AppstoreOutlined,
  BgColorsOutlined,
  CarOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import {
  AIChat,
  AppShell,
  Dropdown,
  FloatWidget,
  message,
  PageCard,
  PageHeader,
  setRideosTheme,
} from "@rideos/ui";
import type { AppPageTab, BrandBarNotification, RideosTheme } from "@rideos/ui";
import { useMockChat } from "./mockChat";
import { AdvancedPage } from "./pages/AdvancedPage";
import { AIChatPage } from "./pages/AIChatPage";
import { AuthLauncherPage, AuthStandalone } from "./pages/AuthPages";
import { DateTimePage } from "./pages/DateTimePage";
import { FormPage } from "./pages/FormPage";
import { NavPage } from "./pages/NavPage";
import { ProPage } from "./pages/ProPage";
import { ToolsPage } from "./pages/ToolsPage";
import { BasePage } from "./pages/BasePage";
import { ChartsPage } from "./pages/ChartsPage";
import { DataPage } from "./pages/DataPage";
import { DetailPage } from "./pages/DetailPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { GeoFencePage } from "./pages/GeoFencePage";
import { HomePage } from "./pages/HomePage";
import { ResourcePage } from "./pages/ResourcePage";
import { VehicleListPage } from "./pages/VehicleListPage";

/* ---------------- 菜单 ---------------- */

interface MenuChild {
  label: string;
  path: string;
}

interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType;
  children?: MenuChild[];
}

const MENU_ITEMS: MenuItem[] = [
  { key: "home", label: "工作台", path: "/home", icon: DashboardOutlined },
  {
    key: "kit",
    label: "组件示例",
    path: "/kit",
    icon: AppstoreOutlined,
    children: [
      { label: "基础组件", path: "/kit/base" },
      { label: "表单与校验", path: "/kit/form" },
      { label: "反馈与弹层", path: "/kit/feedback" },
      { label: "数据展示", path: "/kit/data" },
      { label: "导航与布局", path: "/kit/nav" },
      { label: "日期与时间", path: "/kit/datetime" },
      { label: "树与进阶", path: "/kit/advanced" },
      { label: "详情布局", path: "/kit/detail" },
      { label: "列表页模板", path: "/kit/resource" },
      { label: "围栏编辑器", path: "/kit/geofence" },
      { label: "图表组件", path: "/kit/charts" },
      { label: "AI 对话", path: "/kit/aichat" },
      { label: "页面工具", path: "/kit/tools" },
      { label: "业务 Pro", path: "/kit/pro" },
      { label: "综合场景示例", path: "/kit/scene" },
      { label: "登录 / 认证页", path: "/kit/auth" },
    ],
  },
];

interface PathInfo {
  label: string;
  icon: ComponentType;
  domainLabel: string;
}

const PATH_INFO: Record<string, PathInfo> = {};
for (const item of MENU_ITEMS) {
  PATH_INFO[item.path] = { label: item.label, icon: item.icon, domainLabel: item.label };
  for (const child of item.children ?? []) {
    PATH_INFO[child.path] = { label: child.label, icon: item.icon, domainLabel: item.label };
  }
}

const HOME_TAB: AppPageTab = { path: "/home", label: "工作台", icon: DashboardOutlined, pinned: true };

const INITIAL_NOTIFICATIONS: BrandBarNotification[] = [
  { id: "n1", title: "3 辆车触发电子围栏告警", desc: "青浦主城服务区边界外停放", time: "14:20", read: false },
  { id: "n2", title: "退款审核待处理 12 单", desc: "订单中心 → 退款审核", time: "11:05", read: false },
  { id: "n3", title: "本周运营周报已生成", desc: "点击查看数据详情", time: "09:00", read: false },
  { id: "n4", title: "系统维护通知", desc: "周日 02:00-04:00 结算服务升级", time: "昨天", read: true },
  { id: "n5", title: "新司机入驻审核通过", desc: "王建国 等 5 人", time: "昨天", read: true },
];

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const week = "日一二三四五六"[date.getDay()];
  return `${dateStr} 周${week}`;
}

function todayStr() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const QUICK_ENTRIES = [
  { label: "组件总览", path: "/home", icon: AppstoreOutlined },
  { label: "综合场景示例", path: "/kit/scene", icon: CarOutlined },
  { label: "围栏编辑", path: "/kit/geofence", icon: EnvironmentOutlined },
];

function tabFor(path: string): AppPageTab {
  const info = PATH_INFO[path];
  return { path, label: info?.label ?? path, icon: info?.icon, domainLabel: info?.domainLabel };
}

/* ---------------- 占位页 ---------------- */

function PlaceholderPage({ path }: { path: string }) {
  const info = PATH_INFO[path];
  return (
    <>
      <PageHeader
        breadcrumb={[info?.domainLabel, info?.label].filter(Boolean) as string[]}
        title={info?.label ?? path}
        description={`路径 ${path} 的演示占位页。`}
      />
      <PageCard>
        <p style={{ margin: 0, color: "#8c8c8c" }}>
          这是演示占位内容,可切换左侧菜单或顶部页签体验壳层交互。
        </p>
      </PageCard>
    </>
  );
}

/* ---------------- 主题切换 ---------------- */

const THEME_META: Record<RideosTheme, { label: string; icon: ComponentType }> = {
  light: { label: "浅色", icon: SunOutlined },
  green: { label: "墨绿", icon: BgColorsOutlined },
  dark: { label: "暗色", icon: MoonOutlined },
};

const THEME_ORDER: RideosTheme[] = ["light", "green", "dark"];

function readStoredTheme(): RideosTheme {
  if (typeof localStorage === "undefined") return "green";
  const value = localStorage.getItem("rideos-theme");
  return value === "light" || value === "dark" ? value : "green";
}

/** 顶栏主题切换:浅色 / 墨绿 / 暗色,记忆到 localStorage */
function ThemeToggle() {
  const [theme, setTheme] = useState<RideosTheme>(readStoredTheme);

  useEffect(() => {
    setRideosTheme(theme);
    localStorage.setItem("rideos-theme", theme);
  }, [theme]);

  const CurrentIcon = THEME_META[theme].icon;
  return (
    <Dropdown
      align="end"
      items={THEME_ORDER.map((key) => ({
        key,
        label: key === theme ? `${THEME_META[key].label} ✓` : THEME_META[key].label,
        icon: THEME_META[key].icon,
      }))}
      onSelect={(key) => setTheme(key as RideosTheme)}
    >
      <button type="button" className="rideos-topbar-pill" aria-label="切换主题">
        <CurrentIcon />
        <span>{THEME_META[theme].label} 主题</span>
      </button>
    </Dropdown>
  );
}

/** 全局智能客服浮窗:FloatWidget + AIChat 组合 */
function SupportWidget() {
  const { messages, send, stop } = useMockChat([
    {
      id: "hi",
      role: "assistant",
      content: "你好,我是在线客服小 R,有问题随时问我~",
    },
  ]);
  const [open, setOpen] = useState(false);

  return (
    <FloatWidget
      position="bottom-right"
      open={open}
      onOpenChange={setOpen}
      badge={open ? 0 : 1}
      panelTitle="在线客服"
      panelWidth={380}
      panelHeight={560}
    >
      <AIChat
        showHeader={false}
        messages={messages}
        onSend={send}
        onStop={stop}
        height="100%"
        suggestions={["如何退款?", "如何接入组件库?"]}
      />
    </FloatWidget>
  );
}

export function App() {
  const [pathname, setPathname] = useState("/home");
  const [tabs, setTabs] = useState<AppPageTab[]>(() => [HOME_TAB]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set(["kit"]));
  const [searchValue, setSearchValue] = useState("");
  const [bizDate, setBizDate] = useState(todayStr);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const dateLabel = useMemo(() => formatDateLabel(bizDate), [bizDate]);

  function flash(content: string) {
    message.info(content);
  }

  function navigate(path: string) {
    setPathname(path);
    /* 认证页为全屏独立路由,不进入页签 */
    if (path.startsWith("/auth")) return;
    setTabs((prev) => (prev.some((tab) => tab.path === path) ? prev : [...prev, tabFor(path)]));
  }

  function closeTab(tab: AppPageTab) {
    const next = tabs.filter((item) => item.path !== tab.path);
    setTabs(next);
    if (pathname === tab.path) setPathname(next[next.length - 1]?.path ?? HOME_TAB.path);
  }

  /* 全屏认证页:脱离后台壳层渲染 */
  if (pathname.startsWith("/auth")) {
    return <AuthStandalone pathname={pathname} onNavigate={navigate} flash={flash} />;
  }

  let page;
  switch (pathname) {
    case "/home":
      page = <HomePage onNavigate={navigate} />;
      break;
    case "/kit/base":
      page = <BasePage />;
      break;
    case "/kit/form":
      page = <FormPage />;
      break;
    case "/kit/nav":
      page = <NavPage />;
      break;
    case "/kit/pro":
      page = <ProPage />;
      break;
    case "/kit/tools":
      page = <ToolsPage />;
      break;
    case "/kit/feedback":
      page = <FeedbackPage />;
      break;
    case "/kit/data":
      page = <DataPage />;
      break;
    case "/kit/datetime":
      page = <DateTimePage />;
      break;
    case "/kit/advanced":
      page = <AdvancedPage />;
      break;
    case "/kit/detail":
      page = <DetailPage onBack={() => navigate("/kit/resource")} onNavigate={navigate} />;
      break;
    case "/kit/resource":
      page = <ResourcePage onNavigate={navigate} />;
      break;
    case "/kit/geofence":
      page = <GeoFencePage />;
      break;
    case "/kit/charts":
      page = <ChartsPage />;
      break;
    case "/kit/aichat":
      page = <AIChatPage />;
      break;
    case "/kit/scene":
      page = <VehicleListPage />;
      break;
    case "/kit/auth":
      page = <AuthLauncherPage onNavigate={navigate} />;
      break;
    default:
      page = <PlaceholderPage path={pathname} />;
  }

  return (
    <>
      <AppShell
        brandTitle="RideOS"
        brandSubtitle="集团数字化运营平台"
        envLabel="演示环境"
        onBrandClick={() => navigate(HOME_TAB.path)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        quickEntries={QUICK_ENTRIES}
        onQuickEntry={navigate}
        dateLabel={dateLabel}
        dateValue={bizDate}
        onDateChange={(date) => {
          setBizDate(date);
          flash(`业务日期已切换为 ${formatDateLabel(date)}`);
        }}
        notifications={notifications}
        onNotificationItemClick={(item) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
          );
          flash(`已查看:${item.title}`);
        }}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          flash("全部消息已标记为已读");
        }}
        userName="平台管理员"
        userRole="超级管理员"
        onUserMenuClick={(key) => {
          const labels: Record<string, string> = {
            profile: "个人中心",
            settings: "账号设置",
            logout: "退出登录",
          };
          flash(`已触发:${labels[key] ?? key}(演示环境仅提示)`);
        }}
        brandBarExtra={<ThemeToggle />}
        tabs={tabs}
        activePath={pathname}
        onActivateTab={(tab) => setPathname(tab.path)}
        onCloseTab={closeTab}
        onCloseOtherTabs={(tab) => {
          const next = tabs.filter(
            (item) => item.pinned || item.affixed || item.path === tab.path,
          );
          setTabs(next);
          if (!next.some((item) => item.path === pathname)) setPathname(tab.path);
        }}
        onPinTabTop={(tab) => {
          const pinned = tabs.filter((item) => item.pinned);
          const rest = tabs.filter((item) => !item.pinned && item.path !== tab.path);
          setTabs([...pinned, tab, ...rest]);
        }}
        onToggleTabAffix={(tab) => {
          setTabs(
            tabs.map((item) =>
              item.path === tab.path ? { ...item, affixed: !item.affixed } : item,
            ),
          );
        }}
        menuItems={MENU_ITEMS}
        expandedKeys={expandedKeys}
        onToggleMenuKey={(key) => {
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          });
        }}
        onNavigate={navigate}
        pathname={pathname}
      >
        {page}
      </AppShell>
      <SupportWidget />
    </>
  );
}
