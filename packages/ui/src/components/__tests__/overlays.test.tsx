import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "../Dropdown";
import { Popconfirm } from "../Popconfirm";
import { Popover } from "../Popover";
import { Tooltip } from "../Tooltip";

describe("Tooltip", () => {
  it("悬停显示,移出隐藏", () => {
    render(
      <Tooltip title="提示文案">
        <button type="button">触发器</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByText("触发器"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("提示文案");
    fireEvent.mouseLeave(screen.getByText("触发器"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});

describe("Popover", () => {
  it("click 触发展开,点击外部关闭", () => {
    render(
      <Popover title="标题" content="气泡内容" trigger="click">
        <button type="button">打开</button>
      </Popover>,
    );
    fireEvent.click(screen.getByText("打开"));
    expect(screen.getByText("气泡内容")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("气泡内容")).not.toBeInTheDocument();
  });
});

describe("Popconfirm", () => {
  it("确认与取消回调", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Popconfirm title="确认停用?" onConfirm={onConfirm} onCancel={onCancel}>
        <button type="button">停用</button>
      </Popconfirm>,
    );
    fireEvent.click(screen.getByText("停用"));
    fireEvent.click(screen.getByText("确定"));
    expect(onConfirm).toHaveBeenCalled();
    fireEvent.click(screen.getByText("停用"));
    fireEvent.click(screen.getByText("取消"));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("Dropdown", () => {
  it("点击展开菜单并选择", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown
        items={[
          { key: "edit", label: "编辑" },
          { key: "delete", label: "删除", danger: true },
        ]}
        onSelect={onSelect}
      >
        <button type="button">操作</button>
      </Dropdown>,
    );
    fireEvent.click(screen.getByText("操作"));
    fireEvent.click(screen.getByText("删除"));
    expect(onSelect).toHaveBeenCalledWith("delete", expect.objectContaining({ key: "delete" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("禁用项不可选", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown items={[{ key: "a", label: "项A", disabled: true }]} onSelect={onSelect}>
        <button type="button">操作</button>
      </Dropdown>,
    );
    fireEvent.click(screen.getByText("操作"));
    fireEvent.click(screen.getByText("项A"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
