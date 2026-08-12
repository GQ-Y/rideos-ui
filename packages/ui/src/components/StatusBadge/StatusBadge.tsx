import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface StatusBadgeProps {
  value: ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral";
  className?: string;
}

function inferTone(value: ReactNode) {
  const text = String(value ?? "");
  if (["失败", "驳回", "停用", "阻断", "高"].some((word) => text.includes(word))) return "danger";
  if (["待", "审批", "预警", "中", "规划"].some((word) => text.includes(word))) return "warning";
  if (["草稿", "只读", "禁用"].some((word) => text.includes(word))) return "neutral";
  return "success";
}

export function StatusBadge({ value, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? inferTone(value);
  return (
    <span className={cx("rideos-status-badge", resolved, className)}>
      {value}
    </span>
  );
}
