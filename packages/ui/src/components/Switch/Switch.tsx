import { useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface SwitchProps {
  /** 受控选中态 */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** 加载中(禁止切换并显示转圈) */
  loading?: boolean;
  /** 开/关内嵌文案 */
  checkedText?: ReactNode;
  uncheckedText?: ReactNode;
  /** 小尺寸 */
  size?: "default" | "small";
  className?: string;
  "aria-label"?: string;
}

/**
 * 开关:即时生效的双态切换
 */
export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onChange,
  disabled = false,
  loading = false,
  checkedText,
  uncheckedText,
  size = "default",
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const checked = checkedProp ?? innerChecked;
  const blocked = disabled || loading;

  function toggle() {
    if (blocked) return;
    if (checkedProp === undefined) setInnerChecked(!checked);
    onChange?.(!checked);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cx(
        "rideos-switch",
        `size-${size}`,
        checked && "is-checked",
        blocked && "is-blocked",
        className,
      )}
      onClick={toggle}
    >
      <span className="rideos-switch-handle">
        {loading && <span className="rideos-switch-loading" aria-hidden="true" />}
      </span>
      <span className="rideos-switch-text">{checked ? checkedText : uncheckedText}</span>
    </button>
  );
}
