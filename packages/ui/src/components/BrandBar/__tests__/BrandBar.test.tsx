import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrandBar } from "../BrandBar";
import type { BrandBarNotification } from "../BrandBar";

describe("BrandBar", () => {
  it("日期钮:提供 onDateChange 后点开月历并选择日期", () => {
    const onDateChange = vi.fn();
    render(
      <BrandBar dateLabel="2026-08-12 周三" dateValue="2026-08-12" onDateChange={onDateChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "业务日期" }));
    expect(screen.getByRole("dialog", { name: "选择业务日期" })).toBeInTheDocument();
    expect(screen.getByText("2026 年 8 月")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    expect(onDateChange).toHaveBeenCalledWith("2026-08-15");
  });

  it("月历支持翻月与回到今天", () => {
    const onDateChange = vi.fn();
    render(<BrandBar dateValue="2026-08-12" onDateChange={onDateChange} />);
    fireEvent.click(screen.getByRole("button", { name: "业务日期" }));
    fireEvent.click(screen.getByRole("button", { name: "上一月" }));
    expect(screen.getByText("2026 年 7 月")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "回到今天" }));
    expect(onDateChange).toHaveBeenCalled();
  });

  it("不提供 onDateChange 时日期钮为静态展示", () => {
    render(<BrandBar dateLabel="2026-08-12 周三" />);
    fireEvent.click(screen.getByRole("button", { name: "业务日期" }));
    expect(screen.queryByRole("dialog", { name: "选择业务日期" })).not.toBeInTheDocument();
  });

  it("消息面板:未读角标、点击单条、全部已读", () => {
    const notifications: BrandBarNotification[] = [
      { id: "a", title: "告警一", read: false },
      { id: "b", title: "通知二", read: true },
    ];
    const onItemClick = vi.fn();
    const onMarkAllRead = vi.fn();
    render(
      <BrandBar
        notifications={notifications}
        onNotificationItemClick={onItemClick}
        onMarkAllRead={onMarkAllRead}
      />,
    );
    const bell = screen.getByRole("button", { name: "消息通知,1 条未读" });
    fireEvent.click(bell);
    fireEvent.click(screen.getByText("告警一"));
    expect(onItemClick).toHaveBeenCalledWith(notifications[0]);
    fireEvent.click(bell);
    fireEvent.click(screen.getByText("全部已读"));
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it("用户菜单:提供 onUserMenuClick 时点开默认菜单", () => {
    const onUserMenuClick = vi.fn();
    render(<BrandBar onUserMenuClick={onUserMenuClick} />);
    fireEvent.click(screen.getByRole("button", { name: "用户菜单" }));
    fireEvent.click(screen.getByText("退出登录"));
    expect(onUserMenuClick).toHaveBeenCalledWith("logout");
  });

  it("兼容旧用法:无菜单配置时点击用户区走 onUserClick", () => {
    const onUserClick = vi.fn();
    render(<BrandBar onUserClick={onUserClick} />);
    fireEvent.click(screen.getByRole("button", { name: "用户菜单" }));
    expect(onUserClick).toHaveBeenCalled();
  });
});
