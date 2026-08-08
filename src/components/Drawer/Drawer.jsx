import PropTypes from "prop-types";
import { CloseOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";

export function Drawer({
  open,
  title,
  width = 480,
  onClose,
  children,
  footer,
  placement = "right",
}) {
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

Drawer.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.node,
  placement: PropTypes.oneOf(["right", "left"]),
};
