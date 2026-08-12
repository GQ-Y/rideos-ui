import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface TitleProps {
  /** 标题级别 1-5,对应 h1-h5,默认 1 */
  level?: 1 | 2 | 3 | 4 | 5;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 标题:h1-h5 五级标题排版
 */
export function Title({ level = 1, children, className, style }: TitleProps) {
  const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5";
  return (
    <HeadingTag className={cx("rideos-typo-title", `level-${level}`, className)} style={style}>
      {children}
    </HeadingTag>
  );
}

export type TextType = "secondary" | "success" | "warning" | "danger";

export interface TextProps {
  /** 语义类型(次要/成功/警告/危险) */
  type?: TextType;
  /** 加粗 */
  strong?: boolean;
  /** 行内代码样式 */
  code?: boolean;
  /** 删除线 */
  delete?: boolean;
  /** 下划线 */
  underline?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 文本:行内文本,支持语义色与加粗/代码/删除线/下划线修饰
 */
export function Text({
  type,
  strong = false,
  code = false,
  delete: deleted = false,
  underline = false,
  children,
  className,
  style,
}: TextProps) {
  let content: ReactNode = children;
  if (code) content = <code className="rideos-typo-code">{content}</code>;
  if (deleted) content = <del>{content}</del>;
  if (underline) content = <u>{content}</u>;
  if (strong) content = <strong>{content}</strong>;

  return (
    <span className={cx("rideos-typo-text", type && `type-${type}`, className)} style={style}>
      {content}
    </span>
  );
}

export interface ParagraphProps {
  /** 省略:true 为单行,{ rows } 指定行数(-webkit-line-clamp 实现) */
  ellipsis?: boolean | { rows: number };
  /** 可复制:点击按钮复制纯文本到剪贴板,并短暂显示"已复制" */
  copyable?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 段落:块级文本,支持多行省略与一键复制
 */
export function Paragraph({
  ellipsis = false,
  copyable = false,
  children,
  className,
  style,
}: ParagraphProps) {
  const contentRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const rows = typeof ellipsis === "object" ? ellipsis.rows : ellipsis ? 1 : 0;

  async function copy() {
    if (!navigator.clipboard?.writeText) return;
    const text = contentRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪贴板不可用时静默忽略 */
    }
  }

  return (
    <p className={cx("rideos-typo-paragraph", rows > 0 && "is-ellipsis", className)} style={style}>
      <span
        ref={contentRef}
        className="rideos-typo-paragraph-content"
        style={rows > 0 ? ({ "--rideos-typo-clamp": rows } as CSSProperties) : undefined}
      >
        {children}
      </span>
      {copyable && (
        <button
          type="button"
          className={cx("rideos-typo-copy", copied && "is-copied")}
          aria-label="复制"
          onClick={copy}
        >
          {copied ? (
            <>
              <CheckOutlined /> 已复制
            </>
          ) : (
            <CopyOutlined />
          )}
        </button>
      )}
    </p>
  );
}
