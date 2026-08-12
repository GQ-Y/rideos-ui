import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CalendarOutlined, CloseCircleFilled } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { MonthPanel, todayString } from "./MonthPanel";

function viewOf(date: string | undefined): [number, number] {
  const base = date ? new Date(date) : new Date();
  const valid = Number.isNaN(base.getTime()) ? new Date() : base;
  return [valid.getFullYear(), valid.getMonth()];
}

export interface DatePickerProps {
  /** 受控值 YYYY-MM-DD */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (date: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * 日期选择器:月面板弹层选择单个日期
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "请选择日期",
  disabled = false,
  allowClear = false,
  className,
  style,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const [open, setOpen] = useState(false);
  const [[viewYear, viewMonth], setView] = useState<[number, number]>(() =>
    viewOf(value ?? undefined),
  );
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, { placement: "bottom-start", offset: 4 });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  function commit(next: string | null) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function show() {
    if (disabled) return;
    setView(viewOf(value ?? undefined));
    setOpen(true);
  }

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          "rideos-select",
          "rideos-datepicker",
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
        <span className="rideos-select-value">{value ?? placeholder}</span>
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
        <CalendarOutlined className="rideos-select-arrow" aria-hidden="true" />
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-datepicker-popup" style={popupStyle}>
              <MonthPanel
                viewYear={viewYear}
                viewMonth={viewMonth}
                onViewChange={(y, m) => setView([y, m])}
                value={value ?? undefined}
                onPick={(date) => {
                  commit(date);
                  setOpen(false);
                }}
              />
              <div className="rideos-datepicker-foot">
                <button
                  type="button"
                  onClick={() => {
                    commit(todayString());
                    setOpen(false);
                  }}
                >
                  今天
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
