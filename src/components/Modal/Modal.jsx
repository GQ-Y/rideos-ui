import PropTypes from "prop-types";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "../Button";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 440,
  danger,
}) {
  if (!open) return null;
  return (
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
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.node,
  onClose: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  danger: PropTypes.bool,
};
