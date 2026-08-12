import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "../Breadcrumb";
import { Collapse } from "../Collapse";
import { InputTag } from "../InputTag";
import { Statistic } from "../Statistic";

describe("Statistic", () => {
  it("数字千分位与精度", () => {
    render(<Statistic title="总里程" value={1234567.891} precision={1} suffix="km" />);
    expect(screen.getByText("总里程")).toBeInTheDocument();
    expect(screen.getByText("1,234,567.9")).toBeInTheDocument();
    expect(screen.getByText("km")).toBeInTheDocument();
  });

  it("字符串值原样展示,prefix 与 valueStyle", () => {
    const { container } = render(
      <Statistic value="离线" prefix="¥" valueStyle={{ color: "rgb(254, 80, 66)" }} />,
    );
    expect(screen.getByText("离线")).toBeInTheDocument();
    expect(screen.getByText("¥")).toBeInTheDocument();
    expect(
      (container.querySelector(".rideos-statistic-value") as HTMLElement).style.color,
    ).toBe("rgb(254, 80, 66)");
  });

  it("自定义与关闭千分位", () => {
    const { rerender } = render(<Statistic value={9876543} groupSeparator=" " />);
    expect(screen.getByText("9 876 543")).toBeInTheDocument();
    rerender(<Statistic value={9876543} groupSeparator="" />);
    expect(screen.getByText("9876543")).toBeInTheDocument();
  });
});

describe("Breadcrumb", () => {
  it("渲染层级与默认分隔符,最后一项为当前页", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "首页", path: "/" },
          { label: "车辆管理", path: "/vehicles" },
          { label: "详情" },
        ]}
      />,
    );
    const seps = container.querySelectorAll(".rideos-breadcrumb-sep");
    expect(seps).toHaveLength(2);
    expect(seps[0]).toHaveTextContent("/");
    const current = screen.getByText("详情");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.closest("a")).toBeNull();
    expect(screen.getByText("首页").closest("a")).toHaveAttribute("href", "/");
  });

  it("onClick 项与自定义分隔符", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Breadcrumb items={[{ label: "运营中心", onClick }, { label: "报表" }]} separator=">" />,
    );
    expect(container.querySelector(".rideos-breadcrumb-sep")).toHaveTextContent(">");
    fireEvent.click(screen.getByText("运营中心"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Collapse", () => {
  const items = [
    { key: "a", label: "基础信息", children: <p>车辆基础信息</p> },
    { key: "b", label: "运营配置", children: <p>运营配置内容</p> },
  ];

  it("非受控:默认展开与点击切换", () => {
    const onChange = vi.fn();
    render(<Collapse items={items} defaultActiveKeys={["a"]} onChange={onChange} />);
    expect(screen.getByText("车辆基础信息")).toBeInTheDocument();
    expect(screen.queryByText("运营配置内容")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /运营配置/ }));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    expect(screen.getByText("运营配置内容")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /基础信息/ }));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    expect(screen.queryByText("车辆基础信息")).not.toBeInTheDocument();
  });

  it("accordion 互斥展开", () => {
    const { container } = render(<Collapse items={items} accordion defaultActiveKeys={["a"]} />);
    fireEvent.click(screen.getByRole("button", { name: /运营配置/ }));
    expect(screen.getByText("运营配置内容")).toBeInTheDocument();
    expect(screen.queryByText("车辆基础信息")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".rideos-collapse-panel.is-open")).toHaveLength(1);
  });

  it("受控与禁用面板", () => {
    const onChange = vi.fn();
    render(
      <Collapse
        items={[
          ...items,
          { key: "c", label: "高级设置", children: <p>高级内容</p>, disabled: true },
        ]}
        activeKeys={["a"]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /高级设置/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /运营配置/ }));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    expect(screen.queryByText("运营配置内容")).not.toBeInTheDocument();
  });
});

describe("InputTag", () => {
  it("回车/逗号生成标签", () => {
    const onChange = vi.fn();
    const { container } = render(<InputTag onChange={onChange} placeholder="输入标签" />);
    const input = screen.getByPlaceholderText("输入标签") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "电动" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["电动"]);
    expect(screen.getByText("电动")).toBeInTheDocument();
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "巡航" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenLastCalledWith(["电动", "巡航"]);
    expect(container.querySelectorAll(".rideos-tag")).toHaveLength(2);
  });

  it("Backspace 删除末尾;受控模式外部值不变", () => {
    const onChange = vi.fn();
    const { container } = render(<InputTag value={["早高峰", "晚高峰"]} onChange={onChange} />);
    const input = container.querySelector(".rideos-inputtag-input") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["早高峰"]);
    expect(container.querySelectorAll(".rideos-tag")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "关闭标签" })[0]);
    expect(onChange).toHaveBeenLastCalledWith(["晚高峰"]);
  });

  it("max 上限与去重,disabled 不可编辑", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <InputTag defaultValue={["A"]} max={2} onChange={onChange} />,
    );
    const input = container.querySelector(".rideos-inputtag-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "A" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "B" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["A", "B"]);
    fireEvent.change(input, { target: { value: "C" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<InputTag defaultValue={["A"]} max={2} onChange={onChange} disabled />);
    expect(input).toBeDisabled();
    expect(screen.queryByRole("button", { name: "关闭标签" })).toBeNull();
  });
});
