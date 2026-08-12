import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type NotificationType = "success" | "error" | "warning" | "info";

export type NotificationPlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface NotificationOptions {
  title: ReactNode;
  description?: ReactNode;
  type?: NotificationType;
  /** 自动关闭毫秒数,0 表示不自动关闭,默认 4500 */
  duration?: number;
  placement?: NotificationPlacement;
}

interface NotificationItem extends NotificationOptions {
  id: number;
}

const ICONS: Record<NotificationType, ReactNode> = {
  success: <CheckCircleFilled />,
  error: <CloseCircleFilled />,
  warning: <ExclamationCircleFilled />,
  info: <InfoCircleFilled />,
};

const PLACEMENTS: NotificationPlacement[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
];

let seed = 0;
let container: HTMLDivElement | null = null;
let push: ((item: NotificationItem) => void) | null = null;
const pending: NotificationItem[] = [];

function NotificationHost() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    push = (item) => {
      setItems((prev) => [...prev, item]);
      if (item.duration !== 0) {
        window.setTimeout(() => {
          setItems((prev) => prev.filter((current) => current.id !== item.id));
        }, item.duration ?? 4500);
      }
    };
    if (pending.length) {
      const queued = pending.splice(0, pending.length);
      queued.forEach((item) => push?.(item));
    }
    return () => {
      push = null;
    };
  }, []);

  function close(id: number) {
    setItems((prev) => prev.filter((current) => current.id !== id));
  }

  return (
    <>
      {PLACEMENTS.map((placement) => {
        const list = items.filter((item) => (item.placement ?? "top-right") === placement);
        if (list.length === 0) return null;
        return (
          <div key={placement} className={cx("rideos-notification-root", `pos-${placement}`)}>
            {list.map((item) => (
              <div key={item.id} className="rideos-notification" role="alert">
                <span className={cx("rideos-notification-icon", `type-${item.type ?? "info"}`)}>
                  {ICONS[item.type ?? "info"]}
                </span>
                <div className="rideos-notification-main">
                  <strong className="rideos-notification-title">{item.title}</strong>
                  {item.description && (
                    <div className="rideos-notification-desc">{item.description}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="rideos-notification-close"
                  aria-label="关闭通知"
                  onClick={() => close(item.id)}
                >
                  <CloseOutlined />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

function open(options: NotificationOptions) {
  if (typeof document === "undefined") return;
  seed += 1;
  const item: NotificationItem = { ...options, id: seed };
  if (push) {
    push(item);
    return;
  }
  pending.push(item);
  if (!container) {
    container = document.createElement("div");
    container.className = "rideos-notification-container";
    document.body.appendChild(container);
    createRoot(container).render(<NotificationHost />);
  }
}

/**
 * 通知提醒框(命令式):角落弹出的标题+描述通知
 * notification.success({ title, description }) 等;duration=0 不自动关闭。
 */
export const notification = {
  open,
  success: (options: Omit<NotificationOptions, "type">) => open({ ...options, type: "success" }),
  error: (options: Omit<NotificationOptions, "type">) => open({ ...options, type: "error" }),
  warning: (options: Omit<NotificationOptions, "type">) => open({ ...options, type: "warning" }),
  info: (options: Omit<NotificationOptions, "type">) => open({ ...options, type: "info" }),
};
