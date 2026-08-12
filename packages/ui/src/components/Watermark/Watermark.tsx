import { useMemo, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

const noopSubscribe = () => () => {};

/** SSR 安全的挂载检测:服务端 false,客户端 true */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export interface WatermarkProps {
  /** 水印文案,传数组时按多行绘制 */
  content: string | string[];
  /** 旋转角度(度),默认 -22 */
  rotate?: number;
  /** 平铺间距 [水平, 垂直](px),默认 [100, 100] */
  gap?: [number, number];
  /** 字号(px),默认 14 */
  fontSize?: number;
  /** 字色,默认半透明中性灰(明暗主题下均可见) */
  color?: string;
  /** 水印层 z-index,默认 9 */
  zIndex?: number;
  /** 被水印覆盖的内容 */
  children?: ReactNode;
  className?: string;
}

interface WatermarkTile {
  /** 单个图块的 dataURL */
  url: string;
  /** 图块 CSS 宽度(px) */
  width: number;
  /** 图块 CSS 高度(px) */
  height: number;
}

/** 离屏 canvas 绘制单个水印图块(按 devicePixelRatio 放大),非浏览器环境或取不到 2d 上下文时返回 null */
function renderTile(
  lines: string[],
  rotate: number,
  gapX: number,
  gapY: number,
  fontSize: number,
  color: string,
): WatermarkTile | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const ratio = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
  const font = `${fontSize}px sans-serif`;
  const lineHeight = Math.ceil(fontSize * 1.5);

  ctx.font = font;
  const textWidth = Math.max(1, ...lines.map((line) => ctx.measureText(line).width));
  const textHeight = lineHeight * Math.max(1, lines.length);

  /* 旋转后的外接矩形,再加平铺间距,得到图块尺寸 */
  const radian = (rotate * Math.PI) / 180;
  const rotatedWidth = Math.abs(textWidth * Math.cos(radian)) + Math.abs(textHeight * Math.sin(radian));
  const rotatedHeight = Math.abs(textWidth * Math.sin(radian)) + Math.abs(textHeight * Math.cos(radian));
  const width = Math.ceil(rotatedWidth) + gapX;
  const height = Math.ceil(rotatedHeight) + gapY;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.translate(width / 2, height / 2);
  ctx.rotate(radian);
  /* 修改 canvas 尺寸会重置绘制状态,需重新设置字体 */
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, (index - (lines.length - 1) / 2) * lineHeight);
  });

  return { url: canvas.toDataURL(), width, height };
}

/**
 * 水印:canvas 离屏生成平铺图块,作为绝对定位覆盖层平铺在内容之上
 * 覆盖层 pointer-events: none,不影响内容交互;SSR 下只渲染内容不绘制水印。
 */
export function Watermark({
  content,
  rotate = -22,
  gap = [100, 100],
  fontSize = 14,
  color = "rgba(128, 128, 128, 0.12)",
  zIndex = 9,
  children,
  className,
}: WatermarkProps) {
  const mounted = useMounted();
  const contentKey = Array.isArray(content) ? content.join("\n") : content;
  const [gapX, gapY] = gap;

  const tile = useMemo<WatermarkTile | null>(
    () =>
      mounted ? renderTile(contentKey.split("\n"), rotate, gapX, gapY, fontSize, color) : null,
    [mounted, contentKey, rotate, gapX, gapY, fontSize, color],
  );

  const layerStyle: CSSProperties | undefined = tile
    ? {
        zIndex,
        backgroundImage: `url("${tile.url}")`,
        backgroundSize: `${tile.width}px ${tile.height}px`,
      }
    : undefined;

  return (
    <div className={cx("rideos-watermark", className)}>
      {children}
      {tile && <div className="rideos-watermark-layer" aria-hidden="true" style={layerStyle} />}
    </div>
  );
}
