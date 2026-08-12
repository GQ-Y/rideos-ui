import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseCircleFilled, DownOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export type SelectValue = string | number;

export interface SelectOption {
  label: ReactNode;
  value: SelectValue;
  disabled?: boolean;
}

export interface SelectProps {
  /** 选项;支持对象或直接字符串/数字 */
  options?: Array<SelectOption | string | number>;
  /** 受控值 */
  value?: SelectValue | null;
  /** 非受控默认值 */
  defaultValue?: SelectValue | null;
  /** 选中变化;清空时为 null */
  onChange?: (value: SelectValue | null, option: SelectOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 显示清空按钮 */
  allowClear?: boolean;
  /** 下拉面板最大高度,默认 240 */
  popupMaxHeight?: number;
  /** 无选项时的占位文案 */
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

function normalize(options: Array<SelectOption | string | number>): SelectOption[] {
  return options.map((option) =>
    typeof option === "object" ? option : { label: String(option), value: option },
  );
}

/**
 * 选择器:自定义下拉面板替代原生 select
 * 面板 portal 到 body 并以 fixed 定位跟随触发器(不被滚动容器裁剪),
 * 支持键盘导航(上下/回车/Esc)、禁用选项、清空;搜索与多选在后续版本提供。
 */
export function Select({
  options = [],
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "请选择",
  disabled = false,
  allowClear = false,
  popupMaxHeight = 240,
  emptyText = "暂无选项",
  className,
  style,
  "aria-label": ariaLabel,
}: SelectProps) {
  const items = normalize(options);
  const [innerValue, setInnerValue] = useState<SelectValue | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const selected = items.find((item) => item.value === value) ?? null;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  function computePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < popupMaxHeight + 16 && rect.top > spaceBelow;
    setPopupStyle({
      left: rect.left,
      width: rect.width,
      maxHeight: popupMaxHeight,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }

  function show() {
    if (disabled) return;
    computePosition();
    setActiveIndex(items.findIndex((item) => item.value === value));
    setOpen(true);
  }

  function hide() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function commit(option: SelectOption | null) {
    const next = option ? option.value : null;
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next, option);
    hide();
    triggerRef.current?.focus();
  }

  /* 打开期间:外点关闭、滚动/缩放跟随重新定位 */
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      hide();
    }
    function onReposition() {
      computePosition();
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function moveActive(step: 1 | -1) {
    if (items.length === 0) return;
    let next = activeIndex;
    for (let i = 0; i < items.length; i += 1) {
      next = (next + step + items.length) % items.length;
      if (!items[next].disabled) break;
    }
    setActiveIndex(next);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) show();
        else if (activeIndex >= 0 && !items[activeIndex]?.disabled) commit(items[activeIndex]);
        break;
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!open) show();
        else moveActive(event.key === "ArrowDown" ? 1 : -1);
        break;
      case "Escape":
        if (open) {
          event.stopPropagation();
          hide();
        }
        break;
      case "Tab":
        hide();
        break;
      default:
    }
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
          open && "is-open",
          disabled && "is-disabled",
          !selected && "is-placeholder",
          className,
        )}
        style={style}
        onClick={() => (open ? hide() : show())}
        onKeyDown={handleKeyDown}
      >
        <span className="rideos-select-value">{selected ? selected.label : placeholder}</span>
        {allowClear && selected && !disabled ? (
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
            <div ref={popupRef} className="rideos-select-popup" role="listbox" style={popupStyle}>
              {items.length === 0 ? (
                <div className="rideos-select-empty">{emptyText}</div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={String(item.value)}
                    role="option"
                    aria-selected={item.value === value}
                    aria-disabled={item.disabled}
                    className={cx(
                      "rideos-select-option",
                      item.value === value && "is-selected",
                      index === activeIndex && "is-active",
                      item.disabled && "is-disabled",
                    )}
                    onMouseEnter={() => !item.disabled && setActiveIndex(index)}
                    onClick={() => !item.disabled && commit(item)}
                  >
                    {item.label}
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
