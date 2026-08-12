export type RideosTheme = "green" | "light" | "dark";

const THEME_ATTR = "data-rideos-theme";

/** 主题循环顺序:墨绿 → 浅色 → 暗色 */
const THEME_CYCLE: RideosTheme[] = ["green", "light", "dark"];

/**
 * 切换主题:在 html(或指定容器)上设置 data-rideos-theme。
 * - green(墨绿,品牌默认):移除属性,走基础样式
 * - light(浅色):侧栏/导航浅色化
 * - dark(暗色):全局深色
 * SSR 环境下安全空操作。
 */
export function setRideosTheme(theme: RideosTheme, target?: HTMLElement) {
  if (typeof document === "undefined") return;
  const el = target ?? document.documentElement;
  if (theme === "green") el.removeAttribute(THEME_ATTR);
  else el.setAttribute(THEME_ATTR, theme);
}

/** 读取当前主题,未设置时为墨绿(品牌默认) */
export function getRideosTheme(target?: HTMLElement): RideosTheme {
  if (typeof document === "undefined") return "green";
  const el = target ?? document.documentElement;
  const value = el.getAttribute(THEME_ATTR);
  return value === "dark" || value === "light" ? value : "green";
}

/** 按 墨绿 → 浅色 → 暗色 循环切换,返回切换后的主题 */
export function toggleRideosTheme(target?: HTMLElement): RideosTheme {
  const current = getRideosTheme(target);
  const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];
  setRideosTheme(next, target);
  return next;
}
