import type { ReactNode } from "react";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type ProgressStatus = "normal" | "success" | "exception";

export interface ProgressProps {
  /** 进度 0-100 */
  percent: number;
  /** 线形 / 环形,默认线形 */
  type?: "line" | "circle";
  /** 状态色,默认 normal(品牌色);100 自动视为 success */
  status?: ProgressStatus;
  /** 显示数值/状态图标,默认 true */
  showInfo?: boolean;
  /** 线宽(px):线形默认 8,环形默认 6 */
  strokeWidth?: number;
  /** 环形直径,默认 120 */
  size?: number;
  /** 自定义信息文案 */
  format?: (percent: number) => ReactNode;
  className?: string;
}

/**
 * 进度条:线形 / 环形,支持成功与异常状态
 */
export function Progress({
  percent,
  type = "line",
  status,
  showInfo = true,
  strokeWidth,
  size = 120,
  format,
  className,
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const resolved: ProgressStatus = status ?? (clamped >= 100 ? "success" : "normal");
  const info = format ? (
    format(clamped)
  ) : resolved === "success" ? (
    <CheckCircleFilled />
  ) : resolved === "exception" ? (
    <CloseCircleFilled />
  ) : (
    `${clamped}%`
  );

  if (type === "circle") {
    const width = strokeWidth ?? 6;
    const radius = (size - width) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
      <div
        className={cx("rideos-progress-circle", `status-${resolved}`, className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={clamped}
      >
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            className="rideos-progress-circle-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={width}
            fill="none"
          />
          <circle
            className="rideos-progress-circle-bar"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={width}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {showInfo && <span className="rideos-progress-circle-info">{info}</span>}
      </div>
    );
  }

  return (
    <div
      className={cx("rideos-progress", `status-${resolved}`, className)}
      role="progressbar"
      aria-valuenow={clamped}
    >
      <div className="rideos-progress-track" style={{ height: strokeWidth ?? 8 }}>
        <div className="rideos-progress-bar" style={{ width: `${clamped}%` }} />
      </div>
      {showInfo && <span className="rideos-progress-info">{info}</span>}
    </div>
  );
}
