import PropTypes from "prop-types";

export function PageHeader({ breadcrumb = [], title, description, actions }) {
  return (
    <header className="rideos-page-heading">
      <div>
        {breadcrumb.length > 0 && (
          <div className="rideos-breadcrumb">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 && " / "}
                {item}
              </span>
            ))}
          </div>
        )}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}

PageHeader.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.node),
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  actions: PropTypes.node,
};
