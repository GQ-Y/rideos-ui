import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Divider } from "../Divider";
import { Empty } from "../Empty";
import { Progress } from "../Progress";
import { Steps } from "../Steps";
import { Tag } from "../Tag";

describe("Tag", () => {
  it("语义色与可关闭", () => {
    const onClose = vi.fn();
    render(
      <Tag tone="success" closable onClose={onClose}>
        运营中
      </Tag>,
    );
    expect(screen.getByText("运营中")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "关闭标签" }));
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText("运营中")).not.toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("数字角标与 max 上限", () => {
    render(
      <Badge count={120} max={99}>
        <span>消息</span>
      </Badge>,
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("count=0 默认隐藏,dot 模式显示圆点", () => {
    const { container, rerender } = render(
      <Badge count={0}>
        <span>消息</span>
      </Badge>,
    );
    expect(container.querySelector(".rideos-badge-sup")).toBeNull();
    rerender(
      <Badge dot>
        <span>消息</span>
      </Badge>,
    );
    expect(container.querySelector(".rideos-badge-sup.is-dot")).toBeTruthy();
  });
});

describe("Empty / Avatar / Divider", () => {
  it("Empty 渲染描述与操作", () => {
    render(
      <Empty description="还没有围栏">
        <button type="button">去创建</button>
      </Empty>,
    );
    expect(screen.getByText("还没有围栏")).toBeInTheDocument();
    expect(screen.getByText("去创建")).toBeInTheDocument();
  });

  it("Avatar 文字头像截取两字", () => {
    render(<Avatar text="王建国" />);
    expect(screen.getByText("王建")).toBeInTheDocument();
  });

  it("Divider 水平带文案与垂直", () => {
    const { container } = render(
      <>
        <Divider>分组</Divider>
        <Divider direction="vertical" />
      </>,
    );
    expect(screen.getByText("分组")).toBeInTheDocument();
    expect(container.querySelector(".rideos-divider-vertical")).toBeTruthy();
  });
});

describe("Progress", () => {
  it("线形进度与状态", () => {
    const { container, rerender } = render(<Progress percent={45} />);
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(
      (container.querySelector(".rideos-progress-bar") as HTMLElement).style.width,
    ).toBe("45%");
    rerender(<Progress percent={80} status="exception" />);
    expect(container.querySelector(".status-exception")).toBeTruthy();
  });

  it("环形进度", () => {
    const { container } = render(<Progress percent={60} type="circle" />);
    expect(container.querySelector(".rideos-progress-circle-bar")).toBeTruthy();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });
});

describe("Steps", () => {
  it("完成/进行中/等待状态与点击回退", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Steps
        items={[{ title: "验证身份" }, { title: "设置密码" }, { title: "完成" }]}
        current={1}
        onChange={onChange}
      />,
    );
    expect(container.querySelectorAll(".rideos-step.is-finish")).toHaveLength(1);
    expect(container.querySelectorAll(".rideos-step.is-process")).toHaveLength(1);
    fireEvent.click(screen.getByText("验证身份"));
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
