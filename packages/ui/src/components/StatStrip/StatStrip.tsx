import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface StatStripItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  filter?: Record<string, unknown>;
}

export interface StatStripProps {
  items: StatStripItem[];
  activeKey?: string;
  onSelect?: (item: StatStripItem) => void;
}

export function StatStrip({ items, activeKey, onSelect }: StatStripProps) {
  return (
    <div className="rideos-stat-strip" role="list">
      {items.map((item) => {
        const clickable = Boolean(onSelect && (item.filter || item.key));
        return (
          <button
            type="button"
            key={item.key}
            role="listitem"
            className={cx(
              "rideos-stat-card",
              clickable && "clickable",
              activeKey === item.key && "active",
            )}
            disabled={!clickable}
            onClick={() => clickable && onSelect?.(item)}
          >
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            {item.hint && <span>{item.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
