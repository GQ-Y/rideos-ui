import PropTypes from "prop-types";
import { cx } from "../../utils/cx";

export function StatStrip({ items, activeKey, onSelect }) {
  return (
    <div className="rideos-stat-strip" role="list">
      {items.map((item) => {
        const clickable = Boolean(onSelect && (item.filter || item.key));
        return (
          <button
            type="button"
            key={item.key}
            role="listitem"
            className={cx(
              "rideos-stat-card",
              clickable && "clickable",
              activeKey === item.key && "active",
            )}
            disabled={!clickable}
            onClick={() => clickable && onSelect?.(item)}
          >
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            {item.hint && <span>{item.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

StatStrip.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    hint: PropTypes.node,
    filter: PropTypes.object,
  })).isRequired,
  activeKey: PropTypes.string,
  onSelect: PropTypes.func,
};
