import type { CSSProperties, ReactNode } from "react";
import { arcPath, polarToCartesian } from "./internal/arc";
import { cx } from "./internal/cx";
import { seriesColor } from "./internal/palette";
import { formatValue } from "./internal/scale";
import { useContainerWidth } from "./internal/useContainerWidth";

export interface GaugeSegment {
  /** 分段上界(绝对数值,按升序给出) */
  to: number;
  /** 自定义颜色,缺省按图表色板轮转 */
  color?: string;
}

export interface GaugeChartProps {
  /** 当前数值 */
  value: number;
  /** 量程最小值,默认 0 */
  min?: number;
  /** 量程最大值,默认 100 */
  max?: number;
  /** 标题,显示在中心数值下方 */
  title?: ReactNode;
  /** 数值格式化(中心数值与 min/max 刻度共用) */
  valueFormatter?: (value: number) => string;
  /** 固定宽度;不传则自适应容器宽度 */
  width?: number;
  /** 总高度,默认 240 */
  height?: number;
  /** 数值弧分段配色(to 为分段上界);缺省整段品牌色 */
  segments?: GaugeSegment[];
  /** 轨道底色 */
  trackColor?: string;
  className?: string;
  style?: CSSProperties;
}

/*
 * 270° 圆弧:起 135° 到 405°(左下经顶部到右下)。
 * arc.ts 的极角以 12 点方向为 0° 顺时针,故等价于 225° → 495°。
 */
const START_ANGLE = 225;
const SWEEP_ANGLE = 270;
const END_ANGLE = START_ANGLE + SWEEP_ANGLE;
const SIN45 = Math.SQRT1_2;

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * 仪表盘:单值水平/进度展示
 * 270° 弧带(轨道弧 + 按 value 比例的数值弧)+ 指针 + 中心大号数值,
 * 支持按 segments 分段配色,底部两端显示 min/max 刻度标签。
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  valueFormatter = formatValue,
  width: fixedWidth,
  height = 240,
  segments,
  trackColor,
  className,
  style,
}: GaugeChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(fixedWidth);

  /* 弧带纵向占 (1 + sin45°)·R,顶部留 12,底部留 min/max 标签高度 */
  const radius = Math.max(0, Math.min((width - 32) / 2, (height - 48) / (1 + SIN45)));
  const centerX = width / 2;
  const centerY = 12 + radius;
  const thickness = Math.max(10, radius * 0.16);

  const span = max - min || 1;
  const clamped = Math.min(max, Math.max(min, value));
  const angleOf = (v: number) => START_ANGLE + (SWEEP_ANGLE * (v - min)) / span;

  /* 数值弧分段:未配 segments 时整段品牌色;segments 未覆盖到 max 时余量补色板色 */
  interface ArcPiece {
    from: number;
    to: number;
    color: string;
  }
  const pieces: ArcPiece[] = [];
  if (segments && segments.length > 0) {
    let cursor = min;
    segments.forEach((segment, i) => {
      const to = Math.min(max, Math.max(cursor, segment.to));
      if (to > cursor) pieces.push({ from: cursor, to, color: seriesColor(i, segment.color) });
      cursor = to;
    });
    if (cursor < max) pieces.push({ from: cursor, to: max, color: seriesColor(segments.length) });
  } else {
    pieces.push({ from: min, to: max, color: seriesColor(0) });
  }

  const valueAngle = angleOf(clamped);
  const pointerTip = polarToCartesian(
    centerX,
    centerY,
    Math.max(0, radius - thickness - 6),
    valueAngle,
  );
  const pointerLeft = polarToCartesian(centerX, centerY, 4, valueAngle - 90);
  const pointerRight = polarToCartesian(centerX, centerY, 4, valueAngle + 90);
  const minPos = polarToCartesian(centerX, centerY, radius - thickness / 2, START_ANGLE);
  const maxPos = polarToCartesian(centerX, centerY, radius - thickness / 2, END_ANGLE);

  return (
    <div
      ref={ref}
      className={cx("rideos-chart", "rideos-gauge-chart", className)}
      style={{ ...style, height }}
    >
      {width <= 0 || radius <= 0 ? (
        <div className="rideos-chart-empty" style={{ height }} />
      ) : (
        <svg
          className="rideos-chart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
        >
          <path
            className="rideos-chart-gauge-track"
            d={arcPath(centerX, centerY, radius, radius - thickness, START_ANGLE, END_ANGLE)}
            fill={trackColor ?? "var(--rideos-n200, #f5f6f7)"}
          />
          {pieces
            .filter((piece) => piece.from < clamped)
            .map((piece) => (
              <path
                key={piece.from}
                className="rideos-chart-gauge-arc"
                d={arcPath(
                  centerX,
                  centerY,
                  radius,
                  radius - thickness,
                  angleOf(piece.from),
                  angleOf(Math.min(piece.to, clamped)),
                )}
                fill={piece.color}
              />
            ))}
          <polygon
            className="rideos-chart-gauge-pointer"
            points={`${round(pointerTip.x)},${round(pointerTip.y)} ${round(pointerLeft.x)},${round(
              pointerLeft.y,
            )} ${round(pointerRight.x)},${round(pointerRight.y)}`}
          />
          <circle className="rideos-chart-gauge-cap" cx={round(centerX)} cy={round(centerY)} r={5} />
          <text
            className="rideos-chart-gauge-value"
            x={round(centerX)}
            y={round(centerY + radius * 0.55)}
            textAnchor="middle"
          >
            {valueFormatter(value)}
          </text>
          {title != null ? (
            <text
              className="rideos-chart-gauge-title"
              x={round(centerX)}
              y={round(centerY + radius * 0.55 + 20)}
              textAnchor="middle"
            >
              {title}
            </text>
          ) : null}
          <text
            className="rideos-chart-axis-label"
            x={round(minPos.x)}
            y={round(minPos.y + 18)}
            textAnchor="middle"
          >
            {valueFormatter(min)}
          </text>
          <text
            className="rideos-chart-axis-label"
            x={round(maxPos.x)}
            y={round(maxPos.y + 18)}
            textAnchor="middle"
          >
            {valueFormatter(max)}
          </text>
        </svg>
      )}
    </div>
  );
}
