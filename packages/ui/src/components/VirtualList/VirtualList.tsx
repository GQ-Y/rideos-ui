import { useState } from "react";
import type { CSSProperties, Key, ReactNode, UIEvent } from "react";
import { cx } from "../../utils/cx";

export interface VirtualListProps<T> {
  /** 全量数据 */
  data: T[];
  /** 每行固定高度(px) */
  itemHeight: number;
  /** 可视区高度(px) */
  height: number;
  /** 行渲染 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 行 key,缺省用下标 */
  itemKey?: (item: T, index: number) => Key;
  /** 可视区外预渲染行数,默认 5 */
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 虚拟列表:固定行高的大数据量列表,只渲染可视区内的 DOM
 * 万级数据滚动流畅;Table/Select/Tree 的虚拟滚动将基于同一思路内置。
 */
export function VirtualList<T>({
  data,
  itemHeight,
  height,
  renderItem,
  itemKey,
  overscan = 5,
  onScroll,
  emptyText = "暂无数据",
  className,
  style,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const total = data.length;
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + height) / itemHeight) + overscan);
  const visible = data.slice(start, end);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const top = event.currentTarget.scrollTop;
    setScrollTop(top);
    onScroll?.(top);
  }

  if (total === 0) {
    return (
      <div className={cx("rideos-virtual-list", className)} style={{ ...style, height }}>
        <div className="rideos-virtual-list-empty">{emptyText}</div>
      </div>
    );
  }

  return (
    <div
      className={cx("rideos-virtual-list", className)}
      style={{ ...style, height }}
      onScroll={handleScroll}
    >
      <div className="rideos-virtual-list-phantom" style={{ height: total * itemHeight }}>
        <div
          className="rideos-virtual-list-window"
          style={{ transform: `translateY(${start * itemHeight}px)` }}
        >
          {visible.map((item, offset) => {
            const index = start + offset;
            return (
              <div
                key={itemKey ? itemKey(item, index) : index}
                className="rideos-virtual-list-item"
                style={{ height: itemHeight }}
              >
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
