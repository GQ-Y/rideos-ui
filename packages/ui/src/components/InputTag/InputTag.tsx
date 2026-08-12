import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { cx } from "../../utils/cx";
import { Tag } from "../Tag";

export interface InputTagProps {
  /** 受控标签列表 */
  value?: string[];
  /** 非受控默认标签列表 */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** 标签数量上限,达到后不再生成 */
  max?: number;
  disabled?: boolean;
  /** 允许重复标签,默认 false */
  allowDuplicate?: boolean;
  className?: string;
}

/**
 * 标签输入:回车/逗号生成标签,Backspace 删除最后一个,标签可关闭
 */
export function InputTag({
  value: valueProp,
  defaultValue = [],
  onChange,
  placeholder,
  max,
  disabled = false,
  allowDuplicate = false,
  className,
}: InputTagProps) {
  const [innerValue, setInnerValue] = useState<string[]>(defaultValue);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const value = valueProp ?? innerValue;

  function update(next: string[]) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function commit(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    setText("");
    if (max !== undefined && value.length >= max) return;
    if (!allowDuplicate && value.includes(tag)) return;
    update([...value, tag]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(text);
      return;
    }
    if (event.key === "Backspace" && text === "" && value.length > 0) {
      update(value.slice(0, -1));
    }
  }

  return (
    <div
      className={cx("rideos-inputtag", disabled && "is-disabled", className)}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Tag 关闭后会隐藏自身:用 长度+下标 作 key,列表变化即整体重挂载 */}
      {value.map((tag, index) => (
        <Tag
          key={`${value.length}-${index}`}
          closable={!disabled}
          onClose={() => update(value.filter((_, i) => i !== index))}
        >
          {tag}
        </Tag>
      ))}
      <input
        ref={inputRef}
        className="rideos-inputtag-input"
        value={text}
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
