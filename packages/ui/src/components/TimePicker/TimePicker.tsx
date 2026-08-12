import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ClockCircleOutlined, CloseCircleFilled } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";

const pad = (n: number) => String(n).padStart(2, "0");

function parseTime(value: string | undefined, showSeconds: boolean): [number, number, number] {
  if (!value) return [0, 0, 0];
  const [h = 0, m = 0, s = 0] = value.split(":").map((part) => Number(part) || 0);
  return [Math.min(23, h), Math.min(59, m), showSeconds ? Math.min(59, s) : 0];
}

function formatTime(h: number, m: number, s: number, showSeconds: boolean) {
  return showSeconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
}

export interface TimePickerProps {
  /** 受控值 "HH:mm:ss" / "HH:mm" */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  /** 显示秒列,默认 true */
  showSeconds?: boolean;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

interface ColumnProps {
  count: number;
  selected: number;
  onPick: (value: number) => void;
  label: string;
}

function TimeColumn({ count, selected, onPick, label }: ColumnProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = Math.max(0, selected * 28 - 84);
  }, [selected]);

  return (
    <div className="rideos-timepicker-col" ref={ref} role="listbox" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button
          type="button"
          key={i}
          role="option"
          aria-selected={i === selected}
          className={cx("rideos-timepicker-cell", i === selected && "is-selected")}
          onClick={() => onPick(i)}
        >
          {pad(i)}
        </button>
      ))}
    </div>
  );
}

/**
 * 时间选择器:时/分/秒三列滚动面板(自定义弹层,非原生控件)
 */
export function TimePicker({
  value: valueProp,
  defaultValue,
  onChange,
  showSeconds = true,
  placeholder = "请选择时间",
  disabled = false,
  allowClear = false,
  className,
  style,
  "aria-label": ariaLabel,
}: TimePickerProps) {
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue ?? null);
  const value = valueProp !== undefined ? valueProp : (innerValue ?? undefined);
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [hour, minute, second] = parseTime(value, showSeconds);

  function commit(h: number, m: number, s: number) {
    const next = formatTime(h, m, s, showSeconds);
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function computePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const height = 232;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < height + 16 && rect.top > spaceBelow;
    setPopupStyle({
      left: rect.left,
      minWidth: rect.width,
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  }

  function show() {
    if (disabled) return;
    computePosition();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onReposition() {
      computePosition();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  function pickNow() {
    const now = new Date();
    commit(now.getHours(), now.getMinutes(), showSeconds ? now.getSeconds() : 0);
    setOpen(false);
  }

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          "rideos-select",
          "rideos-timepicker",
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
              if (valueProp === undefined) setInnerValue(null);
              onChange?.(null);
            }}
          >
            <CloseCircleFilled />
          </button>
        ) : null}
        <ClockCircleOutlined className="rideos-select-arrow" aria-hidden="true" />
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-timepicker-popup" style={popupStyle}>
              <div className="rideos-timepicker-cols">
                <TimeColumn
                  count={24}
                  selected={hour}
                  label="时"
                  onPick={(h) => commit(h, minute, second)}
                />
                <TimeColumn
                  count={60}
                  selected={minute}
                  label="分"
                  onPick={(m) => commit(hour, m, second)}
                />
                {showSeconds && (
                  <TimeColumn
                    count={60}
                    selected={second}
                    label="秒"
                    onPick={(s) => commit(hour, minute, s)}
                  />
                )}
              </div>
              <div className="rideos-timepicker-foot">
                <button type="button" className="rideos-timepicker-now" onClick={pickNow}>
                  此刻
                </button>
                <Button variant="primary" onClick={() => setOpen(false)}>
                  确定
                </Button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
