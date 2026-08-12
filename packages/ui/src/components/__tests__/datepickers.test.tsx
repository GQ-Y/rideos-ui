import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, DateRangePicker } from "../DatePicker";

describe("DatePicker", () => {
  it("打开面板并选择日期", () => {
    const onChange = vi.fn();
    render(<DatePicker defaultValue="2026-08-12" onChange={onChange} aria-label="dp" />);
    fireEvent.click(screen.getByRole("button", { name: "dp" }));
    expect(screen.getByText("2026 年 8 月")).toBeInTheDocument();
    const panel = document.querySelector(".rideos-datepicker-popup") as HTMLElement;
    fireEvent.click(within(panel).getByText("20"));
    expect(onChange).toHaveBeenCalledWith("2026-08-20");
    expect(screen.queryByText("2026 年 8 月")).not.toBeInTheDocument();
  });

  it("今天快捷与清空", () => {
    const onChange = vi.fn();
    render(<DatePicker defaultValue="2026-08-12" allowClear onChange={onChange} aria-label="dp" />);
    fireEvent.click(screen.getByRole("button", { name: "dp" }));
    fireEvent.click(screen.getByText("今天"));
    expect(onChange).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "清空" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("翻月导航", () => {
    render(<DatePicker defaultValue="2026-08-12" aria-label="dp" />);
    fireEvent.click(screen.getByRole("button", { name: "dp" }));
    fireEvent.click(screen.getByRole("button", { name: "上一月" }));
    expect(screen.getByText("2026 年 7 月")).toBeInTheDocument();
  });
});

describe("DateRangePicker", () => {
  it("依次点选起止,自动排序", () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultValue={["2026-08-10", "2026-08-12"]}
        onChange={onChange}
        aria-label="range"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "range" }));
    const panel = document.querySelector(".rideos-datepicker-popup") as HTMLElement;
    /* 先点 20,再点 15,应自动排序为 [15, 20] */
    fireEvent.click(within(panel).getByText("20"));
    expect(screen.getByText("请选择结束日期")).toBeInTheDocument();
    fireEvent.click(within(panel).getByText("15"));
    expect(onChange).toHaveBeenCalledWith(["2026-08-15", "2026-08-20"]);
  });

  it("清空", () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultValue={["2026-08-01", "2026-08-05"]}
        allowClear
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "清空" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
