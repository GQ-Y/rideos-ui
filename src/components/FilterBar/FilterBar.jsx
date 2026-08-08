import { useState } from "react";
import PropTypes from "prop-types";

function FieldControl({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        <option value="">{field.placeholder || "全部"}</option>
        {(field.options || []).map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "dateRange") {
    const [from = "", to = ""] = Array.isArray(value) ? value : ["", ""];
    return (
      <span className="rideos-filter-range">
        <input type="date" value={from} onChange={(event) => onChange([event.target.value, to])} />
        <i>—</i>
        <input type="date" value={to} onChange={(event) => onChange([from, event.target.value])} />
      </span>
    );
  }
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value ?? ""}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/**
 * 增强筛选条：支持 fields[]（text/select/dateRange/number）+ 更多筛选
 */
export function FilterBar({
  keyword,
  onKeywordChange,
  placeholder = "请输入关键字",
  fields = [],
  values = {},
  onFieldChange,
  children,
  actions,
  onSubmit,
  onReset,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = fields.filter((field) => !field.more);
  const more = fields.filter((field) => field.more);

  return (
    <div className="rideos-filter-bar">
      <div className="rideos-filter-fields">
        {(keyword !== undefined || onKeywordChange) && (
          <label className="rideos-filter-input">
            <span>关键字</span>
            <input
              value={keyword ?? ""}
              onChange={(event) => onKeywordChange?.(event.target.value)}
              placeholder={placeholder}
            />
          </label>
        )}
        {primary.map((field) => (
          <label key={field.key} className="rideos-filter-input">
            <span>{field.label}</span>
            <FieldControl
              field={field}
              value={values[field.key]}
              onChange={(next) => onFieldChange?.(field.key, next)}
            />
          </label>
        ))}
        {children}
        {more.length > 0 && (
          <button type="button" className="rideos-filter-more-btn" onClick={() => setMoreOpen((v) => !v)}>
            {moreOpen ? "收起筛选" : "更多筛选"}
          </button>
        )}
      </div>
      {moreOpen && more.length > 0 && (
        <div className="rideos-filter-more">
          {more.map((field) => (
            <label key={field.key} className="rideos-filter-input">
              <span>{field.label}</span>
              <FieldControl
                field={field}
                value={values[field.key]}
                onChange={(next) => onFieldChange?.(field.key, next)}
              />
            </label>
          ))}
        </div>
      )}
      <div className="rideos-filter-actions">
        {onReset && <button type="button" className="rideos-btn" onClick={onReset}>重置</button>}
        {onSubmit && <button type="button" className="rideos-btn rideos-btn-primary" onClick={onSubmit}>查询</button>}
        {actions}
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  keyword: PropTypes.string,
  onKeywordChange: PropTypes.func,
  placeholder: PropTypes.string,
  fields: PropTypes.array,
  values: PropTypes.object,
  onFieldChange: PropTypes.func,
  children: PropTypes.node,
  actions: PropTypes.node,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
};
