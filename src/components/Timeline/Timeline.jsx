import PropTypes from "prop-types";

export function Timeline({ items }) {
  return (
    <ol className="rideos-timeline">
      {items.map((item) => (
        <li key={item.key || `${item.time}-${item.title}`}>
          <div className="rideos-timeline-dot" />
          <div>
            <strong>{item.title}</strong>
            <small>{item.time}</small>
            {item.desc && <p>{item.desc}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

Timeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.node.isRequired,
    time: PropTypes.node,
    desc: PropTypes.node,
  })).isRequired,
};
