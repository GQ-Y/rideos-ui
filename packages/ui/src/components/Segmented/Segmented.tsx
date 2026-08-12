import { useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export type SegmentedValue = string | number;

export interface SegmentedOption {
  label: ReactNode;
  value: SegmentedValue;
  disabled?: boolean;
}

export interface SegmentedProps {
  /** 选项:对象或字符串/数字简写 */
  options: Array<SegmentedOption | string | number>;
  /** 受控选中值 */
  value?: SegmentedValue;
  /** 非受控默认值,缺省取第一个可用项 */
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  /** 尺寸,默认 default */
  size?: "default" | "small";
  /** 撑满父容器宽度,各项均分 */
  block?: boolean;
  className?: string;
}

/**
 * 分段控制器:滑块式单选切换(选中项白底浮起)
 */
export function Segmented({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  size = "default",
  block = false,
  className,
}: SegmentedProps) {
  const normalized = options.map((option) =>
    typeof option === "object" ? option : { label: option, value: option },
  );
  const [innerValue, setInnerValue] = useState<SegmentedValue | undefined>(
    () => defaultValue ?? normalized.find((option) => !option.disabled)?.value,
  );
  const value = valueProp ?? innerValue;

  function select(next: SegmentedValue) {
    if (next === value) return;
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  return (
    <div
      className={cx(
        "rideos-segmented",
        size === "small" && "is-small",
        block && "is-block",
        className,
      )}
      role="radiogroup"
    >
      {normalized.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          disabled={option.disabled}
          className={cx("rideos-segmented-item", option.value === value && "is-active")}
          onClick={() => select(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
