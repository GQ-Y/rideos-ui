import { describe, expect, it } from "vitest";
import { arcPath } from "../internal/arc";
import { areaPath, linePath } from "../internal/path";

const pts = [
  { x: 0, y: 100 },
  { x: 50, y: 20 },
  { x: 100, y: 60 },
];

describe("linePath", () => {
  it("折线输出 M/L 指令", () => {
    expect(linePath(pts, false)).toBe("M0,100 L50,20 L100,60");
  });

  it("平滑曲线输出贝塞尔指令且过所有数据点", () => {
    const d = linePath(pts, true);
    expect(d.startsWith("M0,100")).toBe(true);
    expect(d).toContain("C");
    expect(d).toContain("100,60");
  });

  it("空数据返回空串", () => {
    expect(linePath([], false)).toBe("");
  });
});

describe("areaPath", () => {
  it("闭合到基线", () => {
    const d = areaPath(pts, 120, false);
    expect(d.endsWith("L100,120 L0,120 Z")).toBe(true);
  });
});

describe("arcPath", () => {
  it("实心扇形从圆心出发", () => {
    const d = arcPath(100, 100, 80, 0, 0, 90);
    expect(d.startsWith("M100,100")).toBe(true);
    expect(d).toContain("A80,80");
  });

  it("环形包含内外两段圆弧", () => {
    const d = arcPath(100, 100, 80, 50, 0, 180);
    expect(d).toContain("A80,80");
    expect(d).toContain("A50,50");
  });
});
