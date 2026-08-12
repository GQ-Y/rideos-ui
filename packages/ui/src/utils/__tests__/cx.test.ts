import { describe, expect, it } from "vitest";
import { cx } from "../cx";

describe("cx", () => {
  it("合并并过滤假值", () => {
    expect(cx("a", false, null, undefined, "b")).toBe("a b");
  });

  it("支持嵌套数组", () => {
    expect(cx("a", ["b", [false, "c"]])).toBe("a b c");
  });

  it("保留数字 0 以外的数字", () => {
    expect(cx(1, "x")).toBe("1 x");
  });
});
