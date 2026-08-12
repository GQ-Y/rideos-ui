import { describe, expect, it } from "vitest";
import { formatValue, niceScale, seriesExtent, valueToY } from "../internal/scale";

describe("niceScale", () => {
  it("生成覆盖数据范围的 nice 刻度", () => {
    const scale = niceScale(0, 97);
    expect(scale.min).toBeLessThanOrEqual(0);
    expect(scale.max).toBeGreaterThanOrEqual(97);
    expect(scale.ticks.length).toBeGreaterThanOrEqual(3);
    expect(scale.ticks[0]).toBe(scale.min);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(scale.max);
  });

  it("处理 min === max 与全零", () => {
    expect(niceScale(5, 5).min).toBe(0);
    const zero = niceScale(0, 0);
    expect(zero.max).toBeGreaterThan(zero.min);
  });

  it("处理负值范围", () => {
    const scale = niceScale(-40, 80);
    expect(scale.min).toBeLessThanOrEqual(-40);
    expect(scale.max).toBeGreaterThanOrEqual(80);
  });
});

describe("valueToY", () => {
  it("最大值在顶部,最小值在底部", () => {
    const scale = { min: 0, max: 100, ticks: [0, 50, 100] };
    expect(valueToY(100, scale, 10, 200)).toBe(10);
    expect(valueToY(0, scale, 10, 200)).toBe(210);
  });
});

describe("seriesExtent", () => {
  it("非堆叠取全局极值,null 忽略", () => {
    const [min, max] = seriesExtent(
      [{ data: [1, null, 5] }, { data: [-2, 3, null] }],
      false,
    );
    expect(min).toBe(-2);
    expect(max).toBe(5);
  });

  it("堆叠按类目正负分别累加", () => {
    const [min, max] = seriesExtent([{ data: [10, -5] }, { data: [20, -15] }], true);
    expect(max).toBe(30);
    expect(min).toBe(-20);
  });
});

describe("formatValue", () => {
  it("千分位与小数", () => {
    expect(formatValue(12345)).toBe("12,345");
    expect(formatValue(3.14159)).toBe("3.14");
  });
});
