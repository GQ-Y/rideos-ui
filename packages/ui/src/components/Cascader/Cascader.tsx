import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseCircleFilled, DownOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";

export type CascaderValue = string | number;

export interface CascaderOption {
  label: ReactNode;
  value: CascaderValue;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderProps {
  options: CascaderOption[];
  /** 受控值:选中路径 */
  value?: CascaderValue[] | null;
  defaultValue?: CascaderValue[] | null;
  onChange?: (path: CascaderValue[] | null, options: CascaderOption[]) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  /** 展示分隔符,默认 " / " */
  separator?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/** 按路径找出选项链 */
function resolvePath(options: CascaderOption[], path: CascaderValue[]): CascaderOption[] {
  const chain: CascaderOption[] = [];
  let level = options;
  for (const value of path) {
    const found = level.find((option) => option.value === value);
    if (!found) break;
    chain.push(found);
    level = found.children ?? [];
  }
  return chain;
}

/**
 * 级联选择:多列联动面板,点选叶子提交完整路径
 */
export function Cascader({
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "请选择",
  disabled = false,
  allowClear = false,
  separator = " / ",
  className,
  style,
  "aria-label": ariaLabel,
}: CascaderProps) {
  const [innerValue, setInnerValue] = useState<CascaderValue[] | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const [open, setOpen] = useState(false);
  /** 面板中的展开路径(未提交) */
  const [activePath, setActivePath] = useState<CascaderValue[]>([]);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, { placement: "bottom-start", offset: 4 });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  const selectedChain = value ? resolvePath(options, value) : [];
  const displayLabel =
    selectedChain.length > 0 ? (
      selectedChain.map((option, index) => (
        <span key={String(option.value)}>
          {index > 0 && separator}
          {option.label}
        </span>
      ))
    ) : (
      placeholder
    );

  /** 列数据:第一列 + 每级展开的 children */
  const columns: CascaderOption[][] = [options];
  {
    let level = options;
    for (const val of activePath) {
      const found = level.find((option) => option.value === val);
      if (!found?.children?.length) break;
      columns.push(found.children);
      level = found.children;
    }
  }

  function commit(path: CascaderValue[] | null) {
    if (valueProp === undefined) setInnerValue(path);
    onChange?.(path, path ? resolvePath(options, path) : []);
  }

  function handlePick(option: CascaderOption, columnIndex: number) {
    if (option.disabled) return;
    const nextPath = [...activePath.slice(0, columnIndex), option.value];
    if (option.children && option.children.length > 0) {
      setActivePath(nextPath);
      return;
    }
    commit(nextPath);
    setOpen(false);
  }

  function show() {
    if (disabled) return;
    setActivePath(value ? value.slice(0, -1) : []);
    setOpen(true);
  }

  return (
    <>
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          "rideos-select",
          "rideos-cascader",
          open && "is-open",
          disabled && "is-disabled",
          !value && "is-placeholder",
          className,
        )}
        style={style}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) show();
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span className="rideos-select-value">{displayLabel}</span>
        {allowClear && value && !disabled ? (
          <button
            type="button"
            className="rideos-select-clear"
            aria-label="清空"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              commit(null);
            }}
          >
            <CloseCircleFilled />
          </button>
        ) : null}
        <DownOutlined className="rideos-select-arrow" aria-hidden="true" />
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-cascader-popup" style={popupStyle}>
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="rideos-cascader-column" role="listbox">
                  {column.map((option) => {
                    const isActive = activePath[columnIndex] === option.value;
                    const isSelected = value?.[columnIndex] === option.value;
                    const hasChildren = Boolean(option.children && option.children.length > 0);
                    return (
                      <div
                        key={String(option.value)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        className={cx(
                          "rideos-cascader-option",
                          (isActive || isSelected) && "is-active",
                          option.disabled && "is-disabled",
                        )}
                        onClick={() => handlePick(option, columnIndex)}
                      >
                        <span className="rideos-cascader-option-label">{option.label}</span>
                        {hasChildren && <RightOutlined aria-hidden="true" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
