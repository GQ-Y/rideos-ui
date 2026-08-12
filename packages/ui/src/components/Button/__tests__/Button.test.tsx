import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("渲染默认按钮", () => {
    render(<Button>确定</Button>);
    const button = screen.getByRole("button", { name: "确定" });
    expect(button).toHaveClass("rideos-btn");
    expect(button).not.toHaveClass("rideos-btn-primary");
    expect(button).toHaveAttribute("type", "button");
  });

  it("primary 变体追加类名", () => {
    render(<Button variant="primary">提交</Button>);
    expect(screen.getByRole("button")).toHaveClass("rideos-btn-primary");
  });

  it("点击回调与禁用", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        禁用
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
