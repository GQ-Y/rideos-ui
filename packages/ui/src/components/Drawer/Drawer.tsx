import type { ReactNode } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";

export interface DrawerProps {
  open?: boolean;
  title?: ReactNode;
  width?: number | string;
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  placement?: "right" | "left";
}

export function Drawer({
  open,
  title,
  width = 480,
  onClose,
  children,
  footer,
  placement = "right",
}: DrawerProps) {
  if (!open) return null;
  return (
    <div className="rideos-drawer-root" role="presentation">
      <button type="button" className="rideos-drawer-mask" aria-label="关闭" onClick={onClose} />
      <aside
        className={cx("rideos-drawer", placement === "left" && "left")}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "抽屉"}
      >
        <header className="rideos-drawer-head">
          <h3>{title}</h3>
          <button type="button" className="rideos-drawer-close" onClick={onClose} aria-label="关闭抽屉">
            <CloseOutlined />
          </button>
        </header>
        <div className="rideos-drawer-body">{children}</div>
        {footer !== undefined ? (
          <footer className="rideos-drawer-foot">{footer}</footer>
        ) : (
          <footer className="rideos-drawer-foot">
            <Button onClick={onClose}>取消</Button>
          </footer>
        )}
      </aside>
    </div>
  );
}
