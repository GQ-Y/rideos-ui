import { useState } from "react";
import type { ReactNode } from "react";
import { RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface CollapseItem {
  key: string;
  /** 面板标题 */
  label: ReactNode;
  /** 面板内容 */
  children?: ReactNode;
  disabled?: boolean;
}

export interface CollapseProps {
  items: CollapseItem[];
  /** 受控展开面板 key 列表 */
  activeKeys?: string[];
  /** 非受控默认展开面板 key 列表 */
  defaultActiveKeys?: string[];
  onChange?: (keys: string[]) => void;
  /** 手风琴模式:同时最多展开一个面板 */
  accordion?: boolean;
  className?: string;
}

/**
 * 折叠面板:可展开/收起的内容分组,支持手风琴模式
 */
export function Collapse({
  items,
  activeKeys: activeKeysProp,
  defaultActiveKeys = [],
  onChange,
  accordion = false,
  className,
}: CollapseProps) {
  const [innerKeys, setInnerKeys] = useState<string[]>(defaultActiveKeys);
  const activeKeys = activeKeysProp ?? innerKeys;

  function toggle(key: string) {
    const open = activeKeys.includes(key);
    const next = accordion
      ? open
        ? []
        : [key]
      : open
        ? activeKeys.filter((item) => item !== key)
        : [...activeKeys, key];
    if (activeKeysProp === undefined) setInnerKeys(next);
    onChange?.(next);
  }

  return (
    <div className={cx("rideos-collapse", className)}>
      {items.map((item) => {
        const open = activeKeys.includes(item.key);
        return (
          <div
            key={item.key}
            className={cx(
              "rideos-collapse-panel",
              open && "is-open",
              item.disabled && "is-disabled",
            )}
          >
            <button
              type="button"
              className="rideos-collapse-header"
              aria-expanded={open}
              disabled={item.disabled}
              onClick={() => toggle(item.key)}
            >
              <RightOutlined className="rideos-collapse-arrow" />
              <span className="rideos-collapse-label">{item.label}</span>
            </button>
            {open && <div className="rideos-collapse-body">{item.children}</div>}
          </div>
        );
      })}
    </div>
  );
}
