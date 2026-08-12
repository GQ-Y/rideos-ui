import { useState } from "react";
import type { ReactNode } from "react";
import { DownOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { DateRangePicker } from "../DatePicker";
import { Input } from "../Input";
import { InputNumber } from "../InputNumber";
import { Select } from "../Select";

/** 下拉选项(对象形式;也支持直接用字符串/数字) */
export interface FilterFieldOption {
  value: string | number;
  label: ReactNode;
}

/** 筛选字段控件类型 */
export type FilterFieldType = "text" | "select" | "dateRange" | "number";

/** 筛选字段定义 */
export interface FilterField {
  key: string;
  label: ReactNode;
  /** 控件类型,默认 text */
  type?: FilterFieldType;
  placeholder?: string;
  /** select 选项 */
  options?: Array<FilterFieldOption | string | number>;
  /** 放入"更多筛选"折叠区 */
  more?: boolean;
}

/** 筛选字段当前值:文本/数字/日期区间 [from, to] */
export type FilterFieldValue = string | number | string[] | null | undefined;

interface FieldControlProps {
  field: FilterField;
  value: FilterFieldValue;
  onChange: (next: string | string[]) => void;
}

function FieldControl({ field, value, onChange }: FieldControlProps) {
  if (field.type === "select") {
    const current =
      (typeof value === "string" && value !== "") || typeof value === "number" ? value : null;
    return (
      <Select
        value={current}
        options={field.options || []}
        placeholder={field.placeholder || "全部"}
        allowClear
        onChange={(next) => onChange(next == null ? "" : String(next))}
      />
    );
  }
  if (field.type === "dateRange") {
    const range =
      Array.isArray(value) && value[0] && value[1]
        ? ([value[0], value[1]] as [string, string])
        : null;
    return (
      <DateRangePicker
        value={range}
        allowClear
        onChange={(next) => onChange(next ? [next[0], next[1]] : [])}
      />
    );
  }
  if (field.type === "number") {
    const current =
      typeof value === "number" ? value : typeof value === "string" && value !== "" ? Number(value) : null;
    return (
      <InputNumber
        value={Number.isNaN(current) ? null : current}
        placeholder={field.placeholder}
        onChange={(next) => onChange(next == null ? "" : String(next))}
      />
    );
  }
  return (
    <Input
      value={typeof value === "string" ? value : value == null ? "" : String(value)}
      placeholder={field.placeholder}
      allowClear
      onChange={(next) => onChange(next)}
    />
  );
}

export interface FilterBarProps {
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  placeholder?: string;
  fields?: FilterField[];
  /** 各字段当前值,key 对应 FilterField.key */
  values?: Record<string, FilterFieldValue>;
  onFieldChange?: (key: string, value: string | string[]) => void;
  children?: ReactNode;
  actions?: ReactNode;
  onSubmit?: () => void;
  onReset?: () => void;
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
}: FilterBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = fields.filter((field) => !field.more);
  const more = fields.filter((field) => field.more);

  return (
    <div className="rideos-filter-bar">
      <div className="rideos-filter-fields">
        {(keyword !== undefined || onKeywordChange) && (
          <label className="rideos-filter-input">
            <span>关键字</span>
            <Input
              value={keyword ?? ""}
              onChange={(next) => onKeywordChange?.(next)}
              placeholder={placeholder}
              allowClear
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
          <button
            type="button"
            className="rideos-filter-more-btn"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
          >
            {moreOpen ? "收起筛选" : "更多筛选"}
            <DownOutlined className={cx("rideos-filter-more-caret", moreOpen && "open")} aria-hidden="true" />
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
