import { AIChat, PageCard, PageHeader } from "@rideos-ai/ui";
import { useMockChat } from "../mockChat";

export function AIChatPage() {
  const { messages, send, stop } = useMockChat([
    {
      id: "welcome",
      role: "assistant",
      content: "你好,我是 RideOS 智能助手,可以帮你查询运营数据、解答平台使用问题。",
      time: "09:00",
    },
  ]);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "AI 对话"]}
        title="AI 对话组件 AIChat"
        description="支持流式输出、打字指示、失败重试、快捷问题、代码块渲染;本页为模拟回复,实际接入时把 onSend 换成你的 LLM 接口即可。"
      />
      <PageCard>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <AIChat
            title="RideOS 智能助手"
            subtitle="演示环境 · 模拟流式回复"
            messages={messages}
            onSend={send}
            onStop={stop}
            height={560}
            suggestions={["如何退款?", "围栏怎么配置?", "如何接入组件库?"]}
          />
        </div>
      </PageCard>
    </>
  );
}
