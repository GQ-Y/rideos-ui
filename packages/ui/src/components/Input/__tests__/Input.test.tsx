import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../Input";

describe("Input", () => {
  it("受控输入,onChange 值在前", () => {
    const onChange = vi.fn();
    render(<Input value="abc" onChange={onChange} placeholder="输入" />);
    const input = screen.getByPlaceholderText("输入");
    fireEvent.change(input, { target: { value: "abcd" } });
    expect(onChange).toHaveBeenCalledWith("abcd", expect.anything());
  });

  it("非受控:defaultValue 与清空按钮", () => {
    render(<Input defaultValue="hello" allowClear aria-label="kw" />);
    const input = screen.getByLabelText("kw") as HTMLInputElement;
    expect(input.value).toBe("hello");
    fireEvent.click(screen.getByRole("button", { name: "清空" }));
    expect(input.value).toBe("");
  });

  it("onPressEnter 回调", () => {
    const onPressEnter = vi.fn();
    render(<Input onPressEnter={onPressEnter} placeholder="p" />);
    fireEvent.keyDown(screen.getByPlaceholderText("p"), { key: "Enter" });
    expect(onPressEnter).toHaveBeenCalled();
  });

  it("禁用态不显示清空", () => {
    render(<Input value="x" disabled allowClear />);
    expect(screen.queryByRole("button", { name: "清空" })).not.toBeInTheDocument();
  });

  it("渲染前后缀", () => {
    render(<Input prefix="¥" suffix="元" />);
    expect(screen.getByText("¥")).toBeInTheDocument();
    expect(screen.getByText("元")).toBeInTheDocument();
  });
});
