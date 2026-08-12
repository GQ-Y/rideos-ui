import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

const pad = (n: number) => String(n).padStart(2, "0");

function toTimestamp(input: number | string | Date | undefined): number | null {
  if (input == null) return null;
  const ts = input instanceof Date ? input.getTime() : new Date(input).getTime();
  return Number.isNaN(ts) ? null : ts;
}

export interface CountdownProps {
  /** 倒计时目标时间(与 since 二选一) */
  deadline?: number | string | Date;
  /** 正计时起点(计时器模式) */
  since?: number | string | Date;
  /** 标题 */
  title?: ReactNode;
  /** 前/后缀 */
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** 超过 24 小时是否拆出"天",默认 true */
  showDays?: boolean;
  /** 倒计时结束回调(仅 deadline 模式) */
  onFinish?: () => void;
  className?: string;
}

function splitDuration(ms: number, showDays: boolean) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = showDays ? Math.floor(total / 86400) : 0;
  const hours = Math.floor((total - days * 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

/**
 * 计时器:倒计时(deadline)/ 正计时(since)
 * 每秒刷新;倒计时到 0 停止并触发 onFinish。
 */
export function Countdown({
  deadline,
  since,
  title,
  prefix,
  suffix,
  showDays = true,
  onFinish,
  className,
}: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  const finishedRef = useRef(false);

  const deadlineTs = toTimestamp(deadline);
  const sinceTs = toTimestamp(since);
  const isCountdown = deadlineTs != null;
  const remaining = isCountdown ? deadlineTs - now : now - (sinceTs ?? now);

  useEffect(() => {
    finishedRef.current = false;
  }, [deadlineTs]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isCountdown && remaining <= 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.();
    }
  }, [isCountdown, remaining, onFinish]);

  const { days, hours, minutes, seconds } = splitDuration(remaining, showDays);

  return (
    <div className={cx("rideos-countdown", className)}>
      {title && <small className="rideos-countdown-title">{title}</small>}
      <span className="rideos-countdown-body">
        {prefix && <span className="rideos-countdown-affix">{prefix}</span>}
        {showDays && days > 0 && (
          <>
            <b className="rideos-countdown-value">{days}</b>
            <i className="rideos-countdown-unit">天</i>
          </>
        )}
        <b className="rideos-countdown-value">{pad(hours)}</b>
        <i className="rideos-countdown-sep">:</i>
        <b className="rideos-countdown-value">{pad(minutes)}</b>
        <i className="rideos-countdown-sep">:</i>
        <b className="rideos-countdown-value">{pad(seconds)}</b>
        {suffix && <span className="rideos-countdown-affix">{suffix}</span>}
      </span>
    </div>
  );
}
