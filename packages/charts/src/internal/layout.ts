export interface ChartBox {
  left: number;
  top: number;
  innerWidth: number;
  innerHeight: number;
}

/** 计算绘图区:左侧留 Y 轴标签宽度,底部留 X 轴标签高度 */
export function computeBox(width: number, height: number, yLabels: string[]): ChartBox {
  const maxLabelLength = yLabels.reduce((max, label) => Math.max(max, label.length), 0);
  const left = Math.max(32, maxLabelLength * 7 + 12);
  const right = 16;
  const top = 12;
  const bottom = 26;
  return {
    left,
    top,
    innerWidth: Math.max(0, width - left - right),
    innerHeight: Math.max(0, height - top - bottom),
  };
}

/** X 轴标签抽稀:返回应显示标签的下标步长 */
export function xLabelStep(count: number, innerWidth: number): number {
  if (count <= 1 || innerWidth <= 0) return 1;
  const maxLabels = Math.max(2, Math.floor(innerWidth / 64));
  return Math.max(1, Math.ceil(count / maxLabels));
}
