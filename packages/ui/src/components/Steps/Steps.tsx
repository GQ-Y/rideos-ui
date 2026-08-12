import type { ReactNode } from "react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
}

export interface StepsProps {
  items: StepItem[];
  /** 当前步骤下标(0 起),之前为完成态 */
  current?: number;
  /** 当前步骤状态,默认 process */
  status?: "process" | "error" | "finish";
  /** 点击切换步骤(仅允许点击已完成步骤) */
  onChange?: (index: number) => void;
  className?: string;
}

/**
 * 步骤条:横向流程指示(完成/进行中/等待/出错)
 */
export function Steps({
  items,
  current = 0,
  status = "process",
  onChange,
  className,
}: StepsProps) {
  return (
    <div className={cx("rideos-steps", className)} role="list">
      {items.map((item, index) => {
        const state =
          index < current
            ? "finish"
            : index === current
              ? status === "finish"
                ? "finish"
                : status
              : "wait";
        const clickable = Boolean(onChange && index < current);
        return (
          <div
            key={index}
            role="listitem"
            className={cx("rideos-step", `is-${state}`, clickable && "is-clickable")}
            onClick={clickable ? () => onChange?.(index) : undefined}
          >
            <span className="rideos-step-dot">
              {state === "finish" ? (
                <CheckOutlined />
              ) : state === "error" ? (
                <CloseOutlined />
              ) : (
                index + 1
              )}
            </span>
            <span className="rideos-step-main">
              <strong className="rideos-step-title">{item.title}</strong>
              {item.description && <small className="rideos-step-desc">{item.description}</small>}
            </span>
            {index < items.length - 1 && <i className="rideos-step-line" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
