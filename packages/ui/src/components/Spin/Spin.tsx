import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface SpinProps {
  /** 是否加载中,默认 true */
  spinning?: boolean;
  /** 尺寸,默认 default */
  size?: "small" | "default" | "large";
  /** 加载文案 */
  tip?: ReactNode;
  /** 包裹内容:加载时覆盖半透明遮罩 */
  children?: ReactNode;
  className?: string;
}

function Indicator({ size, tip }: { size: string; tip?: ReactNode }) {
  return (
    <span className={cx("rideos-spin", `size-${size}`)} role="status" aria-label="加载中">
      <svg className="rideos-spin-icon" viewBox="0 0 50 50" aria-hidden="true">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
      </svg>
      {tip && <span className="rideos-spin-tip">{tip}</span>}
    </span>
  );
}

/**
 * 加载中:独立指示器,或包裹内容显示遮罩
 */
export function Spin({
  spinning = true,
  size = "default",
  tip,
  children,
  className,
}: SpinProps) {
  if (children == null) {
    return spinning ? <Indicator size={size} tip={tip} /> : null;
  }
  return (
    <div className={cx("rideos-spin-wrap", className)}>
      {children}
      {spinning && (
        <div className="rideos-spin-mask">
          <Indicator size={size} tip={tip} />
        </div>
      )}
    </div>
  );
}
