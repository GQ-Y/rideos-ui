import { useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { ChartLegend } from "./internal/ChartLegend";
import { ChartTooltip } from "./internal/ChartTooltip";
import type { TooltipState } from "./internal/ChartTooltip";
import { cx } from "./internal/cx";
import { computeBox } from "./internal/layout";
import { seriesColor } from "./internal/palette";
import { formatValue, niceScale, valueToY } from "./internal/scale";
import { useContainerWidth } from "./internal/useContainerWidth";

export interface ScatterSeries {
  name: string;
  /** 数据点列表,每项为 [x, y] */
  data: Array<[number, number]>;
  /** 自定义颜色,缺省按图表色板轮转 */
  color?: string;
}

export interface ScatterChartProps {
  /** 数据系列 */
  series: ScatterSeries[];
  /** X 轴名称,显示在底部居中 */
  xLabel?: string;
  /** Y 轴名称,显示在左上角 */
  yLabel?: string;
  /** 固定宽度;不传则自适应容器宽度 */
  width?: number;
  /** 总高度(含图例),默认 280 */
  height?: number;
  /** 是否显示图例(可点击开关系列),默认 true */
  legend?: boolean;
  /** 是否显示悬浮提示(就近吸附数据点),默认 true */
  tooltip?: boolean;
  /** 是否显示网格线,默认 true */
  grid?: boolean;
  /** 散点半径,默认 5 */
  symbolSize?: number;
  /** 数值格式化(坐标轴刻度与 tooltip 共用) */
  valueFormatter?: (value: number) => string;
  /** 数据为空时的占位内容 */
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** 悬浮命中数据点的最大像素距离 */
const HOVER_RADIUS = 24;

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * 散点图:双数值轴分布/相关性
 * 纯 SVG 渲染,自适应容器宽度;x/y 均为数值轴(nice 刻度),
 * 悬浮就近吸附数据点显示坐标,图例可点击开关系列。
 */
export function ScatterChart({
  series,
  xLabel,
  yLabel,
  width: fixedWidth,
  height = 280,
  legend = true,
  tooltip = true,
  grid = true,
  symbolSize = 5,
  valueFormatter = formatValue,
  emptyText = "暂无数据",
  className,
  style,
}: ScatterChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(fixedWidth);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);
  const [hover, setHover] = useState<{ si: number; pi: number } | null>(null);

  const visible = series.filter((s) => !hiddenNames.includes(s.name));
  const hasData = series.length > 0 && visible.some((s) => s.data.length > 0);

  const legendHeight = legend ? 26 : 0;
  const svgHeight = Math.max(0, height - legendHeight);

  /* x/y 双数值轴范围(仅统计可见系列) */
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const s of visible) {
    for (const [x, y] of s.data) {
      xMin = Math.min(xMin, x);
      xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }
  const xScale = niceScale(Number.isFinite(xMin) ? xMin : 0, Number.isFinite(xMax) ? xMax : 0);
  const yScale = niceScale(Number.isFinite(yMin) ? yMin : 0, Number.isFinite(yMax) ? yMax : 0);
  const yLabels = yScale.ticks.map(valueFormatter);

  /* 轴名占位:xLabel 在底部加一行,yLabel 在顶部加一行 */
  const padTop = yLabel ? 16 : 0;
  const padBottom = xLabel ? 16 : 0;
  const rawBox = computeBox(width, svgHeight - padTop - padBottom, yLabels);
  const box = { ...rawBox, top: rawBox.top + padTop };
  const axisY = box.top + box.innerHeight;

  const xSpan = xScale.max - xScale.min || 1;
  const xAt = (v: number) => box.left + ((v - xScale.min) / xSpan) * box.innerWidth;
  const yAt = (v: number) => valueToY(v, yScale, box.top, box.innerHeight);

  function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
    if (!tooltip || !hasData) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let best: { si: number; pi: number } | null = null;
    let bestDist = HOVER_RADIUS * HOVER_RADIUS;
    for (let si = 0; si < series.length; si += 1) {
      const s = series[si];
      if (hiddenNames.includes(s.name)) continue;
      for (let pi = 0; pi < s.data.length; pi += 1) {
        const dx = xAt(s.data[pi][0]) - mouseX;
        const dy = yAt(s.data[pi][1]) - mouseY;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          best = { si, pi };
        }
      }
    }
    setHover(best);
  }

  let tooltipState: TooltipState | null = null;
  if (tooltip && hover && series[hover.si] && !hiddenNames.includes(series[hover.si].name)) {
    const s = series[hover.si];
    const point = s.data[hover.pi];
    if (point) {
      tooltipState = {
        x: xAt(point[0]),
        y: yAt(point[1]),
        title: s.name,
        items: [
          {
            name: "坐标",
            value: `(${valueFormatter(point[0])}, ${valueFormatter(point[1])})`,
            color: seriesColor(hover.si, s.color),
          },
        ],
      };
    }
  }

  return (
    <div
      ref={ref}
      className={cx("rideos-chart", "rideos-scatter-chart", className)}
      style={{ ...style, height }}
    >
      {legend ? (
        <ChartLegend
          entries={series.map((s, i) => ({
            name: s.name,
            color: seriesColor(i, s.color),
            disabled: hiddenNames.includes(s.name),
          }))}
          onToggle={(name) => {
            setHover(null);
            setHiddenNames((prev) =>
              prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
            );
          }}
        />
      ) : null}
      {!hasData || width <= 0 ? (
        <div className="rideos-chart-empty" style={{ height: svgHeight }}>
          {emptyText}
        </div>
      ) : (
        <svg
          className="rideos-chart-svg"
          width={width}
          height={svgHeight}
          viewBox={`0 0 ${width} ${svgHeight}`}
          role="img"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(null)}
        >
          {yScale.ticks.map((tick) => (
            <g key={`y-${tick}`}>
              {grid ? (
                <line
                  className="rideos-chart-grid-line"
                  x1={box.left}
                  x2={box.left + box.innerWidth}
                  y1={yAt(tick)}
                  y2={yAt(tick)}
                />
              ) : null}
              <text
                className="rideos-chart-axis-label"
                x={box.left - 8}
                y={yAt(tick) + 4}
                textAnchor="end"
              >
                {valueFormatter(tick)}
              </text>
            </g>
          ))}
          {xScale.ticks.map((tick) => (
            <g key={`x-${tick}`}>
              {grid ? (
                <line
                  className="rideos-chart-grid-line"
                  x1={xAt(tick)}
                  x2={xAt(tick)}
                  y1={box.top}
                  y2={axisY}
                />
              ) : null}
              <text
                className="rideos-chart-axis-label"
                x={xAt(tick)}
                y={axisY + 18}
                textAnchor="middle"
              >
                {valueFormatter(tick)}
              </text>
            </g>
          ))}
          <line
            className="rideos-chart-axis-line"
            x1={box.left}
            x2={box.left + box.innerWidth}
            y1={axisY}
            y2={axisY}
          />
          <line
            className="rideos-chart-axis-line"
            x1={box.left}
            x2={box.left}
            y1={box.top}
            y2={axisY}
          />
          {xLabel ? (
            <text
              className="rideos-chart-axis-label"
              x={box.left + box.innerWidth / 2}
              y={axisY + 32}
              textAnchor="middle"
            >
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text className="rideos-chart-axis-label" x={box.left} y={box.top - 8} textAnchor="end">
              {yLabel}
            </text>
          ) : null}
          {series.map((s, si) => {
            if (hiddenNames.includes(s.name)) return null;
            const color = seriesColor(si, s.color);
            return (
              <g key={s.name}>
                {s.data.map(([x, y], pi) => (
                  <circle
                    key={pi}
                    className="rideos-chart-scatter-dot"
                    cx={round(xAt(x))}
                    cy={round(yAt(y))}
                    r={hover && hover.si === si && hover.pi === pi ? symbolSize + 1.5 : symbolSize}
                    fill={color}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      )}
      {tooltip ? <ChartTooltip state={tooltipState} containerWidth={width} /> : null}
    </div>
  );
}
