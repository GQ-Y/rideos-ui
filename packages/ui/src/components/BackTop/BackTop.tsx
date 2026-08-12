import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";

const noopSubscribe = () => () => {};

/** SSR 安全的挂载检测:服务端为 false,客户端水合后为 true */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export interface BackTopProps {
  /** 监听滚动的目标容器,默认整页(window / documentElement) */
  target?: () => HTMLElement;
  /** 滚动超过该高度(px)才显示,默认 400 */
  visibilityHeight?: number;
  /** 自定义按钮内容,默认圆形按钮内上箭头 */
  children?: ReactNode;
  className?: string;
}

function UpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 4.2a1 1 0 0 1 .71.3l6.3 6.29a1 1 0 1 1-1.42 1.42L13 7.62V19a1 1 0 1 1-2 0V7.62l-4.6 4.59a1 1 0 1 1-1.4-1.42l6.29-6.29a1 1 0 0 1 .71-.3Z" />
    </svg>
  );
}

/**
 * 回到顶部:滚动超过阈值后显示,点击平滑滚回顶部
 * 固定在视口右下角(bottom 100px,避开右下角客服浮窗),portal 到 body。
 */
export function BackTop({ target, visibilityHeight = 400, children, className }: BackTopProps) {
  const [visible, setVisible] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    const el = target?.();
    const listenTarget: HTMLElement | Window = el ?? window;
    const readScrollTop = () =>
      el ? el.scrollTop : window.scrollY || document.documentElement.scrollTop || 0;
    const handleScroll = () => setVisible(readScrollTop() > visibilityHeight);
    handleScroll();
    listenTarget.addEventListener("scroll", handleScroll);
    return () => listenTarget.removeEventListener("scroll", handleScroll);
  }, [target, visibilityHeight]);

  function scrollToTop() {
    const el = target?.() ?? document.scrollingElement ?? document.documentElement;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!mounted || typeof document === "undefined" || !visible) return null;

  return createPortal(
    <button
      type="button"
      className={cx("rideos-backtop", className)}
      aria-label="回到顶部"
      onClick={scrollToTop}
    >
      {children ?? <UpIcon />}
    </button>,
    document.body,
  );
}
