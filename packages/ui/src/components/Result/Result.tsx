import type { ReactNode } from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type ResultStatus = "success" | "error" | "info" | "warning" | "403" | "404" | "500";

const ICONS: Partial<Record<ResultStatus, ReactNode>> = {
  success: <CheckCircleFilled />,
  error: <CloseCircleFilled />,
  info: <InfoCircleFilled />,
  warning: <ExclamationCircleFilled />,
};

export interface ResultProps {
  /** 状态,默认 info;403/404/500 显示大号错误码 */
  status?: ResultStatus;
  title: ReactNode;
  subTitle?: ReactNode;
  /** 操作区(按钮等) */
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * 结果页:操作结果 / 异常状态反馈
 */
export function Result({
  status = "info",
  title,
  subTitle,
  extra,
  children,
  className,
}: ResultProps) {
  const icon = ICONS[status];
  return (
    <div className={cx("rideos-result", `status-${status}`, className)}>
      {icon ? (
        <span className="rideos-result-icon">{icon}</span>
      ) : (
        <span className="rideos-result-code">{status}</span>
      )}
      <h3 className="rideos-result-title">{title}</h3>
      {subTitle && <p className="rideos-result-subtitle">{subTitle}</p>}
      {extra && <div className="rideos-result-extra">{extra}</div>}
      {children && <div className="rideos-result-body">{children}</div>}
    </div>
  );
}
