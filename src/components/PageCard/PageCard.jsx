import PropTypes from "prop-types";
import { cx } from "../../utils/cx";

/** 内容区白色卡片容器 */
export function PageCard({ children, className }) {
  return (
    <div className={cx("rideos-page-card", className)}>
      {children}
    </div>
  );
}

PageCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
