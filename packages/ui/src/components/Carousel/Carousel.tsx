import { Children, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface CarouselProps {
  /** 面板内容(每个直接子元素为一屏) */
  children?: ReactNode;
  /** 自动轮播,默认 true */
  autoPlay?: boolean;
  /** 轮播间隔(ms),默认 4000 */
  interval?: number;
  /** 显示底部圆点指示器,默认 true */
  dots?: boolean;
  /** 显示左右切换箭头,默认 true */
  arrows?: boolean;
  className?: string;
  style?: CSSProperties;
}

function ArrowIcon({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      style={flipped ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M15.1 4.3a1 1 0 0 1 0 1.4L8.83 12l6.27 6.3a1 1 0 1 1-1.42 1.4l-6.97-7a1 1 0 0 1 0-1.4l6.97-7a1 1 0 0 1 1.42 0Z" />
    </svg>
  );
}

/**
 * 走马灯:横向滑动切换的轮播容器,循环播放、悬停暂停,
 * 支持左右箭头与底部圆点切换
 */
export function Carousel({
  children,
  autoPlay = true,
  interval = 4000,
  dots = true,
  arrows = true,
  className,
  style,
}: CarouselProps) {
  const panels = Children.toArray(children);
  const count = panels.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  /* 面板数量减少时防止索引越界 */
  const current = count === 0 ? 0 : Math.min(index, count - 1);

  useEffect(() => {
    if (!autoPlay || hovered || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, hovered, interval, count]);

  function go(next: number) {
    if (count === 0) return;
    setIndex(((next % count) + count) % count);
  }

  return (
    <div
      className={cx("rideos-carousel", className)}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="rideos-carousel-track"
        style={{ transform: `translateX(${current * -100}%)` }}
      >
        {panels.map((panel, i) => (
          <div
            className="rideos-carousel-panel"
            key={i}
            aria-hidden={i !== current || undefined}
          >
            {panel}
          </div>
        ))}
      </div>
      {arrows && count > 1 && (
        <>
          <button
            type="button"
            className="rideos-carousel-arrow is-prev"
            aria-label="上一张"
            onClick={() => go(current - 1)}
          >
            <ArrowIcon />
          </button>
          <button
            type="button"
            className="rideos-carousel-arrow is-next"
            aria-label="下一张"
            onClick={() => go(current + 1)}
          >
            <ArrowIcon flipped />
          </button>
        </>
      )}
      {dots && count > 1 && (
        <div className="rideos-carousel-dots" role="tablist">
          {panels.map((_, i) => (
            <button
              type="button"
              key={i}
              role="tab"
              className={cx("rideos-carousel-dot", i === current && "is-active")}
              aria-label={`切换到第 ${i + 1} 张`}
              aria-selected={i === current}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
