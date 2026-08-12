import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { polarToCartesian } from "./internal/arc";
import { ChartLegend } from "./internal/ChartLegend";
import { cx } from "./internal/cx";
import { seriesColor } from "./internal/palette";
import { useContainerWidth } from "./internal/useContainerWidth";

export interface RadarIndicator {
  /** 维度名称,显示在轴顶点 */
  name: string;
  /** 该维度的最大值 */
  max: number;
}

export interface RadarSeries {
  name: string;
  /** 各维度数值,与 indicators 按下标对齐 */
  data: number[];
  /** 自定义颜色,缺省按图表色板轮转 */
  color?: string;
}

export interface RadarChartProps {
  /** 维度指标(至少 3 个) */
  indicators: RadarIndicator[];
  /** 数据系列 */
  series: RadarSeries[];
  /** 固定宽度;不传则自适应容器宽度 */
  width?: number;
  /** 总高度(含图例),默认 280 */
  height?: number;
  /** 是否显示图例(可点击开关系列),默认 true */
  legend?: boolean;
  /** 同心网格环数,默认 4 */
  levels?: number;
  /** 数据为空时的占位内容 */
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * 雷达图:多维度指标对比
 * 纯 SVG 渲染,自适应容器宽度;各轴从 12 点方向顺时针均匀分布,
 * 轴顶点显示维度名标签,图例可点击开关系列。
 */
export function RadarChart({
  indicators,
  series,
  width: fixedWidth,
  height = 280,
  legend = true,
  levels = 4,
  emptyText = "暂无数据",
  className,
  style,
}: RadarChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(fixedWidth);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);

  const visible = series.filter((s) => !hiddenNames.includes(s.name));
  const count = indicators.length;
  const hasData = count >= 3 && series.length > 0 && visible.some((s) => s.data.length > 0);

  const legendHeight = legend ? 26 : 0;
  const svgHeight = Math.max(0, height - legendHeight);

  const centerX = width / 2;
  const centerY = svgHeight / 2;
  /* 四周为轴名标签留白:左右 64,上下 24 */
  const radius = Math.max(0, Math.min(width / 2 - 64, svgHeight / 2 - 24));
  const ringCount = Math.max(1, Math.round(levels));

  const angleAt = (index: number) => (360 / count) * index;

  /** 指定半径的正多边形顶点串(12 点方向起,顺时针) */
  function ringPoints(r: number): string {
    return indicators
      .map((_, i) => {
        const p = polarToCartesian(centerX, centerY, r, angleAt(i));
        return `${round(p.x)},${round(p.y)}`;
      })
      .join(" ");
  }

  return (
    <div
      ref={ref}
      className={cx("rideos-chart", "rideos-radar-chart", className)}
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
            setHiddenNames((prev) =>
              prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
            );
          }}
        />
      ) : null}
      {!hasData || width <= 0 || radius <= 0 ? (
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
        >
          {Array.from({ length: ringCount }, (_, li) => (
            <polygon
              key={li}
              className="rideos-chart-grid-line"
              fill="none"
              points={ringPoints((radius * (li + 1)) / ringCount)}
            />
          ))}
          {indicators.map((indicator, i) => {
            const end = polarToCartesian(centerX, centerY, radius, angleAt(i));
            const labelPos = polarToCartesian(centerX, centerY, radius + 10, angleAt(i));
            const dx = labelPos.x - centerX;
            const dy = labelPos.y - centerY;
            const anchor = Math.abs(dx) < 4 ? "middle" : dx > 0 ? "start" : "end";
            const offsetY = Math.abs(dy) < 4 ? 4 : dy > 0 ? 12 : -4;
            return (
              <g key={indicator.name}>
                <line
                  className="rideos-chart-radar-axis"
                  x1={round(centerX)}
                  y1={round(centerY)}
                  x2={round(end.x)}
                  y2={round(end.y)}
                />
                <text
                  className="rideos-chart-axis-label"
                  x={round(labelPos.x)}
                  y={round(labelPos.y + offsetY)}
                  textAnchor={anchor}
                >
                  {indicator.name}
                </text>
              </g>
            );
          })}
          {series.map((s, si) => {
            if (hiddenNames.includes(s.name)) return null;
            const color = seriesColor(si, s.color);
            const points = indicators
              .map((indicator, i) => {
                const ratio =
                  indicator.max > 0 ? Math.min(1, Math.max(0, (s.data[i] ?? 0) / indicator.max)) : 0;
                const p = polarToCartesian(centerX, centerY, radius * ratio, angleAt(i));
                return `${round(p.x)},${round(p.y)}`;
              })
              .join(" ");
            return (
              <polygon
                key={s.name}
                className="rideos-chart-radar-series"
                points={points}
                stroke={color}
                fill={color}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
