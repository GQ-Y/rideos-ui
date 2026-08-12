import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../Checkbox";

describe("Checkbox", () => {
  it("非受控切换", () => {
    render(<Checkbox>记住我</Checkbox>);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.checked).toBe(false);
    fireEvent.click(input);
    expect(input.checked).toBe(true);
  });

  it("受控模式回调", () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange}>
        协议
      </Checkbox>,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });

  it("禁用态不可切换", () => {
    const onChange = vi.fn();
    render(
      <Checkbox disabled onChange={onChange}>
        禁用
      </Checkbox>,
    );
    fireEvent.click(screen.getByText("禁用"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
