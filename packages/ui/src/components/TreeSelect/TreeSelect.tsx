import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseCircleFilled, DownOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { Tree } from "../Tree";
import type { TreeNodeData } from "../Tree";

export interface TreeSelectProps {
  treeData: TreeNodeData[];
  /** 受控选中的节点 key */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (key: string | null, node: TreeNodeData | null) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  /** 面板默认展开全部,默认 true */
  defaultExpandAll?: boolean;
  /** 面板最大高度,默认 280 */
  popupMaxHeight?: number;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

function findNode(nodes: TreeNodeData[], key: string): TreeNodeData | null {
  for (const node of nodes) {
    if (node.key === key) return node;
    const found = node.children ? findNode(node.children, key) : null;
    if (found) return found;
  }
  return null;
}

/**
 * 树选择:下拉面板内嵌 Tree,单选任意节点
 */
export function TreeSelect({
  treeData,
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "请选择",
  disabled = false,
  allowClear = false,
  defaultExpandAll = true,
  popupMaxHeight = 280,
  className,
  style,
  "aria-label": ariaLabel,
}: TreeSelectProps) {
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, {
    placement: "bottom-start",
    offset: 4,
    matchWidth: true,
  });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  const selectedNode = value ? findNode(treeData, value) : null;
  const display: ReactNode = selectedNode ? selectedNode.title : placeholder;

  function commit(key: string | null, node: TreeNodeData | null) {
    if (valueProp === undefined) setInnerValue(key);
    onChange?.(key, node);
  }

  return (
    <>
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="tree"
        aria-disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          "rideos-select",
          "rideos-treeselect",
          open && "is-open",
          disabled && "is-disabled",
          !selectedNode && "is-placeholder",
          className,
        )}
        style={style}
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open && !disabled) setOpen(true);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span className="rideos-select-value">{display}</span>
        {allowClear && selectedNode && !disabled ? (
          <button
            type="button"
            className="rideos-select-clear"
            aria-label="清空"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              commit(null, null);
            }}
          >
            <CloseCircleFilled />
          </button>
        ) : null}
        <DownOutlined className="rideos-select-arrow" aria-hidden="true" />
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              className="rideos-select-popup rideos-treeselect-popup"
              style={{ ...popupStyle, maxHeight: popupMaxHeight }}
            >
              <Tree
                data={treeData}
                defaultExpandAll={defaultExpandAll}
                selectedKey={value}
                onSelect={(key, node) => {
                  commit(key, node);
                  setOpen(false);
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
