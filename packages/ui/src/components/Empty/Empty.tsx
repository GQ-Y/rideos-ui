import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface EmptyProps {
  /** 描述文案,默认「暂无数据」 */
  description?: ReactNode;
  /** 自定义缺省图 */
  image?: ReactNode;
  /** 引导操作(按钮等) */
  children?: ReactNode;
  className?: string;
}

function DefaultImage() {
  return (
    <svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true">
      <ellipse cx="32" cy="34" rx="26" ry="5" className="rideos-empty-shadow" />
      <path
        className="rideos-empty-box"
        d="M12 12h40l6 12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V24l6-12Z"
      />
      <path
        className="rideos-empty-fold"
        d="M6 24h16c0 3 4 6 10 6s10-3 10-6h16"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * 空状态:缺省图 + 描述 + 引导操作
 */
export function Empty({ description = "暂无数据", image, children, className }: EmptyProps) {
  return (
    <div className={cx("rideos-empty", className)}>
      <div className="rideos-empty-image">{image ?? <DefaultImage />}</div>
      <p className="rideos-empty-desc">{description}</p>
      {children && <div className="rideos-empty-extra">{children}</div>}
    </div>
  );
}
