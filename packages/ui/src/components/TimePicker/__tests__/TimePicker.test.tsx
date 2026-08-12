import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "../TimePicker";

describe("TimePicker", () => {
  it("显示占位并点开三列面板", () => {
    render(<TimePicker placeholder="选择时间" />);
    expect(screen.getByText("选择时间")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "选择时间" }));
    expect(screen.getByRole("listbox", { name: "时" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "分" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "秒" })).toBeInTheDocument();
  });

  it("点选小时触发 onChange", () => {
    const onChange = vi.fn();
    render(<TimePicker defaultValue="08:30:00" onChange={onChange} aria-label="tp" />);
    fireEvent.click(screen.getByRole("button", { name: "tp" }));
    const hourCol = screen.getByRole("listbox", { name: "时" });
    fireEvent.click(hourCol.querySelectorAll("button")[10]);
    expect(onChange).toHaveBeenCalledWith("10:30:00");
  });

  it("showSeconds=false 输出 HH:mm", () => {
    const onChange = vi.fn();
    render(<TimePicker showSeconds={false} onChange={onChange} aria-label="tp" />);
    fireEvent.click(screen.getByRole("button", { name: "tp" }));
    expect(screen.queryByRole("listbox", { name: "秒" })).not.toBeInTheDocument();
    const minCol = screen.getByRole("listbox", { name: "分" });
    fireEvent.click(minCol.querySelectorAll("button")[5]);
    expect(onChange).toHaveBeenCalledWith("00:05");
  });

  it("清空按钮回传 null", () => {
    const onChange = vi.fn();
    render(<TimePicker defaultValue="12:00:00" allowClear onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "清空" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
