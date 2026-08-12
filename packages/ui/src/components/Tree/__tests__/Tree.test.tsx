import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tree } from "../Tree";
import type { TreeNodeData } from "../Tree";

const DATA: TreeNodeData[] = [
  {
    key: "hq",
    title: "总部",
    children: [
      { key: "ops", title: "运营部" },
      { key: "tech", title: "技术部" },
    ],
  },
  { key: "sh", title: "上海分部" },
];

describe("Tree", () => {
  it("默认收起,展开后显示子节点", () => {
    render(<Tree data={DATA} />);
    expect(screen.queryByText("运营部")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "展开" }));
    expect(screen.getByText("运营部")).toBeInTheDocument();
  });

  it("defaultExpandAll 展开全部并支持选中", () => {
    const onSelect = vi.fn();
    render(<Tree data={DATA} defaultExpandAll onSelect={onSelect} />);
    fireEvent.click(screen.getByText("技术部"));
    expect(onSelect).toHaveBeenCalledWith("tech", expect.objectContaining({ key: "tech" }));
  });

  it("父节点勾选联动全部叶子", () => {
    const onCheck = vi.fn();
    render(<Tree data={DATA} checkable defaultExpandAll onCheck={onCheck} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onCheck).toHaveBeenCalledWith(expect.arrayContaining(["ops", "tech"]));
  });

  it("部分叶子勾选时父节点半选", () => {
    const { container } = render(
      <Tree data={DATA} checkable defaultExpandAll defaultCheckedKeys={["ops"]} />,
    );
    expect(container.querySelector(".rideos-checkbox-box.is-indeterminate")).toBeTruthy();
  });
});
