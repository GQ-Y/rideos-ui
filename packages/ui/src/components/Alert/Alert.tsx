import { useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type AlertType = "success" | "info" | "warning" | "error";

const ICONS: Record<AlertType, ReactNode> = {
  success: <CheckCircleFilled />,
  info: <InfoCircleFilled />,
  warning: <ExclamationCircleFilled />,
  error: <CloseCircleFilled />,
};

export interface AlertProps {
  /** 语义类型,默认 info */
  type?: AlertType;
  /** 主文案 */
  message: ReactNode;
  /** 辅助描述 */
  description?: ReactNode;
  /** 显示图标,默认 true */
  showIcon?: boolean;
  /** 可关闭 */
  closable?: boolean;
  onClose?: () => void;
  /** 右侧操作区 */
  action?: ReactNode;
  className?: string;
}

/**
 * 警告提示:页面内的静态信息条(四种语义)
 */
export function Alert({
  type = "info",
  message: messageNode,
  description,
  showIcon = true,
  closable = false,
  onClose,
  action,
  className,
}: AlertProps) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      className={cx("rideos-alert", `type-${type}`, description ? "has-desc" : false, className)}
      role="alert"
    >
      {showIcon && <span className="rideos-alert-icon">{ICONS[type]}</span>}
      <div className="rideos-alert-main">
        <div className="rideos-alert-message">{messageNode}</div>
        {description && <div className="rideos-alert-desc">{description}</div>}
      </div>
      {action && <div className="rideos-alert-action">{action}</div>}
      {closable && (
        <button
          type="button"
          className="rideos-alert-close"
          aria-label="关闭"
          onClick={() => {
            setClosed(true);
            onClose?.();
          }}
        >
          <CloseOutlined />
        </button>
      )}
    </div>
  );
}
