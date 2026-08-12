import { useEffect, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
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

export type FloatWidgetPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface FloatWidgetProps {
  /** 停靠角,默认右下 */
  position?: FloatWidgetPosition;
  /** 距屏幕边缘的偏移,默认 { x: 24, y: 24 } */
  offset?: { x?: number; y?: number };
  /** 自定义触发钮内容(渲染在圆形按钮内) */
  trigger?: ReactNode;
  /** 触发钮角标数(如未读消息数),0 或 undefined 不显示 */
  badge?: number;
  /** 受控展开状态 */
  open?: boolean;
  /** 非受控默认展开状态 */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 面板标题 */
  panelTitle?: ReactNode;
  /** 面板宽度,默认 360 */
  panelWidth?: number;
  /** 面板高度,默认 520 */
  panelHeight?: number;
  /** 面板头部显示关闭按钮,默认 true */
  closable?: boolean;
  /** Esc 键关闭,默认 true */
  keyboard?: boolean;
  /** 层级,默认走 --rideos-z-float(1100) */
  zIndex?: number;
  /** 面板内容(如放入 AIChat 组成智能客服) */
  children?: ReactNode;
  className?: string;
}

const TRIGGER_SIZE = 56;
const PANEL_GAP = 12;

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M12 3c5.24 0 9.5 3.58 9.5 8s-4.26 8-9.5 8c-1.06 0-2.08-.14-3.03-.4L4.5 20.5l1.14-3.42C4.03 15.64 2.5 13.94 2.5 11c0-4.42 4.26-8 9.5-8Zm-4 9.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm4 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm4 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3a1 1 0 0 0-1.4 1.4L10.83 12 5.7 16.9a1 1 0 1 0 1.4 1.4L12 14.83l4.9 4.87a1 1 0 0 0 1.4-1.4L13.17 12l5.13-4.9Z" />
    </svg>
  );
}

/** 计算触发钮与面板在四角的定位样式 */
function cornerStyles(
  position: FloatWidgetPosition,
  x: number,
  y: number,
): { trigger: CSSProperties; panel: CSSProperties } {
  const isTop = position.startsWith("top");
  const isLeft = position.endsWith("left");
  const horizontal: CSSProperties = isLeft ? { left: x } : { right: x };
  const triggerVertical: CSSProperties = isTop ? { top: y } : { bottom: y };
  const panelVertical: CSSProperties = isTop
    ? { top: y + TRIGGER_SIZE + PANEL_GAP }
    : { bottom: y + TRIGGER_SIZE + PANEL_GAP };
  return {
    trigger: { ...horizontal, ...triggerVertical },
    panel: { ...horizontal, ...panelVertical },
  };
}

/**
 * 四角浮窗:固定在屏幕某个角的悬浮触发钮 + 弹出面板
 * 典型场景:右下角在线客服 / AI 助手(面板内放 AIChat)。
 */
export function FloatWidget({
  position = "bottom-right",
  offset,
  trigger,
  badge,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  panelTitle,
  panelWidth = 360,
  panelHeight = 520,
  closable = true,
  keyboard = true,
  zIndex,
  children,
  className,
}: FloatWidgetProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const mounted = useMounted();
  const open = openProp ?? innerOpen;

  useEffect(() => {
    if (!keyboard || !open) return;
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboard, open]);

  function setOpen(next: boolean) {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  }

  /* SSR 下不渲染,挂载后再 portal 到 body */
  if (!mounted || typeof document === "undefined") return null;

  const x = offset?.x ?? 24;
  const y = offset?.y ?? 24;
  const styles = cornerStyles(position, x, y);
  const layerStyle: CSSProperties | undefined =
    zIndex != null ? { zIndex } : undefined;

  return createPortal(
    <div className={cx("rideos-float-widget", `pos-${position}`, className)}>
      {open ? (
        <div
          className="rideos-float-panel"
          role="dialog"
          aria-modal="false"
          style={{ ...styles.panel, ...layerStyle, width: panelWidth, height: panelHeight }}
        >
          {panelTitle || closable ? (
            <div className="rideos-float-panel-head">
              <div className="rideos-float-panel-title">{panelTitle}</div>
              {closable ? (
                <button
                  type="button"
                  className="rideos-float-panel-close"
                  aria-label="关闭"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="rideos-float-panel-body">{children}</div>
        </div>
      ) : null}
      <button
        type="button"
        className={cx("rideos-float-trigger", open && "is-open")}
        style={{ ...styles.trigger, ...layerStyle }}
        aria-label={open ? "收起浮窗" : "打开浮窗"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <CloseIcon size={22} /> : (trigger ?? <ChatIcon />)}
        {!open && badge ? (
          <span className="rideos-float-badge">{badge > 99 ? "99+" : badge}</span>
        ) : null}
      </button>
    </div>,
    document.body,
  );
}
