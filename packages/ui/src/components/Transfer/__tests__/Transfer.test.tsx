import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Transfer } from "../Transfer";
import type { TransferItem } from "../Transfer";

const DATA: TransferItem[] = [
  {
    key: "city",
    title: "华东大区",
    children: [
      { key: "sh", title: "上海" },
      { key: "hz", title: "杭州" },
    ],
  },
  { key: "bj", title: "北京" },
];

describe("Transfer", () => {
  it("勾选叶子后移入右侧", () => {
    const onChange = vi.fn();
    render(<Transfer data={DATA} onChange={onChange} />);
    fireEvent.click(screen.getByText("上海"));
    /* 点击标题仅选中;勾选走 checkbox */
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByRole("button", { name: "移入右侧" }));
    expect(onChange).toHaveBeenCalledWith(["sh"], "right", ["sh"]);
    /* 右侧面板出现上海 */
    expect(screen.getAllByText("上海")).toHaveLength(1);
  });

  it("右侧勾选后移回左侧", () => {
    const onChange = vi.fn();
    render(<Transfer data={DATA} defaultTargetKeys={["bj"]} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[checkboxes.length - 1]);
    fireEvent.click(screen.getByRole("button", { name: "移回左侧" }));
    expect(onChange).toHaveBeenCalledWith([], "left", ["bj"]);
  });

  it("未勾选时移动按钮禁用", () => {
    render(<Transfer data={DATA} />);
    expect(screen.getByRole("button", { name: "移入右侧" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "移回左侧" })).toBeDisabled();
  });
});
