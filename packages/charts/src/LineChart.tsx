import { useState } from "react";
import type { MouseEvent } from "react";
import { ChartLegend } from "./internal/ChartLegend";
import { ChartTooltip } from "./internal/ChartTooltip";
import type { TooltipState } from "./internal/ChartTooltip";
import { cx } from "./internal/cx";
import { computeBox, xLabelStep } from "./internal/layout";
import { seriesColor } from "./internal/palette";
import { areaPath, linePath } from "./internal/path";
import type { PathPoint } from "./internal/path";
import { formatValue, niceScale, seriesExtent, valueToY } from "./internal/scale";
import { useContainerWidth } from "./internal/useContainerWidth";
import type { CartesianChartProps } from "./types";

export interface LineChartProps extends CartesianChartProps {
  /** 平滑曲线(曲线图);false 为折线图 */
  smooth?: boolean;
  /** 面积填充 */
  area?: boolean;
  /** 显示数据点圆点,默认 true */
  showSymbol?: boolean;
}

interface SegmentPoint extends PathPoint {
  index: number;
}

/** 把一条系列按 null 缺数切成若干连续段 */
function buildSegments(
  data: Array<number | null>,
  count: number,
  xAt: (index: number) => number,
  yAt: (value: number) => number,
): SegmentPoint[][] {
  const segments: SegmentPoint[][] = [];
  let current: SegmentPoint[] = [];
  for (let i = 0; i < count; i += 1) {
    const value = data[i];
    if (value == null) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push({ x: xAt(i), y: yAt(value), index: i });
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

/**
 * 折线图 / 曲线图(smooth)/ 面积图(area)
 * 纯 SVG 渲染,自适应容器宽度,图例可点击开关系列。
 */
export function LineChart({
  categories,
  series,
  width: fixedWidth,
  height = 280,
  legend = true,
  tooltip = true,
  grid = true,
  beginAtZero = true,
  valueFormatter = formatValue,
  emptyText = "暂无数据",
  className,
  style,
  smooth = false,
  area = false,
  showSymbol = true,
}: LineChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(fixedWidth);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const visible = series.filter((s) => !hiddenNames.includes(s.name));
  const count = categories.length;
  const hasData =
    count > 0 && series.length > 0 && visible.some((s) => s.data.some((v) => v != null));

  const legendHeight = legend ? 26 : 0;
  const svgHeight = Math.max(0, height - legendHeight);

  const [dataMin, dataMax] = seriesExtent(visible, false);
  const scale = niceScale(
    beginAtZero ? Math.min(0, dataMin) : dataMin,
    beginAtZero ? Math.max(0, dataMax) : dataMax,
  );
  const yLabels = scale.ticks.map(valueFormatter);
  const box = computeBox(width, svgHeight, yLabels);
  const step = count > 1 ? box.innerWidth / (count - 1) : 0;
  const xAt = (index: number) =>
    count > 1 ? box.left + step * index : box.left + box.innerWidth / 2;
  const yAt = (value: number) => valueToY(value, scale, box.top, box.innerHeight);
  const baselineValue = Math.min(Math.max(0, scale.min), scale.max);
  const labelStep = xLabelStep(count, box.innerWidth);

  function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
    if (!tooltip || !hasData || count === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const rawIndex = count > 1 ? Math.round((mouseX - box.left) / (step || 1)) : 0;
    setHoverIndex(Math.min(count - 1, Math.max(0, rawIndex)));
  }

  let tooltipState: TooltipState | null = null;
  if (tooltip && hoverIndex != null && hasData) {
    const items = series
      .map((s, si) => ({ s, si }))
      .filter(({ s }) => !hiddenNames.includes(s.name) && s.data[hoverIndex] != null)
      .map(({ s, si }) => ({
        name: s.name,
        value: valueFormatter(s.data[hoverIndex] as number),
        color: seriesColor(si, s.color),
      }));
    tooltipState = { x: xAt(hoverIndex), y: box.top + 12, title: categories[hoverIndex], items };
  }

  return (
    <div
      ref={ref}
      className={cx("rideos-chart", "rideos-line-chart", className)}
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
            setHoverIndex(null);
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
          onMouseLeave={() => setHoverIndex(null)}
        >
          {scale.ticks.map((tick) => (
            <g key={tick}>
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
          <line
            className="rideos-chart-axis-line"
            x1={box.left}
            x2={box.left + box.innerWidth}
            y1={box.top + box.innerHeight}
            y2={box.top + box.innerHeight}
          />
          {categories.map((label, i) =>
            i % labelStep === 0 ? (
              <text
                key={`${label}-${i}`}
                className="rideos-chart-axis-label"
                x={xAt(i)}
                y={svgHeight - 8}
                textAnchor="middle"
              >
                {label}
              </text>
            ) : null,
          )}
          {hoverIndex != null ? (
            <line
              className="rideos-chart-guide-line"
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={box.top}
              y2={box.top + box.innerHeight}
            />
          ) : null}
          {series.map((s, si) => {
            if (hiddenNames.includes(s.name)) return null;
            const color = seriesColor(si, s.color);
            const segments = buildSegments(s.data, count, xAt, yAt);
            return (
              <g key={s.name}>
                {area
                  ? segments.map((segment, gi) => (
                      <path
                        key={`a-${gi}`}
                        className="rideos-chart-area"
                        d={areaPath(segment, yAt(baselineValue), smooth)}
                        fill={color}
                      />
                    ))
                  : null}
                {segments.map((segment, gi) => (
                  <path
                    key={`l-${gi}`}
                    className="rideos-chart-line"
                    d={linePath(segment, smooth)}
                    stroke={color}
                  />
                ))}
                {showSymbol
                  ? segments.flatMap((segment) =>
                      segment.map((point) => (
                        <circle
                          key={`s-${point.index}`}
                          className="rideos-chart-symbol"
                          cx={point.x}
                          cy={point.y}
                          r={hoverIndex === point.index ? 4.5 : 3}
                          stroke={color}
                        />
                      )),
                    )
                  : null}
              </g>
            );
          })}
        </svg>
      )}
      {tooltip ? <ChartTooltip state={tooltipState} containerWidth={width} /> : null}
    </div>
  );
}
