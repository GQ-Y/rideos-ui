import type { ReactNode } from "react";

export interface TooltipItem {
  name: string;
  value: string;
  color: string;
}

export interface TooltipState {
  /** 相对图表容器的坐标 */
  x: number;
  y: number;
  title?: ReactNode;
  items: TooltipItem[];
}

/** 悬浮提示框:绝对定位在图表容器内,靠右时自动翻转 */
export function ChartTooltip({
  state,
  containerWidth,
}: {
  state: TooltipState | null;
  containerWidth: number;
}) {
  if (!state || state.items.length === 0) return null;
  const flip = containerWidth > 0 && state.x > containerWidth * 0.62;
  return (
    <div
      className="rideos-chart-tooltip"
      style={{
        left: state.x + (flip ? -12 : 12),
        top: Math.max(4, state.y - 8),
        transform: flip ? "translateX(-100%)" : undefined,
      }}
    >
      {state.title != null ? <div className="rideos-chart-tooltip-title">{state.title}</div> : null}
      {state.items.map((item) => (
        <div key={item.name} className="rideos-chart-tooltip-item">
          <span className="rideos-chart-tooltip-dot" style={{ background: item.color }} />
          <span>{item.name}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  );
}
