import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CalendarOutlined, CloseCircleFilled, SwapRightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { MonthPanel } from "./MonthPanel";

export type DateRange = [string, string];

export interface DateRangePickerProps {
  /** 受控值 [开始, 结束](YYYY-MM-DD) */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
  placeholder?: [string, string];
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * 日期范围选择器:同一面板依次点选开始/结束日期,悬浮预览区间
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = ["开始日期", "结束日期"],
  disabled = false,
  allowClear = false,
  className,
  style,
  "aria-label": ariaLabel,
}: DateRangePickerProps) {
  const [innerValue, setInnerValue] = useState<DateRange | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const [open, setOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [[viewYear, viewMonth], setView] = useState<[number, number]>(() => {
    const base = value?.[0] ? new Date(value[0]) : new Date();
    const valid = Number.isNaN(base.getTime()) ? new Date() : base;
    return [valid.getFullYear(), valid.getMonth()];
  });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, { placement: "bottom-start", offset: 4 });

  useDismiss(open, [triggerRef, popupRef], () => {
    setOpen(false);
    setPendingStart(null);
  });

  function commit(next: DateRange | null) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function pick(date: string) {
    if (!pendingStart) {
      setPendingStart(date);
      return;
    }
    const range: DateRange = pendingStart <= date ? [pendingStart, date] : [date, pendingStart];
    commit(range);
    setPendingStart(null);
    setOpen(false);
  }

  const rangeStart = pendingStart ?? value?.[0];
  const rangeEnd = pendingStart ? (hover ?? undefined) : value?.[1];

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
          "rideos-daterange",
          open && "is-open",
          disabled && "is-disabled",
          !value && "is-placeholder",
          className,
        )}
        style={style}
        onClick={() => {
          if (disabled) return;
          if (open) {
            setOpen(false);
            setPendingStart(null);
          } else {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setPendingStart(null);
          }
        }}
      >
        <span className="rideos-select-value rideos-daterange-value">
          <span>{value?.[0] ?? placeholder[0]}</span>
          <SwapRightOutlined aria-hidden="true" />
          <span>{value?.[1] ?? placeholder[1]}</span>
        </span>
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
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onHover={setHover}
                onPick={pick}
              />
              <div className="rideos-datepicker-foot">
                <small>{pendingStart ? "请选择结束日期" : "请选择开始日期"}</small>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
