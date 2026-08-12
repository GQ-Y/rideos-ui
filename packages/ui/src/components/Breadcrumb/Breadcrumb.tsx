import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface BreadcrumbItem {
  /** 文案 */
  label: ReactNode;
  /** 跳转地址(最后一项不生效) */
  path?: string;
  /** 点击回调(最后一项不生效) */
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** 分隔符,默认 "/" */
  separator?: ReactNode;
  className?: string;
}

/**
 * 面包屑:层级路径导航,最后一项为当前页(高亮且不可点击)
 */
export function Breadcrumb({ items, separator = "/", className }: BreadcrumbProps) {
  return (
    <nav className={cx("rideos-breadcrumb", className)} aria-label="面包屑">
      <ol className="rideos-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="rideos-breadcrumb-item">
              {isLast ? (
                <span className="rideos-breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : item.path != null || item.onClick ? (
                <a className="rideos-breadcrumb-link" href={item.path} onClick={item.onClick}>
                  {item.label}
                </a>
              ) : (
                <span className="rideos-breadcrumb-text">{item.label}</span>
              )}
              {!isLast && (
                <span className="rideos-breadcrumb-sep" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
