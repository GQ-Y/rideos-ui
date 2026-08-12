export interface PathPoint {
  x: number;
  y: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * 由点序列生成折线/平滑曲线路径。
 * smooth 使用 Catmull-Rom 转三次贝塞尔(张力 1/6),曲线严格过数据点。
 */
export function linePath(points: PathPoint[], smooth: boolean): string {
  if (points.length === 0) return "";
  if (!smooth || points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)},${round(p.y)}`).join(" ");
  }
  let d = `M${round(points[0].x)},${round(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const prev = points[i - 1] ?? points[i];
    const curr = points[i];
    const next = points[i + 1];
    const after = points[i + 2] ?? next;
    const cp1x = curr.x + (next.x - prev.x) / 6;
    const cp1y = curr.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (after.x - curr.x) / 6;
    const cp2y = next.y - (after.y - curr.y) / 6;
    d += ` C${round(cp1x)},${round(cp1y)} ${round(cp2x)},${round(cp2y)} ${round(next.x)},${round(next.y)}`;
  }
  return d;
}

/** 折线 + 底边闭合,用于面积填充 */
export function areaPath(points: PathPoint[], baselineY: number, smooth: boolean): string {
  if (points.length === 0) return "";
  const line = linePath(points, smooth);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L${round(last.x)},${round(baselineY)} L${round(first.x)},${round(baselineY)} Z`;
}
