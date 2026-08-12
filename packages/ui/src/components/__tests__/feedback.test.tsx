import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "../Alert";
import { message } from "../Message";
import { Result } from "../Result";
import { Spin } from "../Spin";

describe("Alert", () => {
  it("渲染四种语义与描述", () => {
    render(<Alert type="warning" message="磁盘空间不足" description="请及时清理历史日志" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("type-warning");
    expect(screen.getByText("请及时清理历史日志")).toBeInTheDocument();
  });

  it("可关闭并回调", () => {
    const onClose = vi.fn();
    render(<Alert message="通知" closable onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("Spin", () => {
  it("包裹内容时渲染遮罩,spinning=false 隐藏", () => {
    const { container, rerender } = render(
      <Spin spinning tip="加载中...">
        <p>内容</p>
      </Spin>,
    );
    expect(container.querySelector(".rideos-spin-mask")).toBeTruthy();
    expect(screen.getByText("加载中...")).toBeInTheDocument();
    rerender(
      <Spin spinning={false}>
        <p>内容</p>
      </Spin>,
    );
    expect(container.querySelector(".rideos-spin-mask")).toBeNull();
  });
});

describe("Result", () => {
  it("success 渲染图标,404 渲染错误码", () => {
    const { rerender, container } = render(<Result status="success" title="提交成功" />);
    expect(container.querySelector(".rideos-result-icon")).toBeTruthy();
    rerender(<Result status="404" title="页面不存在" subTitle="请检查地址" />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("请检查地址")).toBeInTheDocument();
  });
});

describe("message", () => {
  it("命令式弹出全局提示", async () => {
    message.success("操作成功");
    expect(await screen.findByText("操作成功")).toBeInTheDocument();
    message.error("操作失败");
    expect(await screen.findByText("操作失败")).toBeInTheDocument();
  });
});
