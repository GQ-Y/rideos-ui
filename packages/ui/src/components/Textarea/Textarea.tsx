import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, TextareaHTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange"> {
  /** 受控值 */
  value?: string;
  /** 非受控默认值 */
  defaultValue?: string;
  /** 值变化(值在前,事件在后) */
  onChange?: (value: string, event?: ChangeEvent<HTMLTextAreaElement>) => void;
  /** 随内容自动增高(上限 6 行左右) */
  autoSize?: boolean;
  className?: string;
}

/**
 * 文本域:统一样式的多行输入,可选自动增高
 */
export function Textarea({
  value: valueProp,
  defaultValue = "",
  onChange,
  autoSize = false,
  rows = 3,
  disabled,
  className,
  ...rest
}: TextareaProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const value = valueProp ?? innerValue;

  useEffect(() => {
    const el = ref.current;
    if (!autoSize || !el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, [autoSize, value]);

  return (
    <textarea
      {...rest}
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={cx("rideos-textarea", disabled && "is-disabled", className)}
      value={value}
      onChange={(event) => {
        if (valueProp === undefined) setInnerValue(event.target.value);
        onChange?.(event.target.value, event);
      }}
    />
  );
}
