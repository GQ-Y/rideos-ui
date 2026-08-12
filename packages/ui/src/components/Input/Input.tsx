import { useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size" | "prefix"
  > {
  /** 受控值 */
  value?: string;
  /** 非受控默认值 */
  defaultValue?: string;
  /** 值变化(值在前,事件在后) */
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  /** 显示清空按钮 */
  allowClear?: boolean;
  /** 前缀(图标/文案) */
  prefix?: ReactNode;
  /** 后缀(图标/文案) */
  suffix?: ReactNode;
  /** 回车回调 */
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

/**
 * 输入框:统一样式的文本输入,支持前后缀、清空按钮
 */
export function Input({
  value: valueProp,
  defaultValue = "",
  onChange,
  allowClear = false,
  prefix,
  suffix,
  onPressEnter,
  disabled,
  className,
  onKeyDown,
  ...rest
}: InputProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = valueProp ?? innerValue;

  function update(next: string, event?: ChangeEvent<HTMLInputElement>) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next, event);
  }

  return (
    <span className={cx("rideos-input", disabled && "is-disabled", className)}>
      {prefix ? <span className="rideos-input-affix">{prefix}</span> : null}
      <input
        {...rest}
        disabled={disabled}
        value={value}
        onChange={(event) => update(event.target.value, event)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onPressEnter?.(event);
          onKeyDown?.(event);
        }}
      />
      {allowClear && value && !disabled && !rest.readOnly ? (
        <button
          type="button"
          className="rideos-input-clear"
          aria-label="清空"
          tabIndex={-1}
          onClick={() => update("")}
        >
          <CloseCircleFilled />
        </button>
      ) : null}
      {suffix ? <span className="rideos-input-affix">{suffix}</span> : null}
    </span>
  );
}
