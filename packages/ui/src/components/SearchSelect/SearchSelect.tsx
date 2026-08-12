import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { SearchOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { Input } from "../Input";
import { Spin } from "../Spin";

export interface SearchSelectOption {
  value: string | number;
  label: ReactNode;
  /** 次要说明 */
  desc?: ReactNode;
  disabled?: boolean;
}

export interface SearchSelectProps {
  /** 关键字变化(已防抖),由业务侧请求远程并更新 options */
  onSearch: (keyword: string) => void;
  /** 远程返回的候选项 */
  options: SearchSelectOption[];
  /** 请求中(显示加载态) */
  loading?: boolean;
  /** 受控选中值 */
  value?: string | number | null;
  onChange?: (value: string | number | null, option: SearchSelectOption | null) => void;
  /** 防抖毫秒,默认 300 */
  debounce?: number;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * 远程搜索选择(Pro):输入防抖触发 onSearch,业务侧回填 options
 */
export function SearchSelect({
  onSearch,
  options,
  loading = false,
  value = null,
  onChange,
  debounce = 300,
  placeholder = "输入关键字搜索",
  disabled = false,
  emptyText = "无匹配结果",
  className,
  style,
  "aria-label": ariaLabel,
}: SearchSelectProps) {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, {
    placement: "bottom-start",
    offset: 4,
    matchWidth: true,
  });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const selected = options.find((option) => option.value === value) ?? null;

  function handleInput(next: string) {
    setKeyword(next);
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearched(true);
      onSearch(next.trim());
    }, debounce);
  }

  function commit(option: SearchSelectOption) {
    if (option.disabled) return;
    onChange?.(option.value, option);
    setKeyword("");
    setOpen(false);
  }

  return (
    <>
      <span ref={triggerRef} className={cx("rideos-searchselect", className)} style={style}>
        <Input
          prefix={<SearchOutlined />}
          value={open ? keyword : selected ? "" : keyword}
          placeholder={selected && !open ? undefined : placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          allowClear
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          suffix={
            selected && !open ? <span className="rideos-searchselect-value">{selected.label}</span> : undefined
          }
        />
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-select-popup" role="listbox" style={popupStyle}>
              {loading ? (
                <div className="rideos-searchselect-loading">
                  <Spin size="small" tip="搜索中..." />
                </div>
              ) : options.length === 0 ? (
                <div className="rideos-select-empty">{searched ? emptyText : "输入关键字开始搜索"}</div>
              ) : (
                options.map((option) => (
                  <div
                    key={String(option.value)}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled}
                    className={cx(
                      "rideos-select-option",
                      option.value === value && "is-selected",
                      option.disabled && "is-disabled",
                    )}
                    onClick={() => commit(option)}
                  >
                    <span className="rideos-searchselect-option">
                      <span>{option.label}</span>
                      {option.desc && <small>{option.desc}</small>}
                    </span>
                  </div>
                ))
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
