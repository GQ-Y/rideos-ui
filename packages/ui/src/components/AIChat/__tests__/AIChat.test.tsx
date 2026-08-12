import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AIChat } from "../AIChat";
import type { AIChatMessage } from "../AIChat";

const baseMessages: AIChatMessage[] = [
  { id: "1", role: "user", content: "你好" },
  { id: "2", role: "assistant", content: "你好,有什么可以帮你?" },
];

describe("AIChat", () => {
  it("渲染消息与标题", () => {
    render(<AIChat messages={baseMessages} title="智能客服" />);
    expect(screen.getByText("智能客服")).toBeInTheDocument();
    expect(screen.getByText("你好")).toBeInTheDocument();
    expect(screen.getByText("你好,有什么可以帮你?")).toBeInTheDocument();
  });

  it("输入后点击发送触发 onSend 并清空输入框", () => {
    const onSend = vi.fn();
    render(<AIChat messages={baseMessages} onSend={onSend} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "查询订单" } });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));
    expect(onSend).toHaveBeenCalledWith("查询订单");
    expect(textarea).toHaveValue("");
  });

  it("Enter 发送,空内容不发送", () => {
    const onSend = vi.fn();
    render(<AIChat messages={baseMessages} onSend={onSend} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.change(textarea, { target: { value: "  hi  " } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("hi");
  });

  it("pending 状态显示打字动画并禁止发送", () => {
    const onSend = vi.fn();
    render(
      <AIChat
        messages={[...baseMessages, { id: "3", role: "assistant", content: "", status: "pending" }]}
        onSend={onSend}
      />,
    );
    expect(screen.getByLabelText("正在输入")).toBeInTheDocument();
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "追问" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("streaming 状态显示停止按钮", () => {
    const onStop = vi.fn();
    render(
      <AIChat
        messages={[
          ...baseMessages,
          { id: "3", role: "assistant", content: "正在生成", status: "streaming" },
        ]}
        onStop={onStop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "停止生成" }));
    expect(onStop).toHaveBeenCalled();
  });

  it("error 消息可重试", () => {
    const onRetry = vi.fn();
    const errorMessage: AIChatMessage = {
      id: "3",
      role: "assistant",
      content: "",
      status: "error",
    };
    render(<AIChat messages={[...baseMessages, errorMessage]} onRetry={onRetry} />);
    fireEvent.click(screen.getByText("重试"));
    expect(onRetry).toHaveBeenCalledWith(errorMessage);
  });

  it("点击快捷问题直接发送", () => {
    const onSend = vi.fn();
    render(<AIChat messages={[]} suggestions={["如何退款?"]} onSend={onSend} />);
    fireEvent.click(screen.getByText("如何退款?"));
    expect(onSend).toHaveBeenCalledWith("如何退款?");
  });

  it("渲染代码块", () => {
    render(
      <AIChat
        messages={[{ id: "1", role: "assistant", content: "示例:\n```js\nconsole.log(1)\n```" }]}
      />,
    );
    expect(screen.getByText("console.log(1)")).toBeInTheDocument();
  });
});
