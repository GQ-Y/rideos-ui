import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { Input } from "../Input";

export interface AutoCompleteOption {
  /** 选中后写入输入框的值 */
  value: string;
  /** 展示内容,缺省用 value */
  label?: ReactNode;
}

export interface AutoCompleteProps {
  /** 候选项 */
  options: Array<AutoCompleteOption | string>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 选中候选项 */
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  /** 过滤规则,默认包含匹配(忽略大小写);传 false 不过滤(远程场景) */
  filter?: ((input: string, option: AutoCompleteOption) => boolean) | false;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

function normalize(options: Array<AutoCompleteOption | string>): AutoCompleteOption[] {
  return options.map((option) => (typeof option === "string" ? { value: option } : option));
}

const defaultFilter = (input: string, option: AutoCompleteOption) =>
  option.value.toLowerCase().includes(input.toLowerCase());

/**
 * 自动完成:输入联想候选(本地过滤或远程 options)
 */
export function AutoComplete({
  options,
  value: valueProp,
  defaultValue = "",
  onChange,
  onSelect,
  filter = defaultFilter,
  placeholder,
  disabled = false,
  allowClear = false,
  emptyText = "暂无匹配",
  className,
  style,
  "aria-label": ariaLabel,
}: AutoCompleteProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = valueProp ?? innerValue;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, {
    placement: "bottom-start",
    offset: 4,
    matchWidth: true,
  });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  const items = normalize(options).filter((option) =>
    filter === false || value === "" ? true : filter(value, option),
  );

  function update(next: string) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function commit(option: AutoCompleteOption) {
    update(option.value);
    onSelect?.(option.value, option);
    setOpen(false);
  }

  return (
    <>
      <span ref={triggerRef} className={cx("rideos-autocomplete", className)} style={style}>
        <Input
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          allowClear={allowClear}
          aria-label={ariaLabel}
          onChange={(next) => {
            update(next);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              setOpen(true);
              return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (items.length === 0) return;
              const step = event.key === "ArrowDown" ? 1 : -1;
              setActiveIndex((prev) => (prev + step + items.length) % items.length);
            } else if (event.key === "Enter" && open && activeIndex >= 0 && items[activeIndex]) {
              event.preventDefault();
              commit(items[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-select-popup" role="listbox" style={popupStyle}>
              {items.length === 0 ? (
                <div className="rideos-select-empty">{emptyText}</div>
              ) : (
                items.map((option, index) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    className={cx(
                      "rideos-select-option",
                      option.value === value && "is-selected",
                      index === activeIndex && "is-active",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(option)}
                  >
                    {option.label ?? option.value}
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
