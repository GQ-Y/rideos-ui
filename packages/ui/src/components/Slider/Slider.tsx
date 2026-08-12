import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { cx } from "../../utils/cx";

export interface SliderProps {
  /** 受控值 */
  value?: number;
  /** 非受控默认值,默认取 min */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** 最小值,默认 0 */
  min?: number;
  /** 最大值,默认 100 */
  max?: number;
  /** 步长,默认 1 */
  step?: number;
  disabled?: boolean;
  /** 拖动时气泡显示当前数值 */
  showValue?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * 滑块:拖拽 / 点击轨道 / 左右方向键调节数值
 */
export function Slider({
  value: valueProp,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? min);
  const [dragging, setDragging] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const value = Math.min(max, Math.max(min, valueProp ?? innerValue));

  /* 拖拽期间 document 监听里的闭包取不到最新 state,用 ref 去重 */
  const latestRef = useRef(value);

  useEffect(() => {
    latestRef.current = value;
  }, [value]);

  function clampToStep(raw: number): number {
    const snapped = min + Math.round((raw - min) / step) * step;
    /* 消除浮点步进误差(如 0.1 + 0.2) */
    const fixed = Number(snapped.toFixed(10));
    return Math.min(max, Math.max(min, fixed));
  }

  function valueFromClientX(clientX: number): number {
    const rail = railRef.current;
    if (!rail) return latestRef.current;
    const rect = rail.getBoundingClientRect();
    const ratio = rect.width <= 0 ? 0 : (clientX - rect.left) / rect.width;
    return clampToStep(min + ratio * (max - min));
  }

  function commit(next: number) {
    if (next === latestRef.current) return;
    latestRef.current = next;
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function handleMouseDown(event: ReactMouseEvent) {
    if (disabled) return;
    event.preventDefault();
    commit(valueFromClientX(event.clientX));
    setDragging(true);
    const handleMove = (moveEvent: globalThis.MouseEvent) => {
      commit(valueFromClientX(moveEvent.clientX));
    };
    const handleUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }

  function handleKeyDown(event: ReactKeyboardEvent) {
    if (disabled) return;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = clampToStep(value + step);
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = clampToStep(value - step);
    if (next === null) return;
    event.preventDefault();
    commit(next);
  }

  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cx(
        "rideos-slider",
        disabled && "is-disabled",
        dragging && "is-dragging",
        className,
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="rideos-slider-rail" ref={railRef}>
        <div className="rideos-slider-track" style={{ width: `${percent}%` }} />
        <div
          className="rideos-slider-handle"
          style={{ left: `${percent}%` }}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
        >
          {showValue && dragging && (
            <span className="rideos-slider-bubble" role="status">
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
