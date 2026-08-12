import { afterEach, describe, expect, it } from "vitest";
import { getRideosTheme, setRideosTheme, toggleRideosTheme } from "../theme";

afterEach(() => {
  document.documentElement.removeAttribute("data-rideos-theme");
});

describe("theme utils", () => {
  it("默认墨绿", () => {
    expect(getRideosTheme()).toBe("green");
  });

  it("setRideosTheme 设置与移除属性", () => {
    setRideosTheme("dark");
    expect(document.documentElement.getAttribute("data-rideos-theme")).toBe("dark");
    expect(getRideosTheme()).toBe("dark");
    setRideosTheme("light");
    expect(document.documentElement.getAttribute("data-rideos-theme")).toBe("light");
    expect(getRideosTheme()).toBe("light");
    setRideosTheme("green");
    expect(document.documentElement.hasAttribute("data-rideos-theme")).toBe(false);
    expect(getRideosTheme()).toBe("green");
  });

  it("toggleRideosTheme 按 墨绿→浅色→暗色 循环", () => {
    expect(toggleRideosTheme()).toBe("light");
    expect(toggleRideosTheme()).toBe("dark");
    expect(toggleRideosTheme()).toBe("green");
  });

  it("支持指定容器", () => {
    const el = document.createElement("div");
    setRideosTheme("dark", el);
    expect(el.getAttribute("data-rideos-theme")).toBe("dark");
    expect(getRideosTheme(el)).toBe("dark");
  });
});
