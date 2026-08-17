import { act, createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "../RichTextEditor";
import type { RichTextEditorHandle } from "../RichTextEditor";

describe("RichTextEditor", () => {
  it("载入 HTML、完整工具栏和字符统计", async () => {
    render(
      <RichTextEditor
        aria-label="公告内容"
        defaultValue="<h2>运营公告</h2><p>今日车辆调度正常</p>"
        maxCharacters={200}
      />,
    );

    const editor = await screen.findByRole("textbox", { name: "公告内容" });
    expect(editor).toHaveAttribute("contenteditable", "true");
    expect(screen.getByText("运营公告")).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "富文本工具栏" })).toBeInTheDocument();
    expect(screen.getByText(/个字符/)).toBeInTheDocument();
  });

  it("受控 value 变化时同步编辑器内容", async () => {
    const { rerender } = render(<RichTextEditor value="<p>初始内容</p>" onChange={() => undefined} />);
    await screen.findByText("初始内容");

    rerender(<RichTextEditor value="<p>外部更新内容</p>" onChange={() => undefined} />);

    await waitFor(() => expect(screen.getByText("外部更新内容")).toBeInTheDocument());
    expect(screen.queryByText("初始内容")).not.toBeInTheDocument();
  });

  it("通过 ref 设置、读取和清空内容", async () => {
    const ref = createRef<RichTextEditorHandle>();
    render(<RichTextEditor ref={ref} />);
    await screen.findByRole("textbox", { name: "富文本编辑器" });

    act(() => ref.current?.setContent("<p>通过 ref 写入</p>"));
    await screen.findByText("通过 ref 写入");
    expect(ref.current?.getText()).toBe("通过 ref 写入");
    expect(ref.current?.getHTML()).toContain("通过 ref 写入");

    act(() => ref.current?.clear());
    await waitFor(() => expect(ref.current?.getText()).toBe(""));
  });

  it("插入表格并通过 onChange 输出 HTML", async () => {
    const onChange = vi.fn();
    const { container } = render(<RichTextEditor onChange={onChange} />);
    await screen.findByRole("textbox", { name: "富文本编辑器" });

    fireEvent.click(screen.getByRole("button", { name: "插入 3×3 表格" }));

    await waitFor(() => expect(container.querySelector("table")).toBeInTheDocument());
    expect(screen.getByRole("toolbar", { name: "表格工具栏" })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(
      expect.stringContaining("<table"),
      expect.objectContaining({ isEmpty: false }),
    );
  });

  it("插入安全图片 URL 并拒绝危险链接协议", async () => {
    const { container } = render(<RichTextEditor />);
    await screen.findByRole("textbox", { name: "富文本编辑器" });

    fireEvent.click(screen.getByRole("button", { name: "插入图片" }));
    fireEvent.change(screen.getByRole("textbox", { name: "图片地址" }), {
      target: { value: "https://example.com/car.png" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "图片说明" }), {
      target: { value: "车辆" },
    });
    fireEvent.click(screen.getByRole("button", { name: "插入 URL" }));

    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/car.png"),
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "车辆");

    fireEvent.click(screen.getByRole("button", { name: "添加或编辑链接" }));
    fireEvent.change(screen.getByRole("textbox", { name: "链接地址" }), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "应用链接" }));
    expect(screen.getByText(/请输入 http/)).toBeInTheDocument();
  });

  it("只读模式隐藏工具栏并关闭 contenteditable", async () => {
    render(<RichTextEditor readOnly value="<p>只读预览</p>" />);
    const editor = await screen.findByRole("textbox", { name: "富文本编辑器" });
    expect(editor).toHaveAttribute("contenteditable", "false");
    expect(screen.queryByRole("toolbar", { name: "富文本工具栏" })).not.toBeInTheDocument();
    expect(screen.getByText("只读预览")).toBeInTheDocument();
  });
});
