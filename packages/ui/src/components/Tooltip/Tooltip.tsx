import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { useFloatingPosition } from "../../utils/floating";
import type { FloatingPlacement } from "../../utils/floating";

export interface TooltipProps {
  /** 提示内容 */
  title: ReactNode;
  /** 弹出方向,默认 top */
  placement?: Extract<FloatingPlacement, "top" | "bottom" | "left" | "right">;
  children: ReactNode;
  className?: string;
}

/**
 * 文字提示:悬停显示的轻量气泡
 */
export function Tooltip({ title, placement = "top", children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const style = useFloatingPosition(triggerRef, open, { placement });

  return (
    <>
      <span
        ref={triggerRef}
        className={cx("rideos-tooltip-trigger", className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open && title != null && typeof document !== "undefined"
        ? createPortal(
            <div className={cx("rideos-tooltip", `place-${placement}`)} role="tooltip" style={style}>
              {title}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
