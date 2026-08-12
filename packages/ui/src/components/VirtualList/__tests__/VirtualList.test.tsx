import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VirtualList } from "../VirtualList";

const DATA = Array.from({ length: 10000 }, (_, i) => `第 ${i} 行`);

describe("VirtualList", () => {
  it("只渲染可视区附近的行", () => {
    const { container } = render(
      <VirtualList data={DATA} itemHeight={32} height={320} renderItem={(item) => item} />,
    );
    const rendered = container.querySelectorAll(".rideos-virtual-list-item");
    expect(rendered.length).toBeLessThan(30);
    expect(screen.getByText("第 0 行")).toBeInTheDocument();
    expect(screen.queryByText("第 5000 行")).not.toBeInTheDocument();
  });

  it("滚动后渲染对应区间", () => {
    const { container } = render(
      <VirtualList data={DATA} itemHeight={32} height={320} renderItem={(item) => item} />,
    );
    const scroller = container.querySelector(".rideos-virtual-list") as HTMLElement;
    fireEvent.scroll(scroller, { target: { scrollTop: 5000 * 32 } });
    expect(screen.getByText("第 5000 行")).toBeInTheDocument();
    expect(screen.queryByText("第 0 行")).not.toBeInTheDocument();
  });

  it("空数据渲染占位", () => {
    render(
      <VirtualList data={[]} itemHeight={32} height={320} renderItem={(item) => String(item)} />,
    );
    expect(screen.getByText("暂无数据")).toBeInTheDocument();
  });
});
