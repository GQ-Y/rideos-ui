export interface TickScale {
  min: number;
  max: number;
  ticks: number[];
}

/** 取"漂亮"的步长(1/2/5 x 10^n) */
function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

/** 根据数据范围生成 nice 刻度 */
export function niceScale(minValue: number, maxValue: number, tickCount = 5): TickScale {
  let min = Number.isFinite(minValue) ? minValue : 0;
  let max = Number.isFinite(maxValue) ? maxValue : 0;
  if (min > max) [min, max] = [max, min];
  if (min === max) {
    if (max === 0) max = 1;
    else if (max > 0) min = 0;
    else max = 0;
  }
  const step = niceNum(niceNum(max - min, false) / Math.max(1, tickCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const decimals = Math.max(0, -Math.floor(Math.log10(step))) + 2;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(Number(v.toFixed(decimals)));
  }
  return { min: niceMin, max: niceMax, ticks };
}

/** 数值映射到 Y 坐标(SVG 向下为正) */
export function valueToY(value: number, scale: TickScale, top: number, innerHeight: number): number {
  const span = scale.max - scale.min || 1;
  const ratio = (value - scale.min) / span;
  return top + innerHeight - ratio * innerHeight;
}

/** 默认数值格式化:千分位,最多 2 位小数 */
export function formatValue(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** 汇总系列的数值范围;stacked 时按类目正负分别累加 */
export function seriesExtent(
  series: Array<{ data: Array<number | null> }>,
  stacked: boolean,
): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  if (stacked) {
    const length = Math.max(0, ...series.map((s) => s.data.length));
    for (let i = 0; i < length; i += 1) {
      let pos = 0;
      let neg = 0;
      for (const s of series) {
        const v = s.data[i];
        if (v == null) continue;
        if (v >= 0) pos += v;
        else neg += v;
      }
      max = Math.max(max, pos);
      min = Math.min(min, neg);
    }
  } else {
    for (const s of series) {
      for (const v of s.data) {
        if (v == null) continue;
        max = Math.max(max, v);
        min = Math.min(min, v);
      }
    }
  }
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;
  return [min, max];
}
