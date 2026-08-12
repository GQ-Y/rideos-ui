import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import type { FloatingPlacement } from "../../utils/floating";

export interface PopoverProps {
  /** 气泡标题 */
  title?: ReactNode;
  /** 气泡内容 */
  content: ReactNode;
  /** 触发方式,默认 hover */
  trigger?: "hover" | "click";
  /** 弹出方向,默认 top */
  placement?: Extract<FloatingPlacement, "top" | "bottom" | "left" | "right">;
  /** 受控展开 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

/**
 * 气泡卡片:承载富内容的浮层(hover / click 触发)
 */
export function Popover({
  title,
  content,
  trigger = "hover",
  placement = "top",
  open: openProp,
  onOpenChange,
  children,
  className,
}: PopoverProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const style = useFloatingPosition(triggerRef, open, { placement });

  function setOpen(next: boolean) {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  }

  useDismiss(open && trigger === "click", [triggerRef, popupRef], () => setOpen(false));

  const triggerProps =
    trigger === "hover"
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        }
      : { onClick: () => setOpen(!open) };

  return (
    <>
      <span ref={triggerRef} className={cx("rideos-popover-trigger", className)} {...triggerProps}>
        {children}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              className={cx("rideos-popover", `place-${placement}`)}
              style={style}
              onMouseEnter={trigger === "hover" ? () => setOpen(true) : undefined}
              onMouseLeave={trigger === "hover" ? () => setOpen(false) : undefined}
            >
              {title != null && <div className="rideos-popover-title">{title}</div>}
              <div className="rideos-popover-content">{content}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
