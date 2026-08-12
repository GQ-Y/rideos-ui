import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FloatWidget } from "../FloatWidget";

describe("FloatWidget", () => {
  it("默认收起,点击触发钮展开面板", () => {
    render(
      <FloatWidget panelTitle="在线客服">
        <p>面板内容</p>
      </FloatWidget>,
    );
    expect(screen.queryByText("面板内容")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "打开浮窗" }));
    expect(screen.getByText("面板内容")).toBeInTheDocument();
    expect(screen.getByText("在线客服")).toBeInTheDocument();
  });

  it("头部关闭按钮收起面板并触发 onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(
      <FloatWidget defaultOpen panelTitle="客服" onOpenChange={onOpenChange}>
        <p>内容</p>
      </FloatWidget>,
    );
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("内容")).not.toBeInTheDocument();
  });

  it("Esc 关闭", () => {
    render(
      <FloatWidget defaultOpen>
        <p>内容</p>
      </FloatWidget>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("内容")).not.toBeInTheDocument();
  });

  it("受控模式不自行切换", () => {
    const onOpenChange = vi.fn();
    render(
      <FloatWidget open={false} onOpenChange={onOpenChange}>
        <p>内容</p>
      </FloatWidget>,
    );
    fireEvent.click(screen.getByRole("button", { name: "打开浮窗" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("内容")).not.toBeInTheDocument();
  });

  it("显示角标,超过 99 显示 99+", () => {
    render(<FloatWidget badge={120} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("四角定位类名", () => {
    render(<FloatWidget position="top-left" />);
    expect(document.querySelector(".rideos-float-widget.pos-top-left")).toBeTruthy();
  });
});
