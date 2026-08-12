import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import type { FloatingPlacement } from "../../utils/floating";
import { Button } from "../Button";

export interface PopconfirmProps {
  /** 确认文案 */
  title: ReactNode;
  /** 补充说明 */
  description?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  /** 确认按钮红色危险态 */
  danger?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  placement?: Extract<FloatingPlacement, "top" | "bottom" | "left" | "right">;
  children: ReactNode;
  className?: string;
}

/**
 * 气泡确认框:轻量二次确认(替代小型 Modal)
 */
export function Popconfirm({
  title,
  description,
  okText = "确定",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
  placement = "top",
  children,
  className,
}: PopconfirmProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const style = useFloatingPosition(triggerRef, open, { placement });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  return (
    <>
      <span
        ref={triggerRef}
        className={cx("rideos-popover-trigger", className)}
        onClick={() => setOpen(!open)}
      >
        {children}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              className={cx("rideos-popover", "rideos-popconfirm", `place-${placement}`)}
              role="dialog"
              style={style}
            >
              <div className="rideos-popconfirm-body">
                <ExclamationCircleFilled
                  className={cx("rideos-popconfirm-icon", danger && "is-danger")}
                  aria-hidden="true"
                />
                <div>
                  <div className="rideos-popconfirm-title">{title}</div>
                  {description && <div className="rideos-popconfirm-desc">{description}</div>}
                </div>
              </div>
              <div className="rideos-popconfirm-actions">
                <Button
                  onClick={() => {
                    setOpen(false);
                    onCancel?.();
                  }}
                >
                  {cancelText}
                </Button>
                <Button
                  variant="primary"
                  className={danger ? "rideos-btn-danger" : undefined}
                  onClick={() => {
                    setOpen(false);
                    onConfirm?.();
                  }}
                >
                  {okText}
                </Button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
