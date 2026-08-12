import { useRef, useState } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";

export interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  disabled?: boolean;
  /** 红色危险项 */
  danger?: boolean;
  /** 该项上方渲染分隔线 */
  divider?: boolean;
}

export interface DropdownProps {
  items: DropdownItem[];
  onSelect?: (key: string, item: DropdownItem) => void;
  /** 对齐方向,默认 bottom-start(左对齐) */
  align?: "start" | "end";
  /** 触发方式,默认 click */
  trigger?: "click" | "hover";
  children: ReactNode;
  className?: string;
}

/**
 * 下拉菜单:任意触发器 + 菜单项(支持图标/危险项/分隔线)
 */
export function Dropdown({
  items,
  onSelect,
  align = "start",
  trigger = "click",
  children,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const style = useFloatingPosition(triggerRef, open, {
    placement: align === "end" ? "bottom-end" : "bottom-start",
    offset: 4,
  });

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
      <span ref={triggerRef} className={cx("rideos-dropdown-trigger", className)} {...triggerProps}>
        {children}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              className="rideos-dropdown-menu"
              role="menu"
              style={style}
              onMouseEnter={trigger === "hover" ? () => setOpen(true) : undefined}
              onMouseLeave={trigger === "hover" ? () => setOpen(false) : undefined}
            >
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.key} style={{ display: "contents" }}>
                    {item.divider && <i className="rideos-dropdown-divider" aria-hidden="true" />}
                    <button
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      className={cx("rideos-dropdown-item", item.danger && "is-danger")}
                      onClick={() => {
                        setOpen(false);
                        onSelect?.(item.key, item);
                      }}
                    >
                      {Icon && <Icon />}
                      <span>{item.label}</span>
                    </button>
                  </span>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
