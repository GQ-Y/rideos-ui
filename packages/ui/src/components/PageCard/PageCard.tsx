import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface PageCardProps {
  children?: ReactNode;
  className?: string;
}

/** 内容区白色卡片容器 */
export function PageCard({ children, className }: PageCardProps) {
  return (
    <div className={cx("rideos-page-card", className)}>
      {children}
    </div>
  );
}
