import PropTypes from "prop-types";

export function Descriptions({ items, column = 2 }) {
  return (
    <dl className="rideos-descriptions" style={{ "--rideos-desc-cols": column }}>
      {items.map((item) => (
        <div key={item.key || item.label} className="rideos-descriptions-item">
          <dt>{item.label}</dt>
          <dd>{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

Descriptions.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.node.isRequired,
    value: PropTypes.node,
  })).isRequired,
  column: PropTypes.number,
};
