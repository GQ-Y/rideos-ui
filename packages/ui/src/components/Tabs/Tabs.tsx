import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface TabsItem {
  key: string;
  label: ReactNode;
}

export interface TabsProps {
  items: TabsItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <div className="rideos-tabs" role="tablist">
      {items.map((item) => (
        <button
          type="button"
          key={item.key}
          role="tab"
          aria-selected={item.key === activeKey}
          className={cx("rideos-tab", item.key === activeKey && "active")}
          onClick={() => onChange?.(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
