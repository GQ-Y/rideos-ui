import PropTypes from "prop-types";

export function FilterBar({
  keyword,
  onKeywordChange,
  placeholder = "请输入关键字",
  children,
  actions,
}) {
  return (
    <div className="rideos-filter-bar">
      <div className="rideos-filter-fields">
        <label className="rideos-filter-input">
          <span>关键字</span>
          <input
            value={keyword}
            onChange={(event) => onKeywordChange?.(event.target.value)}
            placeholder={placeholder}
          />
        </label>
        {children}
      </div>
      <div className="rideos-filter-actions">{actions}</div>
    </div>
  );
}

FilterBar.propTypes = {
  keyword: PropTypes.string,
  onKeywordChange: PropTypes.func,
  placeholder: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
};
