import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Checkbox } from "../Checkbox";

export interface TreeNodeData {
  key: string;
  title: ReactNode;
  children?: TreeNodeData[];
  disabled?: boolean;
}

export interface TreeProps {
  data: TreeNodeData[];
  /** 可勾选(父子联动,父节点自动半选/全选) */
  checkable?: boolean;
  /** 受控勾选:叶子节点 key 集合 */
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  /** 勾选变化:回传所有被勾选的叶子 key */
  onCheck?: (leafKeys: string[]) => void;
  /** 受控展开的节点 key */
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  /** 初始展开全部 */
  defaultExpandAll?: boolean;
  onExpand?: (expandedKeys: string[]) => void;
  /** 受控选中(单选高亮) */
  selectedKey?: string | null;
  onSelect?: (key: string, node: TreeNodeData) => void;
  emptyText?: ReactNode;
  className?: string;
}

/** 收集子树的全部叶子 key(disabled 叶子除外) */
export function collectLeafKeys(node: TreeNodeData): string[] {
  if (!node.children || node.children.length === 0) {
    return node.disabled ? [] : [node.key];
  }
  return node.children.flatMap(collectLeafKeys);
}

function collectAllKeys(nodes: TreeNodeData[]): string[] {
  return nodes.flatMap((node) => [node.key, ...collectAllKeys(node.children ?? [])]);
}

/**
 * 树形控件:展开/收起、单选高亮、可勾选(父子联动 + 半选)
 * 大数据量的虚拟滚动可配合 VirtualList 在后续版本内置。
 */
export function Tree({
  data,
  checkable = false,
  checkedKeys: checkedProp,
  defaultCheckedKeys = [],
  onCheck,
  expandedKeys: expandedProp,
  defaultExpandedKeys,
  defaultExpandAll = false,
  onExpand,
  selectedKey: selectedProp,
  onSelect,
  emptyText = "暂无数据",
  className,
}: TreeProps) {
  const [innerExpanded, setInnerExpanded] = useState<string[]>(
    () => defaultExpandedKeys ?? (defaultExpandAll ? collectAllKeys(data) : []),
  );
  const [innerChecked, setInnerChecked] = useState<string[]>(defaultCheckedKeys);
  const [innerSelected, setInnerSelected] = useState<string | null>(null);

  const expanded = expandedProp ?? innerExpanded;
  const checked = checkedProp ?? innerChecked;
  const selected = selectedProp !== undefined ? selectedProp : innerSelected;
  const checkedSet = useMemo(() => new Set(checked), [checked]);

  function toggleExpand(key: string) {
    const next = expanded.includes(key)
      ? expanded.filter((k) => k !== key)
      : [...expanded, key];
    if (expandedProp === undefined) setInnerExpanded(next);
    onExpand?.(next);
  }

  function toggleCheck(node: TreeNodeData) {
    const leaves = collectLeafKeys(node);
    if (leaves.length === 0) return;
    const allChecked = leaves.every((key) => checkedSet.has(key));
    const nextSet = new Set(checkedSet);
    leaves.forEach((key) => {
      if (allChecked) nextSet.delete(key);
      else nextSet.add(key);
    });
    const next = [...nextSet];
    if (checkedProp === undefined) setInnerChecked(next);
    onCheck?.(next);
  }

  function select(node: TreeNodeData) {
    if (node.disabled) return;
    if (selectedProp === undefined) setInnerSelected(node.key);
    onSelect?.(node.key, node);
  }

  function renderNodes(nodes: TreeNodeData[], level: number): ReactNode {
    return nodes.map((node) => {
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = expanded.includes(node.key);
      const leaves = hasChildren ? collectLeafKeys(node) : [];
      const checkedCount = hasChildren
        ? leaves.filter((key) => checkedSet.has(key)).length
        : 0;
      const isChecked = hasChildren
        ? leaves.length > 0 && checkedCount === leaves.length
        : checkedSet.has(node.key);
      const indeterminate = hasChildren && checkedCount > 0 && checkedCount < leaves.length;

      return (
        <div key={node.key} className="rideos-tree-item">
          <div
            className={cx(
              "rideos-tree-node",
              selected === node.key && "is-selected",
              node.disabled && "is-disabled",
            )}
            style={{ paddingLeft: level * 18 + 4 }}
          >
            {hasChildren ? (
              <button
                type="button"
                className={cx("rideos-tree-caret", isExpanded && "is-open")}
                aria-label={isExpanded ? "收起" : "展开"}
                onClick={() => toggleExpand(node.key)}
              >
                <CaretRightOutlined />
              </button>
            ) : (
              <span className="rideos-tree-caret is-leaf" aria-hidden="true" />
            )}
            {checkable && (
              <Checkbox
                checked={isChecked}
                indeterminate={indeterminate}
                disabled={node.disabled}
                onChange={() => toggleCheck(node)}
              />
            )}
            <button
              type="button"
              className="rideos-tree-title"
              disabled={node.disabled}
              onClick={() => select(node)}
            >
              {node.title}
            </button>
          </div>
          {hasChildren && isExpanded && (
            <div className="rideos-tree-children">{renderNodes(node.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  }

  if (data.length === 0) {
    return <div className={cx("rideos-tree", className)}>
      <div className="rideos-tree-empty">{emptyText}</div>
    </div>;
  }

  return (
    <div className={cx("rideos-tree", className)} role="tree">
      {renderNodes(data, 0)}
    </div>
  );
}
