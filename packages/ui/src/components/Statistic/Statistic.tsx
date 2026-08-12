import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface StatisticProps {
  /** 标题 */
  title?: ReactNode;
  /** 数值:数字自动千分位,字符串原样展示 */
  value: number | string;
  /** 小数位数(仅数字生效,四舍五入) */
  precision?: number;
  /** 前缀(货币符号/图标等) */
  prefix?: ReactNode;
  /** 后缀(单位等) */
  suffix?: ReactNode;
  /** 数值区自定义样式 */
  valueStyle?: CSSProperties;
  /** 千分位分隔符,默认 ",";传空字符串关闭分组 */
  groupSeparator?: string;
  className?: string;
}

function formatNumber(value: number, precision: number | undefined, separator: string): string {
  const fixed = precision !== undefined ? value.toFixed(precision) : String(value);
  const [integer, fraction] = fixed.split(".");
  const negative = integer.startsWith("-");
  const digits = negative ? integer.slice(1) : integer;
  const grouped = separator ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : digits;
  return (negative ? "-" : "") + grouped + (fraction ? `.${fraction}` : "");
}

/**
 * 统计数值:大号数字展示,支持标题、精度、千分位与前后缀
 */
export function Statistic({
  title,
  value,
  precision,
  prefix,
  suffix,
  valueStyle,
  groupSeparator = ",",
  className,
}: StatisticProps) {
  const display =
    typeof value === "number" ? formatNumber(value, precision, groupSeparator) : value;

  return (
    <div className={cx("rideos-statistic", className)}>
      {title != null && <div className="rideos-statistic-title">{title}</div>}
      <div className="rideos-statistic-value" style={valueStyle}>
        {prefix != null && <span className="rideos-statistic-prefix">{prefix}</span>}
        <span className="rideos-statistic-number">{display}</span>
        {suffix != null && <span className="rideos-statistic-suffix">{suffix}</span>}
      </div>
    </div>
  );
}
