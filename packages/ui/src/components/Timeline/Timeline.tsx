import type { ReactNode } from "react";

export interface TimelineItem {
  key?: string;
  title: ReactNode;
  time?: ReactNode;
  desc?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="rideos-timeline">
      {items.map((item) => (
        <li key={item.key || `${item.time}-${item.title}`}>
          <div className="rideos-timeline-dot" />
          <div>
            <strong>{item.title}</strong>
            <small>{item.time}</small>
            {item.desc && <p>{item.desc}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
