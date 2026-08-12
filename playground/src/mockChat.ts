import { useEffect, useRef, useState } from "react";
import type { AIChatMessage } from "@rideos/ui";

let seed = 0;
const nextId = () => `msg-${Date.now()}-${(seed += 1)}`;

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function pickReply(question: string): string {
  if (question.includes("退款")) {
    return "退款流程:进入「订单中心 → 退款审核」,选中订单后点击「发起退款」。\n审核通过后 1-3 个工作日原路退回。\n\n如需批量退款,可以使用列表页的批量操作。";
  }
  if (question.includes("围栏")) {
    return "电子围栏在「系统设置 → 围栏管理」中维护,支持多边形绘制、启停与生效时段配置。绘制完成后记得点击「保存」。";
  }
  if (question.includes("接入") || question.includes("安装")) {
    return "接入很简单:\n```bash\npnpm add @rideos/ui @rideos/charts\n```\n然后在入口引入样式:\n```js\nimport \"@rideos/ui/styles.css\";\nimport \"@rideos/charts/styles.css\";\n```\n即可按需导入组件使用。";
  }
  return `已收到你的问题:「${question}」。\n这是演示环境的模拟回复,展示 AIChat 的流式输出效果。你可以试试问「如何退款」「围栏怎么配置」或「如何接入组件库」。`;
}

/** 模拟流式回复的对话状态(仅演示用) */
export function useMockChat(initial: AIChatMessage[] = []) {
  const [messages, setMessages] = useState<AIChatMessage[]>(initial);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    },
    [],
  );

  function send(content: string) {
    const replyId = nextId();
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", content, time: now() },
      { id: replyId, role: "assistant", content: "", status: "pending" },
    ]);

    const reply = pickReply(content);
    const startTimer = setTimeout(() => {
      let cursor = 0;
      const tick = () => {
        cursor += 3;
        const done = cursor >= reply.length;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyId
              ? {
                  ...m,
                  content: reply.slice(0, cursor),
                  status: done ? "done" : "streaming",
                  time: done ? now() : undefined,
                }
              : m,
          ),
        );
        if (!done) {
          timersRef.current.push(setTimeout(tick, 28));
        }
      };
      tick();
    }, 650);
    timersRef.current.push(startTimer);
  }

  function stop() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setMessages((prev) =>
      prev.map((m) =>
        m.status === "pending" || m.status === "streaming"
          ? { ...m, status: "done", content: m.content || "(已停止)", time: now() }
          : m,
      ),
    );
  }

  return { messages, send, stop };
}
