import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../Select";

const OPTIONS = [
  { label: "上海", value: "sh" },
  { label: "杭州", value: "hz" },
  { label: "苏州", value: "sz", disabled: true },
];

describe("Select", () => {
  it("默认显示占位,点击展开选项面板", () => {
    render(<Select options={OPTIONS} placeholder="选择城市" />);
    expect(screen.getByText("选择城市")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("点击选项触发 onChange 并关闭面板", () => {
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("杭州"));
    expect(onChange).toHaveBeenCalledWith("hz", OPTIONS[1]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("杭州")).toBeInTheDocument();
  });

  it("禁用选项不可选", () => {
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("苏州"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("键盘操作:ArrowDown 打开并导航,Enter 选中", () => {
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("sh", OPTIONS[0]);
  });

  it("allowClear 清空选中值", () => {
    const onChange = vi.fn();
    render(<Select options={OPTIONS} defaultValue="sh" allowClear onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "清空" }));
    expect(onChange).toHaveBeenCalledWith(null, null);
    expect(screen.getByText("请选择")).toBeInTheDocument();
  });

  it("受控模式跟随 value", () => {
    const { rerender } = render(<Select options={OPTIONS} value="sh" />);
    expect(screen.getByText("上海")).toBeInTheDocument();
    rerender(<Select options={OPTIONS} value="hz" />);
    expect(screen.getByText("杭州")).toBeInTheDocument();
  });

  it("disabled 不可展开", () => {
    render(<Select options={OPTIONS} disabled />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("字符串选项自动归一化", () => {
    render(<Select options={["A", "B"]} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
