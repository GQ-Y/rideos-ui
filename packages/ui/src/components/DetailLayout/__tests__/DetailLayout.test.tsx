import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DetailLayout } from "../DetailLayout";

describe("DetailLayout", () => {
  it("渲染标题/状态/摘要", () => {
    render(
      <DetailLayout
        title="沪AD·10086"
        status="运营中"
        summary={[{ label: "车型", value: "秦PLUS EV" }]}
      >
        内容
      </DetailLayout>,
    );
    expect(screen.getByText("沪AD·10086")).toBeInTheDocument();
    expect(screen.getByText("运营中")).toBeInTheDocument();
    expect(screen.getByText("秦PLUS EV")).toBeInTheDocument();
  });

  it("asideLinks 渲染结构化链接并可点击", () => {
    const onClick = vi.fn();
    render(
      <DetailLayout
        title="t"
        asideLinks={[{ key: "a", label: "查看行程订单", desc: "今日 23 单", onClick }]}
      >
        内容
      </DetailLayout>,
    );
    expect(screen.getByText("相关链接")).toBeInTheDocument();
    expect(screen.getByText("今日 23 单")).toBeInTheDocument();
    fireEvent.click(screen.getByText("查看行程订单"));
    expect(onClick).toHaveBeenCalled();
  });

  it("无 aside 与 asideLinks 时不渲染右侧栏", () => {
    const { container } = render(<DetailLayout title="t">内容</DetailLayout>);
    expect(container.querySelector(".rideos-detail-aside")).toBeNull();
    expect(container.querySelector(".with-aside")).toBeNull();
  });

  it("自定义 aside 内容仍然支持", () => {
    render(
      <DetailLayout title="t" aside={<p>自定义侧栏</p>}>
        内容
      </DetailLayout>,
    );
    expect(screen.getByText("自定义侧栏")).toBeInTheDocument();
  });

  it("返回钮触发 onBack,不传则不渲染", () => {
    const onBack = vi.fn();
    const { rerender } = render(
      <DetailLayout title="t" onBack={onBack}>
        内容
      </DetailLayout>,
    );
    fireEvent.click(screen.getByRole("button", { name: "返回列表" }));
    expect(onBack).toHaveBeenCalled();
    rerender(<DetailLayout title="t">内容</DetailLayout>);
    expect(screen.queryByRole("button", { name: "返回列表" })).not.toBeInTheDocument();
  });
});
