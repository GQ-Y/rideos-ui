export interface PolarPoint {
  x: number;
  y: number;
}

/** 极坐标转直角坐标;angle 以 12 点方向为 0°,顺时针 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): PolarPoint {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * 扇形/环形切片路径。innerRadius 为 0 时是实心扇形。
 * 跨度不允许 >= 360,调用方需先钳到 359.99。
 */
export function arcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const round = (n: number) => Math.round(n * 100) / 100;
  const so = polarToCartesian(cx, cy, outerRadius, startAngle);
  const eo = polarToCartesian(cx, cy, outerRadius, endAngle);
  if (innerRadius <= 0) {
    return [
      `M${round(cx)},${round(cy)}`,
      `L${round(so.x)},${round(so.y)}`,
      `A${outerRadius},${outerRadius} 0 ${largeArc} 1 ${round(eo.x)},${round(eo.y)}`,
      "Z",
    ].join(" ");
  }
  const si = polarToCartesian(cx, cy, innerRadius, endAngle);
  const ei = polarToCartesian(cx, cy, innerRadius, startAngle);
  return [
    `M${round(so.x)},${round(so.y)}`,
    `A${outerRadius},${outerRadius} 0 ${largeArc} 1 ${round(eo.x)},${round(eo.y)}`,
    `L${round(si.x)},${round(si.y)}`,
    `A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${round(ei.x)},${round(ei.y)}`,
    "Z",
  ].join(" ");
}
