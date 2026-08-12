import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { Avatar } from "../Avatar";

export interface MentionOption {
  /** 插入文本(@ 后的标识) */
  value: string;
  /** 展示名,缺省用 value */
  label?: ReactNode;
  /** 次要说明(部门/工号) */
  desc?: ReactNode;
}

export interface MentionProps {
  /** 受控值 */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 候选人员/实体 */
  options: MentionOption[];
  /** 触发字符,默认 @ */
  prefix?: string;
  /** 选中提及项 */
  onSelect?: (option: MentionOption) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/** 解析光标前的 @查询词;不在提及态返回 null */
function getMentionQuery(text: string, caret: number, prefix: string): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const index = before.lastIndexOf(prefix);
  if (index < 0) return null;
  /* 前缀前必须是行首或空白 */
  if (index > 0 && !/\s/.test(before[index - 1])) return null;
  const query = before.slice(index + prefix.length);
  /* 查询词内不允许空白(出现空白视为放弃提及) */
  if (/\s/.test(query)) return null;
  return { start: index, query };
}

/**
 * 提及:文本域中输入 @ 触发人员候选,选中后插入 @名称
 */
export function Mention({
  value: valueProp,
  defaultValue = "",
  onChange,
  options,
  prefix = "@",
  onSelect,
  placeholder,
  rows = 3,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: MentionProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = valueProp ?? innerValue;
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popupStyle = useFloatingPosition(wrapRef, mention != null, {
    placement: "bottom-start",
    offset: 4,
    matchWidth: true,
  });

  useDismiss(mention != null, [wrapRef, popupRef], () => setMention(null));

  const matched = mention
    ? options.filter((option) =>
        option.value.toLowerCase().includes(mention.query.toLowerCase()),
      )
    : [];

  function update(next: string) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function refreshMention() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const state = getMentionQuery(textarea.value, textarea.selectionStart ?? 0, prefix);
    setMention(state);
    setActiveIndex(0);
  }

  function insert(option: MentionOption) {
    const textarea = textareaRef.current;
    if (!textarea || !mention) return;
    const caret = textarea.selectionStart ?? value.length;
    const inserted = `${prefix}${option.value} `;
    const next = value.slice(0, mention.start) + inserted + value.slice(caret);
    update(next);
    onSelect?.(option);
    setMention(null);
    /* 恢复焦点并把光标移到插入内容之后 */
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = mention.start + inserted.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  return (
    <>
      <div ref={wrapRef} className={cx("rideos-mention", className)} style={style}>
        <textarea
          ref={textareaRef}
          className="rideos-textarea"
          rows={rows}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) => {
            update(event.target.value);
            requestAnimationFrame(refreshMention);
          }}
          onClick={refreshMention}
          onKeyDown={(event) => {
            if (!mention || matched.length === 0) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const step = event.key === "ArrowDown" ? 1 : -1;
              setActiveIndex((prev) => (prev + step + matched.length) % matched.length);
            } else if (event.key === "Enter") {
              event.preventDefault();
              insert(matched[activeIndex]);
            } else if (event.key === "Escape") {
              setMention(null);
            }
          }}
        />
      </div>
      {mention && matched.length > 0 && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-select-popup rideos-mention-popup" role="listbox" style={popupStyle}>
              {matched.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cx("rideos-select-option", index === activeIndex && "is-active")}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    insert(option);
                  }}
                >
                  <span className="rideos-mention-option">
                    <Avatar text={String(option.value)} size={22} />
                    <span className="rideos-mention-option-main">
                      <strong>{option.label ?? option.value}</strong>
                      {option.desc && <small>{option.desc}</small>}
                    </span>
                  </span>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
