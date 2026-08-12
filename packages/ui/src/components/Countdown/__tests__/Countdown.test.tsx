import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "../Countdown";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-12T12:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Countdown", () => {
  it("倒计时逐秒递减并触发 onFinish", () => {
    const onFinish = vi.fn();
    render(
      <Countdown deadline={new Date("2026-08-12T12:00:03")} onFinish={onFinish} title="发车倒计时" />,
    );
    expect(screen.getByText("发车倒计时")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("02")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("正计时(since)递增", () => {
    render(<Countdown since={new Date("2026-08-12T11:00:00")} showDays={false} />);
    expect(screen.getByText("01")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("超 24 小时拆出天数", () => {
    render(<Countdown deadline={new Date("2026-08-14T14:00:00")} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("天")).toBeInTheDocument();
  });
});
