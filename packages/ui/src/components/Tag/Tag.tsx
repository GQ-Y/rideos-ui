import { useState } from "react";
import type { ReactNode } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type TagTone = "default" | "brand" | "success" | "warning" | "danger" | "info";

export interface TagProps {
  /** 语义色调,默认 default(中性) */
  tone?: TagTone;
  /** 可关闭 */
  closable?: boolean;
  onClose?: () => void;
  /** 描边样式(空心) */
  bordered?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * 标签:轻量分类/状态标记(六种语义色,可关闭)
 */
export function Tag({
  tone = "default",
  closable = false,
  onClose,
  bordered = false,
  children,
  className,
  onClick,
}: TagProps) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <span
      className={cx(
        "rideos-tag",
        `tone-${tone}`,
        bordered && "is-bordered",
        onClick && "is-clickable",
        className,
      )}
      onClick={onClick}
    >
      {children}
      {closable && (
        <button
          type="button"
          className="rideos-tag-close"
          aria-label="关闭标签"
          onClick={(event) => {
            event.stopPropagation();
            setClosed(true);
            onClose?.();
          }}
        >
          <CloseOutlined />
        </button>
      )}
    </span>
  );
}
