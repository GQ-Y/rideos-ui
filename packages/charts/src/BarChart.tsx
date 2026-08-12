import { useState } from "react";
import type { MouseEvent } from "react";
import { ChartLegend } from "./internal/ChartLegend";
import { ChartTooltip } from "./internal/ChartTooltip";
import type { TooltipState } from "./internal/ChartTooltip";
import { cx } from "./internal/cx";
import { computeBox, xLabelStep } from "./internal/layout";
import { seriesColor } from "./internal/palette";
import { formatValue, niceScale, seriesExtent, valueToY } from "./internal/scale";
import { useContainerWidth } from "./internal/useContainerWidth";
import type { CartesianChartProps } from "./types";

export interface BarChartProps extends CartesianChartProps {
  /** 堆叠模式;false 为分组柱 */
  stacked?: boolean;
  /** 柱顶圆角,默认 2 */
  barRadius?: number;
}

/**
 * 柱状图:多系列分组 / 堆叠
 * 纯 SVG 渲染,自适应容器宽度,图例可点击开关系列。
 */
export function BarChart({
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
  stacked = false,
  barRadius = 2,
}: BarChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(fixedWidth);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const visible = series.filter((s) => !hiddenNames.includes(s.name));
  const count = categories.length;
  const hasData =
    count > 0 && series.length > 0 && visible.some((s) => s.data.some((v) => v != null));

  const legendHeight = legend ? 26 : 0;
  const svgHeight = Math.max(0, height - legendHeight);

  const [dataMin, dataMax] = seriesExtent(visible, stacked);
  const scale = niceScale(
    beginAtZero ? Math.min(0, dataMin) : dataMin,
    beginAtZero ? Math.max(0, dataMax) : dataMax,
  );
  const yLabels = scale.ticks.map(valueFormatter);
  const box = computeBox(width, svgHeight, yLabels);
  const band = count > 0 ? box.innerWidth / count : 0;
  const yAt = (value: number) => valueToY(value, scale, box.top, box.innerHeight);
  const baselineY = yAt(Math.min(Math.max(0, scale.min), scale.max));
  const labelStep = xLabelStep(count, box.innerWidth);

  function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
    if (!tooltip || !hasData || count === 0 || band <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const rawIndex = Math.floor((mouseX - box.left) / band);
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
    tooltipState = {
      x: box.left + band * hoverIndex + band / 2,
      y: box.top + 12,
      title: categories[hoverIndex],
      items,
    };
  }

  /* 逐类目累计堆叠高度 */
  const stackPos = new Array<number>(count).fill(0);
  const stackNeg = new Array<number>(count).fill(0);

  const visibleCount = Math.max(1, visible.length);
  const groupedBarWidth = Math.min(40, (band * 0.72) / visibleCount);
  const groupedTotal = groupedBarWidth * visibleCount;
  const stackedBarWidth = Math.min(40, band * 0.5);

  return (
    <div
      ref={ref}
      className={cx("rideos-chart", "rideos-bar-chart", className)}
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
          {hoverIndex != null ? (
            <rect
              className="rideos-chart-hover-band"
              x={box.left + band * hoverIndex}
              y={box.top}
              width={band}
              height={box.innerHeight}
            />
          ) : null}
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
                x={box.left + band * i + band / 2}
                y={svgHeight - 8}
                textAnchor="middle"
              >
                {label}
              </text>
            ) : null,
          )}
          {categories.map((_, ci) => {
            let visibleIndex = -1;
            return (
              <g key={ci}>
                {series.map((s, si) => {
                  if (hiddenNames.includes(s.name)) return null;
                  visibleIndex += 1;
                  const value = s.data[ci];
                  if (value == null) return null;
                  const color = seriesColor(si, s.color);
                  if (stacked) {
                    const base = value >= 0 ? stackPos[ci] : stackNeg[ci];
                    const next = base + value;
                    if (value >= 0) stackPos[ci] = next;
                    else stackNeg[ci] = next;
                    const y1 = yAt(base);
                    const y2 = yAt(next);
                    const x = box.left + band * ci + (band - stackedBarWidth) / 2;
                    return (
                      <rect
                        key={s.name}
                        className="rideos-chart-bar"
                        x={x}
                        y={Math.min(y1, y2)}
                        width={stackedBarWidth}
                        height={Math.max(1, Math.abs(y1 - y2))}
                        fill={color}
                      />
                    );
                  }
                  const x =
                    box.left + band * ci + (band - groupedTotal) / 2 + groupedBarWidth * visibleIndex;
                  const valueY = yAt(value);
                  return (
                    <rect
                      key={s.name}
                      className="rideos-chart-bar"
                      x={x}
                      y={Math.min(valueY, baselineY)}
                      width={Math.max(1, groupedBarWidth - 2)}
                      height={Math.max(1, Math.abs(baselineY - valueY))}
                      rx={Math.min(barRadius, groupedBarWidth / 2)}
                      fill={color}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}
      {tooltip ? <ChartTooltip state={tooltipState} containerWidth={width} /> : null}
    </div>
  );
}
