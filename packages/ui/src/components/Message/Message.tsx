import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type MessageType = "success" | "error" | "warning" | "info";

interface MessageItem {
  id: number;
  type: MessageType;
  content: ReactNode;
  duration: number;
}

const ICONS: Record<MessageType, ReactNode> = {
  success: <CheckCircleFilled />,
  error: <CloseCircleFilled />,
  warning: <ExclamationCircleFilled />,
  info: <InfoCircleFilled />,
};

let seed = 0;
let container: HTMLDivElement | null = null;
let push: ((item: MessageItem) => void) | null = null;
const pending: MessageItem[] = [];

function MessageHost() {
  const [items, setItems] = useState<MessageItem[]>([]);

  useEffect(() => {
    push = (item) => {
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((current) => current.id !== item.id));
      }, item.duration);
    };
    if (pending.length) {
      const queued = pending.splice(0, pending.length);
      queued.forEach((item) => push?.(item));
    }
    return () => {
      push = null;
    };
  }, []);

  return (
    <div className="rideos-message-root" role="status" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={cx("rideos-message", `type-${item.type}`)}>
          <span className="rideos-message-icon">{ICONS[item.type]}</span>
          <span className="rideos-message-content">{item.content}</span>
        </div>
      ))}
    </div>
  );
}

function show(type: MessageType, content: ReactNode, duration = 2500) {
  if (typeof document === "undefined") return;
  seed += 1;
  const item: MessageItem = { id: seed, type, content, duration };
  if (push) {
    push(item);
    return;
  }
  pending.push(item);
  if (!container) {
    container = document.createElement("div");
    container.className = "rideos-message-container";
    document.body.appendChild(container);
    createRoot(container).render(<MessageHost />);
  }
}

/**
 * 全局轻提示(命令式):message.success("已保存")
 * duration 单位毫秒,默认 2500。
 */
export const message = {
  success: (content: ReactNode, duration?: number) => show("success", content, duration),
  error: (content: ReactNode, duration?: number) => show("error", content, duration),
  warning: (content: ReactNode, duration?: number) => show("warning", content, duration),
  info: (content: ReactNode, duration?: number) => show("info", content, duration),
};
