import { useState } from "react";
import { cx } from "../../utils/cx";

export interface RateProps {
  /** 受控评分值 */
  value?: number;
  /** 非受控默认值,默认 0 */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** 星星总数,默认 5 */
  count?: number;
  /** 允许半星 */
  allowHalf?: boolean;
  disabled?: boolean;
  className?: string;
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6a1 1 0 0 1 .9.56l2.5 5.06 5.59.81a1 1 0 0 1 .55 1.71l-4.04 3.94.95 5.56a1 1 0 0 1-1.45 1.06L12 18.67l-5 2.63a1 1 0 0 1-1.45-1.06l.95-5.56-4.04-3.94a1 1 0 0 1 .55-1.7l5.59-.82 2.5-5.06a1 1 0 0 1 .9-.56Z" />
    </svg>
  );
}

/**
 * 评分:星形打分控件,悬停预览,支持半星与禁用
 */
export function Rate({
  value: valueProp,
  defaultValue = 0,
  onChange,
  count = 5,
  allowHalf = false,
  disabled = false,
  className,
}: RateProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const value = valueProp ?? innerValue;
  const displayed = hoverValue ?? value;

  function pick(next: number) {
    if (disabled) return;
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function preview(next: number) {
    if (disabled) return;
    setHoverValue(next);
  }

  return (
    <span
      className={cx("rideos-rate", disabled && "is-disabled", className)}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: count }, (_, i) => {
        const full = displayed >= i + 1;
        const half = allowHalf && !full && displayed >= i + 0.5;
        return (
          <span
            key={i}
            className={cx("rideos-rate-star", full && "is-full", half && "is-half")}
            role={allowHalf ? undefined : "radio"}
            aria-label={allowHalf ? undefined : `${i + 1} 星`}
            aria-checked={allowHalf ? undefined : value >= i + 1}
            onClick={allowHalf ? undefined : () => pick(i + 1)}
            onMouseEnter={allowHalf ? undefined : () => preview(i + 1)}
          >
            <span
              className="rideos-rate-star-first"
              role={allowHalf ? "radio" : undefined}
              aria-label={allowHalf ? `${i + 0.5} 星` : undefined}
              aria-checked={allowHalf ? value >= i + 0.5 : undefined}
              onClick={allowHalf ? () => pick(i + 0.5) : undefined}
              onMouseEnter={allowHalf ? () => preview(i + 0.5) : undefined}
            >
              <StarIcon />
            </span>
            <span
              className="rideos-rate-star-second"
              role={allowHalf ? "radio" : undefined}
              aria-label={allowHalf ? `${i + 1} 星` : undefined}
              aria-checked={allowHalf ? value >= i + 1 : undefined}
              onClick={allowHalf ? () => pick(i + 1) : undefined}
              onMouseEnter={allowHalf ? () => preview(i + 1) : undefined}
            >
              <StarIcon />
            </span>
          </span>
        );
      })}
    </span>
  );
}
