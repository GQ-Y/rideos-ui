import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { Tree } from "../Tree";
import type { TreeNodeData } from "../Tree";

export type TransferItem = TreeNodeData;

export interface TransferProps {
  /** 数据源:支持平铺或树形(children) */
  data: TransferItem[];
  /** 受控:已移动到右侧的叶子 key */
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  onChange?: (targetKeys: string[], direction: "left" | "right", movedKeys: string[]) => void;
  /** 两栏标题,默认 ["可选项", "已选项"] */
  titles?: [ReactNode, ReactNode];
  /** 面板高度,默认 280 */
  height?: number;
  emptyText?: ReactNode;
  className?: string;
}

/** 收集叶子 key */
function leafKeysOf(nodes: TransferItem[]): string[] {
  return nodes.flatMap((node) =>
    node.children && node.children.length > 0 ? leafKeysOf(node.children) : [node.key],
  );
}

/** 按叶子过滤树:保留任意后代叶子命中的分支 */
function filterTree(nodes: TransferItem[], keepLeaf: (key: string) => boolean): TransferItem[] {
  const result: TransferItem[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const children = filterTree(node.children, keepLeaf);
      if (children.length > 0) result.push({ ...node, children });
    } else if (keepLeaf(node.key)) {
      result.push(node);
    }
  }
  return result;
}

/**
 * 穿梭框:左右两栏树形结构,勾选后左右移动(平铺数据同样适用)
 */
export function Transfer({
  data,
  targetKeys: targetProp,
  defaultTargetKeys = [],
  onChange,
  titles = ["可选项", "已选项"],
  height = 280,
  emptyText = "暂无数据",
  className,
}: TransferProps) {
  const [innerTarget, setInnerTarget] = useState<string[]>(defaultTargetKeys);
  const target = targetProp ?? innerTarget;
  const targetSet = useMemo(() => new Set(target), [target]);

  const [leftChecked, setLeftChecked] = useState<string[]>([]);
  const [rightChecked, setRightChecked] = useState<string[]>([]);

  const allLeaves = useMemo(() => leafKeysOf(data), [data]);
  const leftData = useMemo(() => filterTree(data, (key) => !targetSet.has(key)), [data, targetSet]);
  const rightData = useMemo(() => filterTree(data, (key) => targetSet.has(key)), [data, targetSet]);
  const leftTotal = allLeaves.length - target.length;
  const rightTotal = target.length;

  function applyTarget(next: string[], direction: "left" | "right", moved: string[]) {
    if (targetProp === undefined) setInnerTarget(next);
    onChange?.(next, direction, moved);
  }

  function moveRight() {
    if (leftChecked.length === 0) return;
    applyTarget([...target, ...leftChecked], "right", leftChecked);
    setLeftChecked([]);
  }

  function moveLeft() {
    if (rightChecked.length === 0) return;
    applyTarget(
      target.filter((key) => !rightChecked.includes(key)),
      "left",
      rightChecked,
    );
    setRightChecked([]);
  }

  function renderPanel(
    title: ReactNode,
    nodes: TransferItem[],
    checkedKeys: string[],
    onCheck: (keys: string[]) => void,
    total: number,
  ) {
    return (
      <div className="rideos-transfer-panel">
        <div className="rideos-transfer-panel-head">
          <strong>{title}</strong>
          <small>
            {checkedKeys.length > 0 ? `${checkedKeys.length}/${total}` : total} 项
          </small>
        </div>
        <div className="rideos-transfer-panel-body" style={{ height }}>
          {nodes.length === 0 ? (
            <div className="rideos-transfer-empty">{emptyText}</div>
          ) : (
            <Tree
              data={nodes}
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={onCheck}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("rideos-transfer", className)}>
      {renderPanel(titles[0], leftData, leftChecked, setLeftChecked, leftTotal)}
      <div className="rideos-transfer-actions">
        <Button
          variant="primary"
          disabled={leftChecked.length === 0}
          onClick={moveRight}
          aria-label="移入右侧"
        >
          <RightOutlined />
        </Button>
        <Button
          variant="primary"
          disabled={rightChecked.length === 0}
          onClick={moveLeft}
          aria-label="移回左侧"
        >
          <LeftOutlined />
        </Button>
      </div>
      {renderPanel(titles[1], rightData, rightChecked, setRightChecked, rightTotal)}
    </div>
  );
}
