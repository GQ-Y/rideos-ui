import { useMemo } from "react";
import type { CSSProperties } from "react";
import { cx } from "../../utils/cx";
import { generateQRMatrix } from "./encoder";
import type { QRErrorLevel } from "./encoder";

export type { QRErrorLevel };

export interface QRCodeProps {
  /** 编码内容(URL/文本) */
  value: string;
  /** 尺寸(px),默认 160 */
  size?: number;
  /** 纠错等级,默认 M */
  level?: QRErrorLevel;
  /** 码点颜色,默认深色文本 token */
  color?: string;
  /** 背景色,默认表面色 token */
  bgColor?: string;
  /** 四周留白(模块数),默认 4 */
  margin?: number;
  /** 过期/失效遮罩(点击刷新场景) */
  expired?: boolean;
  onRefresh?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * 二维码:零依赖 SVG 渲染(字节模式,版本 1-10 自适应)
 */
export function QRCode({
  value,
  size = 160,
  level = "M",
  color = "var(--rideos-n900)",
  bgColor = "var(--rideos-white)",
  margin = 4,
  expired = false,
  onRefresh,
  className,
  style,
}: QRCodeProps) {
  const matrix = useMemo(() => generateQRMatrix(value, level), [value, level]);

  if (!matrix) {
    return (
      <div className={cx("rideos-qrcode", "is-overflow", className)} style={{ width: size, height: size, ...style }}>
        内容过长
      </div>
    );
  }

  const total = matrix.size + margin * 2;
  let path = "";
  matrix.modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x + margin},${y + margin}h1v1h-1z`;
    });
  });

  return (
    <div className={cx("rideos-qrcode", className)} style={{ width: size, height: size, ...style }}>
      <svg
        viewBox={`0 0 ${total} ${total}`}
        width={size}
        height={size}
        role="img"
        aria-label="二维码"
        shapeRendering="crispEdges"
      >
        <rect width={total} height={total} fill={bgColor} />
        <path d={path} fill={color} />
      </svg>
      {expired && (
        <div className="rideos-qrcode-mask">
          <span>二维码已过期</span>
          {onRefresh && (
            <button type="button" onClick={onRefresh}>
              点击刷新
            </button>
          )}
        </div>
      )}
    </div>
  );
}
