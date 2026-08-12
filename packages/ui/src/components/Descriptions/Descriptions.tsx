import type { CSSProperties, Key, ReactNode } from "react";

export interface DescriptionsItem {
  key?: string;
  label: ReactNode;
  value?: ReactNode;
}

export interface DescriptionsProps {
  items: DescriptionsItem[];
  column?: number;
}

export function Descriptions({ items, column = 2 }: DescriptionsProps) {
  return (
    <dl className="rideos-descriptions" style={{ "--rideos-desc-cols": column } as CSSProperties}>
      {items.map((item) => (
        <div key={(item.key || item.label) as Key} className="rideos-descriptions-item">
          <dt>{item.label}</dt>
          <dd>{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
