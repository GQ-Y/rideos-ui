import { useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { arcPath, polarToCartesian } from "./internal/arc";
import { ChartLegend } from "./internal/ChartLegend";
import { ChartTooltip } from "./internal/ChartTooltip";
import type { TooltipState } from "./internal/ChartTooltip";
import { cx } from "./internal/cx";
import { seriesColor } from "./internal/palette";
import { formatValue } from "./internal/scale";
import { useContainerWidth } from "./internal/useContainerWidth";
import type { PieDatum } from "./types";

export interface PieChartProps {
  /** 数据项(占比统计) */
  data: PieDatum[];
  /** 环形图 */
  donut?: boolean;
  /** 直径;不传则按容器与高度自适应 */
  size?: number;
  /** 固定宽度;不传则自适应容器宽度 */
  width?: number;
  /** 总高度(含图例),默认 280 */
  height?: number;
  /** 是否显示图例,默认 true */
  legend?: boolean;
  /** 是否显示悬浮提示,默认 true */
  tooltip?: boolean;
  /** 扇区内百分比标签(跨度足够大时),默认 true */
  showPercent?: boolean;
  /** 环形图中心标题,默认「总计」 */
  centerTitle?: ReactNode;
  /** 环形图中心数值,默认为总和 */
  centerValue?: ReactNode;
  valueFormatter?: (value: number) => string;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 饼图 / 环形图(donut):占比统计
 * 悬浮高亮切片,图例可点击开关数据项。
 */
export function PieChart({
  data,
  donut = false,
  size,
  width: fixedWidth,
  height = 280,
  legend = true,
  tooltip = true,
  showPercent = true,
  centerTitle = "总计",
  centerValue,
  valueFormatter = formatValue,
  emptyText = "暂无数据",
  className,
  style,
}: PieChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(fixedWidth);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(null);

  const legendHeight = legend ? 26 : 0;
  const svgHeight = Math.max(0, height - legendHeight);

  const visible = data.filter((d) => !hiddenNames.includes(d.name) && d.value > 0);
  const total = visible.reduce((sum, d) => sum + d.value, 0);
  const hasData = total > 0;

  const diameter = size ?? Math.max(0, Math.min(width - 16, svgHeight - 8));
  const outerRadius = diameter / 2;
  const innerRadius = donut ? outerRadius * 0.62 : 0;
  const centerX = width / 2;
  const centerY = svgHeight / 2;

  function handleSliceMove(index: number) {
    return (event: MouseEvent<SVGPathElement>) => {
      if (!tooltip) return;
      const host = ref.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      setHover({ index, x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
  }

  /* 预计算切片角度 */
  interface PieSlice {
    datum: PieDatum;
    start: number;
    end: number;
    percent: number;
    colorIndex: number;
  }
  const slices: PieSlice[] = [];
  let angle = 0;
  for (const datum of visible) {
    const sweep = (datum.value / total) * 360;
    slices.push({
      datum,
      start: angle,
      end: angle + Math.min(sweep, 359.99),
      percent: (datum.value / total) * 100,
      colorIndex: data.indexOf(datum),
    });
    angle += sweep;
  }

  let tooltipState: TooltipState | null = null;
  if (tooltip && hover && slices[hover.index]) {
    const slice = slices[hover.index];
    tooltipState = {
      x: hover.x,
      y: hover.y,
      items: [
        {
          name: slice.datum.name,
          value: `${valueFormatter(slice.datum.value)} · ${slice.percent.toFixed(1)}%`,
          color: seriesColor(slice.colorIndex, slice.datum.color),
        },
      ],
    };
  }

  return (
    <div
      ref={ref}
      className={cx("rideos-chart", "rideos-pie-chart", className)}
      style={{ ...style, height }}
    >
      {legend ? (
        <ChartLegend
          entries={data.map((d, i) => ({
            name: d.name,
            color: seriesColor(i, d.color),
            disabled: hiddenNames.includes(d.name),
          }))}
          onToggle={(name) => {
            setHover(null);
            setHiddenNames((prev) =>
              prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
            );
          }}
        />
      ) : null}
      {!hasData || width <= 0 || diameter <= 0 ? (
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
          onMouseLeave={() => setHover(null)}
        >
          {slices.map((slice, index) => {
            const color = seriesColor(slice.colorIndex, slice.datum.color);
            const dimmed = hover != null && hover.index !== index;
            const midAngle = (slice.start + slice.end) / 2;
            const labelPos = polarToCartesian(
              centerX,
              centerY,
              innerRadius > 0 ? (innerRadius + outerRadius) / 2 : outerRadius * 0.66,
              midAngle,
            );
            const sweep = slice.end - slice.start;
            return (
              <g key={slice.datum.name}>
                <path
                  className="rideos-chart-pie-slice"
                  d={arcPath(centerX, centerY, outerRadius, innerRadius, slice.start, slice.end)}
                  fill={color}
                  opacity={dimmed ? 0.45 : 1}
                  onMouseMove={handleSliceMove(index)}
                />
                {showPercent && sweep >= 28 ? (
                  <text
                    className="rideos-chart-pie-label"
                    x={labelPos.x}
                    y={labelPos.y + 4}
                    textAnchor="middle"
                  >
                    {`${Math.round(slice.percent)}%`}
                  </text>
                ) : null}
              </g>
            );
          })}
          {donut ? (
            <g className="rideos-chart-pie-center" pointerEvents="none">
              <text
                className="rideos-chart-pie-center-value"
                x={centerX}
                y={centerY}
                textAnchor="middle"
              >
                {centerValue ?? valueFormatter(total)}
              </text>
              <text
                className="rideos-chart-pie-center-title"
                x={centerX}
                y={centerY + 20}
                textAnchor="middle"
              >
                {centerTitle}
              </text>
            </g>
          ) : null}
        </svg>
      )}
      {tooltip ? <ChartTooltip state={tooltipState} containerWidth={width} /> : null}
    </div>
  );
}
