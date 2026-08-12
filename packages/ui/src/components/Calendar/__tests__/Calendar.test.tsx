import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "../Calendar";

describe("Calendar", () => {
  it("渲染当月并选择日期", () => {
    const onSelect = vi.fn();
    render(<Calendar defaultValue="2026-08-12" onSelect={onSelect} />);
    expect(screen.getByText("2026 年 8 月")).toBeInTheDocument();
    fireEvent.click(screen.getByText("15"));
    expect(onSelect).toHaveBeenCalledWith("2026-08-15");
  });

  it("面板翻月与回到今天", () => {
    const onPanelChange = vi.fn();
    render(<Calendar defaultValue="2026-08-12" onPanelChange={onPanelChange} />);
    fireEvent.click(screen.getByRole("button", { name: "下一月" }));
    expect(onPanelChange).toHaveBeenCalledWith(2026, 9);
    expect(screen.getByText("2026 年 9 月")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "上一年" }));
    expect(screen.getByText("2025 年 9 月")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "今天" }));
    const now = new Date();
    expect(screen.getByText(`${now.getFullYear()} 年 ${now.getMonth() + 1} 月`)).toBeInTheDocument();
  });

  it("dateCellRender 渲染自定义内容", () => {
    render(
      <Calendar
        defaultValue="2026-08-12"
        dateCellRender={(date) => (date === "2026-08-20" ? "发版日" : null)}
      />,
    );
    expect(screen.getByText("发版日")).toBeInTheDocument();
  });
});
