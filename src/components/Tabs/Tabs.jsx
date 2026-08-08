import PropTypes from "prop-types";
import { cx } from "../../utils/cx";

export function Tabs({ items, activeKey, onChange }) {
  return (
    <div className="rideos-tabs" role="tablist">
      {items.map((item) => (
        <button
          type="button"
          key={item.key}
          role="tab"
          aria-selected={item.key === activeKey}
          className={cx("rideos-tab", item.key === activeKey && "active")}
          onClick={() => onChange?.(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

Tabs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
  })).isRequired,
  activeKey: PropTypes.string,
  onChange: PropTypes.func,
};
