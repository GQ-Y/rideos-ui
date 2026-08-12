import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface SkeletonProps {
  /** 加载中显示占位;false 时渲染 children */
  loading?: boolean;
  /** 微光扫过动画,默认 true */
  active?: boolean;
  /** 头像占位 */
  avatar?: boolean;
  /** 标题占位,默认 true */
  title?: boolean;
  /** 段落行数,默认 3(末行 60% 宽) */
  rows?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * 骨架屏:头像/标题/段落占位,数据就绪后渲染 children
 */
export function Skeleton({
  loading = true,
  active = true,
  avatar = false,
  title = true,
  rows = 3,
  children,
  className,
}: SkeletonProps) {
  if (!loading) return <>{children}</>;
  return (
    <div className={cx("rideos-skeleton", active && "is-active", className)} aria-busy="true">
      {avatar && <span className="rideos-skeleton-avatar" />}
      <div className="rideos-skeleton-content">
        {title && <span className="rideos-skeleton-title" />}
        {rows > 0 && (
          <div className="rideos-skeleton-paragraph">
            {Array.from({ length: rows }, (_, i) => (
              <span
                key={i}
                className="rideos-skeleton-row"
                style={i === rows - 1 ? { width: "60%" } : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
