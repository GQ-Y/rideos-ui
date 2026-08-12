import { useState } from "react";
import type { ReactNode } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface CheckboxProps {
  /** 受控选中态 */
  checked?: boolean;
  /** 非受控默认选中态 */
  defaultChecked?: boolean;
  /** 半选态(仅视觉,常用于树/全选) */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * 复选框:自绘样式(非原生外观),支持半选态;Group 在后续版本提供
 */
export function Checkbox({
  checked: checkedProp,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  children,
  className,
}: CheckboxProps) {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const checked = checkedProp ?? innerChecked;

  function toggle() {
    if (disabled) return;
    if (checkedProp === undefined) setInnerChecked(!checked);
    onChange?.(!checked);
  }

  return (
    <label className={cx("rideos-checkbox", disabled && "is-disabled", className)}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={toggle}
        className="rideos-checkbox-input"
      />
      <span
        className={cx(
          "rideos-checkbox-box",
          checked && "is-checked",
          !checked && indeterminate && "is-indeterminate",
        )}
        aria-hidden="true"
      >
        {checked && <CheckOutlined />}
      </span>
      {children != null && <span className="rideos-checkbox-label">{children}</span>}
    </label>
  );
}
