import { useState } from "react";
import type { CSSProperties } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface InputNumberProps {
  /** 受控值;null 表示空 */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** 步进,默认 1 */
  step?: number;
  /** 小数位数(自动四舍五入) */
  precision?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * 数字输入框:步进按钮 + 范围/精度约束
 */
export function InputNumber({
  value: valueProp,
  defaultValue = null,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision,
  placeholder,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: InputNumberProps) {
  const [innerValue, setInnerValue] = useState<number | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  /* 输入过程中的原始文本(允许中间态如 "-" "1.") */
  const [draft, setDraft] = useState<string | null>(null);

  function clamp(next: number): number {
    let result = Math.min(max, Math.max(min, next));
    if (precision != null) result = Number(result.toFixed(precision));
    return result;
  }

  function commit(next: number | null) {
    const final = next == null ? null : clamp(next);
    if (valueProp === undefined) setInnerValue(final);
    onChange?.(final);
  }

  function stepBy(delta: number) {
    if (disabled) return;
    const base = value ?? 0;
    commit(base + delta);
  }

  const display = draft ?? (value == null ? "" : String(value));

  return (
    <span
      className={cx("rideos-input", "rideos-input-number", disabled && "is-disabled", className)}
      style={style}
    >
      <input
        value={display}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="decimal"
        aria-label={ariaLabel}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft == null) return;
          const parsed = draft.trim() === "" ? null : Number(draft);
          commit(parsed == null || Number.isNaN(parsed) ? null : parsed);
          setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            stepBy(step);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            stepBy(-step);
          } else if (event.key === "Enter") {
            (event.target as HTMLInputElement).blur();
          }
        }}
      />
      <span className="rideos-input-number-handles">
        <button
          type="button"
          tabIndex={-1}
          aria-label="增加"
          disabled={disabled || (value != null && value >= max)}
          onClick={() => stepBy(step)}
        >
          <UpOutlined />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="减少"
          disabled={disabled || (value != null && value <= min)}
          onClick={() => stepBy(-step)}
        >
          <DownOutlined />
        </button>
      </span>
    </span>
  );
}
