import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cx } from "../../utils/cx";

export type AIChatRole = "user" | "assistant";

export type AIChatStatus = "pending" | "streaming" | "done" | "error";

export interface AIChatMessage {
  id: string;
  role: AIChatRole;
  content: string;
  /**
   * pending:等待回复(打字点动画)
   * streaming:流式输出中(闪烁光标)
   * error:回复失败(可重试)
   */
  status?: AIChatStatus;
  /** 时间文案,如 "14:32" */
  time?: string;
}

export interface AIChatProps {
  /** 消息列表(受控) */
  messages: AIChatMessage[];
  /** 发送消息(输入框回车 / 发送按钮 / 点击快捷问题) */
  onSend?: (content: string) => void;
  /** 流式输出时点击停止 */
  onStop?: () => void;
  /** error 消息点击重试 */
  onRetry?: (message: AIChatMessage) => void;
  /** 禁用输入区 */
  disabled?: boolean;
  /** 头部标题,默认 "AI 助手" */
  title?: ReactNode;
  /** 头部副标题 */
  subtitle?: ReactNode;
  /** 是否显示头部,默认 true */
  showHeader?: boolean;
  /** 头部右侧操作区 */
  headerExtra?: ReactNode;
  /** 输入框占位文案 */
  placeholder?: string;
  /** 快捷问题(点击即发送) */
  suggestions?: string[];
  /** 无消息时的欢迎占位 */
  emptyContent?: ReactNode;
  /** 自定义头像 */
  avatars?: { user?: ReactNode; assistant?: ReactNode };
  /** 组件高度,默认 480;放入弹层可用 "100%" */
  height?: number | string;
  /** 自定义消息内容渲染(覆盖内置的文本/代码块渲染) */
  renderContent?: (message: AIChatMessage) => ReactNode;
  className?: string;
}

/* ---------------- 内置轻量文本渲染:支持 ```代码块``` 与 `行内代码` ---------------- */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /`([^`\n]+)`/g;
  let cursor = 0;
  let match = pattern.exec(text);
  let part = 0;
  while (match) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(<code key={`${keyPrefix}-c${part}`}>{match[1]}</code>);
    cursor = match.index + match[0].length;
    part += 1;
    match = pattern.exec(text);
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function renderMessageText(content: string): ReactNode {
  const blocks = content.split("```");
  return blocks.map((block, index) => {
    if (index % 2 === 1) {
      /* 奇数段是代码块,首行若为语言标记则去掉 */
      const lines = block.split("\n");
      const code =
        lines.length > 1 && /^[\w-]*$/.test(lines[0].trim()) ? lines.slice(1).join("\n") : block;
      return (
        <pre key={`b${index}`} className="rideos-aichat-code">
          {code.replace(/\n$/, "")}
        </pre>
      );
    }
    if (!block) return null;
    return <span key={`b${index}`}>{renderInline(block, `b${index}`)}</span>;
  });
}

/* ---------------- 默认头像(内联 SVG,无图标库依赖) ---------------- */

function AssistantAvatar() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M12 2a1 1 0 0 1 1 1v1.06A8 8 0 0 1 20 12v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a8 8 0 0 1 7-7.94V3a1 1 0 0 1 1-1Zm-3.5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  );
}

function UserAvatar() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 11c4.42 0 8 2.24 8 5v2H4v-2c0-2.76 3.58-5 8-5Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M3.4 20.3 21.2 12 3.4 3.7a.7.7 0 0 0-.97.83L4.5 12l-2.07 7.47a.7.7 0 0 0 .97.83ZM6.2 13l11-1-11-1-1.1-4.03L18.6 12 5.1 17.03 6.2 13Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

/**
 * AI 对话组件:消息流 + 输入区
 * 支持流式输出光标、等待动画、失败重试、快捷问题、代码块渲染;
 * 常与 FloatWidget 组合成右下角智能客服。
 */
export function AIChat({
  messages,
  onSend,
  onStop,
  onRetry,
  disabled = false,
  title = "AI 助手",
  subtitle,
  showHeader = true,
  headerExtra,
  placeholder = "请输入问题,Enter 发送,Shift+Enter 换行",
  suggestions,
  emptyContent,
  avatars,
  height = 480,
  renderContent,
  className,
}: AIChatProps) {
  const [draft, setDraft] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const busy = messages.some((m) => m.status === "pending" || m.status === "streaming");
  const canSend = !disabled && !busy && draft.trim().length > 0;

  /* 新消息 / 流式增量时,若用户未上滚则吸底 */
  useEffect(() => {
    const body = bodyRef.current;
    if (body && stickToBottomRef.current) {
      body.scrollTop = body.scrollHeight;
    }
  }, [messages]);

  function handleBodyScroll() {
    const body = bodyRef.current;
    if (!body) return;
    stickToBottomRef.current = body.scrollHeight - body.scrollTop - body.clientHeight < 48;
  }

  function send(content: string) {
    const text = content.trim();
    if (!text || disabled || busy) return;
    stickToBottomRef.current = true;
    onSend?.(text);
    setDraft("");
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = "auto";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(draft);
    }
  }

  function autosize() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(120, textarea.scrollHeight)}px`;
  }

  return (
    <div className={cx("rideos-aichat", className)} style={{ height }}>
      {showHeader ? (
        <div className="rideos-aichat-header">
          <span className="rideos-aichat-header-avatar">
            {avatars?.assistant ?? <AssistantAvatar />}
          </span>
          <div className="rideos-aichat-header-main">
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </div>
          {headerExtra ? <div className="rideos-aichat-header-extra">{headerExtra}</div> : null}
        </div>
      ) : null}

      <div className="rideos-aichat-body" ref={bodyRef} onScroll={handleBodyScroll} role="log">
        {messages.length === 0 && emptyContent ? (
          <div className="rideos-aichat-empty">{emptyContent}</div>
        ) : null}
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={cx(
                "rideos-aichat-msg",
                isUser ? "is-user" : "is-assistant",
                message.status === "error" && "is-error",
              )}
            >
              <span className="rideos-aichat-avatar">
                {isUser ? (avatars?.user ?? <UserAvatar />) : (avatars?.assistant ?? <AssistantAvatar />)}
              </span>
              <div className="rideos-aichat-bubble-wrap">
                <div className="rideos-aichat-bubble">
                  {message.status === "pending" ? (
                    <span className="rideos-aichat-typing" aria-label="正在输入">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <>
                      {renderContent ? renderContent(message) : renderMessageText(message.content)}
                      {message.status === "streaming" ? (
                        <span className="rideos-aichat-caret" aria-hidden />
                      ) : null}
                    </>
                  )}
                </div>
                {message.status === "error" ? (
                  <div className="rideos-aichat-meta">
                    <span className="rideos-aichat-error-text">回复失败</span>
                    {onRetry ? (
                      <button
                        type="button"
                        className="rideos-aichat-retry"
                        onClick={() => onRetry(message)}
                      >
                        重试
                      </button>
                    ) : null}
                  </div>
                ) : message.time ? (
                  <div className="rideos-aichat-meta">{message.time}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {suggestions && suggestions.length > 0 ? (
        <div className="rideos-aichat-suggestions">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="rideos-aichat-suggestion"
              disabled={disabled || busy}
              onClick={() => send(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rideos-aichat-input-bar">
        <textarea
          ref={textareaRef}
          className="rideos-aichat-input"
          rows={1}
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            setDraft(event.target.value);
            autosize();
          }}
          onKeyDown={handleKeyDown}
        />
        {busy && onStop ? (
          <button
            type="button"
            className="rideos-aichat-send is-stop"
            onClick={onStop}
            aria-label="停止生成"
          >
            <StopIcon />
          </button>
        ) : (
          <button
            type="button"
            className="rideos-aichat-send"
            disabled={!canSend}
            onClick={() => send(draft)}
            aria-label="发送"
          >
            <SendIcon />
          </button>
        )}
      </div>
    </div>
  );
}
