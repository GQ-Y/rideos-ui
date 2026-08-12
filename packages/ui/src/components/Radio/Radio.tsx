import { useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export type RadioValue = string | number;

export interface RadioOption {
  label: ReactNode;
  value: RadioValue;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** 选项:对象或字符串/数字 */
  options: Array<RadioOption | string | number>;
  /** 受控值 */
  value?: RadioValue | null;
  defaultValue?: RadioValue | null;
  onChange?: (value: RadioValue) => void;
  disabled?: boolean;
  /** 按钮样式(分段外观) */
  optionType?: "default" | "button";
  /** 排列方向,默认水平 */
  direction?: "horizontal" | "vertical";
  className?: string;
}

function normalize(options: Array<RadioOption | string | number>): RadioOption[] {
  return options.map((option) =>
    typeof option === "object" ? option : { label: String(option), value: option },
  );
}

/**
 * 单选框组:圆点样式 / 按钮样式
 */
export function RadioGroup({
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  disabled = false,
  optionType = "default",
  direction = "horizontal",
  className,
}: RadioGroupProps) {
  const [innerValue, setInnerValue] = useState<RadioValue | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const items = normalize(options);

  function select(option: RadioOption) {
    if (disabled || option.disabled) return;
    if (valueProp === undefined) setInnerValue(option.value);
    onChange?.(option.value);
  }

  return (
    <div
      className={cx(
        "rideos-radio-group",
        `type-${optionType}`,
        `direction-${direction}`,
        className,
      )}
      role="radiogroup"
    >
      {items.map((option) => {
        const checked = option.value === value;
        const itemDisabled = disabled || option.disabled;
        return (
          <label
            key={String(option.value)}
            className={cx(
              "rideos-radio",
              optionType === "button" && "is-button",
              checked && "is-checked",
              itemDisabled && "is-disabled",
            )}
          >
            <input
              type="radio"
              className="rideos-radio-input"
              checked={checked}
              disabled={itemDisabled}
              onChange={() => select(option)}
            />
            {optionType === "default" && <span className="rideos-radio-dot" aria-hidden="true" />}
            <span className="rideos-radio-label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
