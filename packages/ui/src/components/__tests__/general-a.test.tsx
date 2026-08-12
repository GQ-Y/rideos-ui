import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Link } from "../Link";
import { Segmented } from "../Segmented";
import { Space } from "../Space";
import { Paragraph, Text, Title } from "../Typography";

describe("Link", () => {
  it("渲染 a 与 href/target", () => {
    render(
      <Link href="/vehicles" target="_blank">
        查看车辆
      </Link>,
    );
    const link = screen.getByRole("link", { name: "查看车辆" });
    expect(link).toHaveAttribute("href", "/vehicles");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveClass("rideos-link");
  });

  it("无 href 时仍渲染 a 并可点击", () => {
    const onClick = vi.fn();
    render(<Link onClick={onClick}>删除</Link>);
    const link = screen.getByRole("link", { name: "删除" });
    expect(link.tagName).toBe("A");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 灰置且阻止点击", () => {
    const onClick = vi.fn();
    render(
      <Link href="/x" onClick={onClick} disabled danger>
        危险操作
      </Link>,
    );
    const link = screen.getByRole("link", { name: "危险操作" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveClass("is-disabled", "is-danger");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Space", () => {
  it("默认与预设尺寸/方向映射", () => {
    const { container, rerender } = render(
      <Space>
        <span>甲</span>
        <span>乙</span>
      </Space>,
    );
    const space = container.querySelector(".rideos-space") as HTMLElement;
    expect(space.style.gap).toBe("12px");
    expect(space).toHaveClass("is-horizontal");
    rerender(
      <Space size="small" direction="vertical">
        <span>甲</span>
        <span>乙</span>
      </Space>,
    );
    expect(space.style.gap).toBe("8px");
    expect(space).toHaveClass("is-vertical");
  });

  it("数字尺寸、换行与对齐", () => {
    const { container } = render(
      <Space size={20} wrap align="start">
        <span>甲</span>
      </Space>,
    );
    const space = container.querySelector(".rideos-space") as HTMLElement;
    expect(space.style.gap).toBe("20px");
    expect(space.style.alignItems).toBe("flex-start");
    expect(space).toHaveClass("is-wrap");
  });
});

describe("Typography", () => {
  it("Title 按 level 渲染 h1-h5", () => {
    render(
      <>
        <Title>一级标题</Title>
        <Title level={3}>三级标题</Title>
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "一级标题" })).toBeInTheDocument();
    const h3 = screen.getByRole("heading", { level: 3, name: "三级标题" });
    expect(h3).toHaveClass("rideos-typo-title", "level-3");
  });

  it("Text 语义色与修饰", () => {
    const { container } = render(
      <Text type="danger" strong code delete underline>
        FE-102
      </Text>,
    );
    const text = container.querySelector(".rideos-typo-text") as HTMLElement;
    expect(text).toHaveClass("type-danger");
    expect(text.querySelector("strong")).toBeTruthy();
    expect(text.querySelector("u")).toBeTruthy();
    expect(text.querySelector("del")).toBeTruthy();
    expect(text.querySelector("code.rideos-typo-code")).toHaveTextContent("FE-102");
  });

  it("Paragraph 多行省略", () => {
    const { container } = render(
      <Paragraph ellipsis={{ rows: 2 }}>这是一段很长的运营说明文案,用于验证多行省略。</Paragraph>,
    );
    expect(container.querySelector(".rideos-typo-paragraph")).toHaveClass("is-ellipsis");
    const content = container.querySelector(".rideos-typo-paragraph-content") as HTMLElement;
    expect(content.style.getPropertyValue("--rideos-typo-clamp")).toBe("2");
  });

  it("Paragraph copyable 复制并短暂显示已复制", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<Paragraph copyable>车辆编号 A-102</Paragraph>);
    fireEvent.click(screen.getByRole("button", { name: "复制" }));
    expect(writeText).toHaveBeenCalledWith("车辆编号 A-102");
    expect(await screen.findByText("已复制")).toBeInTheDocument();
  });
});

describe("Segmented", () => {
  it("非受控:默认选中第一项,点击切换", () => {
    const onChange = vi.fn();
    render(<Segmented options={["日", "周", "月"]} onChange={onChange} />);
    const day = screen.getByRole("radio", { name: "日" });
    expect(day).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "周" }));
    expect(onChange).toHaveBeenCalledWith("周");
    expect(screen.getByRole("radio", { name: "周" })).toHaveAttribute("aria-checked", "true");
    expect(day).toHaveAttribute("aria-checked", "false");
  });

  it("受控:外部不更新则选中不变", () => {
    const onChange = vi.fn();
    render(<Segmented options={["日", "周"]} value="日" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "周" }));
    expect(onChange).toHaveBeenCalledWith("周");
    expect(screen.getByRole("radio", { name: "日" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "周" })).toHaveAttribute("aria-checked", "false");
  });

  it("禁用项不可选,size/block 类名", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Segmented
        options={[
          { label: "全部", value: "all" },
          { label: "维护中", value: "fix", disabled: true },
        ]}
        size="small"
        block
        onChange={onChange}
      />,
    );
    expect(container.querySelector(".rideos-segmented")).toHaveClass("is-small", "is-block");
    fireEvent.click(screen.getByRole("radio", { name: "维护中" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
