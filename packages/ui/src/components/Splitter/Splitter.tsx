import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface SplitterProps {
  /** 分割方向:horizontal 左右两栏 / vertical 上下两栏,默认 horizontal */
  direction?: "horizontal" | "vertical";
  /** 首面板初始占比(0-1),默认 0.5 */
  defaultRatio?: number;
  /** 首面板最小占比,默认 0.15 */
  min?: number;
  /** 首面板最大占比,默认 0.85 */
  max?: number;
  /** 拖拽调整占比时触发 */
  onRatioChange?: (ratio: number) => void;
  /** 两个面板内容,依次为首/次面板 */
  children: [ReactNode, ReactNode];
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 分隔面板:两栏布局,拖拽中间分隔条按容器比例调整面板尺寸
 * 拖拽通过 mousedown + document mousemove/mouseup 实现,期间禁用文本选择。
 */
export function Splitter({
  direction = "horizontal",
  defaultRatio = 0.5,
  min = 0.15,
  max = 0.85,
  onRatioChange,
  children,
  className,
}: SplitterProps) {
  const [ratio, setRatio] = useState(() => clamp(defaultRatio, min, max));
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* 拖拽期间 document 监听里的闭包取不到最新 state,用 ref 去重 */
  const latestRef = useRef(ratio);

  useEffect(() => {
    latestRef.current = ratio;
  }, [ratio]);

  function commit(next: number) {
    if (next === latestRef.current) return;
    latestRef.current = next;
    setRatio(next);
    onRatioChange?.(next);
  }

  function ratioFromPointer(clientX: number, clientY: number): number | null {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const size = direction === "vertical" ? rect.height : rect.width;
    if (size <= 0) return null;
    const offset = direction === "vertical" ? clientY - rect.top : clientX - rect.left;
    /* 消除除法产生的浮点尾数 */
    return Number(clamp(offset / size, min, max).toFixed(4));
  }

  function handleBarMouseDown(event: ReactMouseEvent) {
    event.preventDefault();
    setDragging(true);
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const handleMove = (moveEvent: globalThis.MouseEvent) => {
      const next = ratioFromPointer(moveEvent.clientX, moveEvent.clientY);
      if (next !== null) commit(next);
    };
    const handleUp = () => {
      setDragging(false);
      document.body.style.userSelect = previousUserSelect;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }

  const [firstPane, secondPane] = children;
  const isVertical = direction === "vertical";

  return (
    <div
      ref={containerRef}
      className={cx(
        "rideos-splitter",
        isVertical && "is-vertical",
        dragging && "is-dragging",
        className,
      )}
    >
      <div
        className="rideos-splitter-pane"
        style={{ flexGrow: ratio, flexShrink: 1, flexBasis: 0 }}
      >
        {firstPane}
      </div>
      <div
        className="rideos-splitter-bar"
        role="separator"
        aria-orientation={isVertical ? "horizontal" : "vertical"}
        onMouseDown={handleBarMouseDown}
      />
      <div
        className="rideos-splitter-pane"
        style={{ flexGrow: 1 - ratio, flexShrink: 1, flexBasis: 0 }}
      >
        {secondPane}
      </div>
    </div>
  );
}
