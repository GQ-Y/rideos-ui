import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "../Button";

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  danger?: boolean;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 440,
  danger,
}: ModalProps) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="rideos-modal-root" role="presentation">
      <button type="button" className="rideos-modal-mask" aria-label="关闭" onClick={onClose} />
      <div className="rideos-modal" style={{ width }} role="dialog" aria-modal="true">
        <header className="rideos-modal-head">
          <h3>{title}</h3>
          <button type="button" className="rideos-drawer-close" onClick={onClose} aria-label="关闭弹窗">
            <CloseOutlined />
          </button>
        </header>
        <div className="rideos-modal-body">{children}</div>
        <footer className="rideos-modal-foot">
          {footer ?? (
            <>
              <Button onClick={onClose}>取消</Button>
              <Button variant="primary" className={danger ? "rideos-btn-danger" : undefined} onClick={onClose}>
                确定
              </Button>
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
