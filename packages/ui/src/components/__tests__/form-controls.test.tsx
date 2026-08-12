import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputNumber } from "../InputNumber";
import { RadioGroup } from "../Radio";
import { Switch } from "../Switch";

describe("RadioGroup", () => {
  it("选择回调与禁用项", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        options={["上海", { label: "杭州", value: "hz", disabled: true }]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("上海"));
    expect(onChange).toHaveBeenCalledWith("上海");
    fireEvent.click(screen.getByText("杭州"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("按钮样式选中态", () => {
    const { container } = render(
      <RadioGroup options={["A", "B"]} defaultValue="B" optionType="button" />,
    );
    const checked = container.querySelector(".rideos-radio.is-checked");
    expect(checked).toHaveTextContent("B");
  });
});

describe("Switch", () => {
  it("切换与受控", () => {
    const onChange = vi.fn();
    render(<Switch defaultChecked={false} onChange={onChange} aria-label="sw" />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "false");
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("loading 阻止切换", () => {
    const onChange = vi.fn();
    render(<Switch loading onChange={onChange} aria-label="sw" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("InputNumber", () => {
  it("步进按钮增减并受 min/max 约束", () => {
    const onChange = vi.fn();
    render(<InputNumber defaultValue={9} min={0} max={10} onChange={onChange} aria-label="n" />);
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(screen.getByRole("button", { name: "增加" })).toBeDisabled();
  });

  it("失焦解析文本并 clamp", () => {
    const onChange = vi.fn();
    render(<InputNumber min={0} max={100} onChange={onChange} aria-label="n" />);
    const input = screen.getByLabelText("n");
    fireEvent.change(input, { target: { value: "250" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(100);
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("键盘上下箭头步进", () => {
    const onChange = vi.fn();
    render(<InputNumber defaultValue={5} step={5} onChange={onChange} aria-label="n" />);
    fireEvent.keyDown(screen.getByLabelText("n"), { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
