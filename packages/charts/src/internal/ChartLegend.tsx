import { cx } from "./cx";

export interface LegendEntry {
  name: string;
  color: string;
  disabled?: boolean;
}

/** 图例行:点击切换系列显隐 */
export function ChartLegend({
  entries,
  onToggle,
}: {
  entries: LegendEntry[];
  onToggle?: (name: string) => void;
}) {
  return (
    <div className="rideos-chart-legend">
      {entries.map((entry) => (
        <button
          key={entry.name}
          type="button"
          className={cx("rideos-chart-legend-item", entry.disabled && "disabled")}
          onClick={onToggle ? () => onToggle(entry.name) : undefined}
        >
          <span className="rideos-chart-legend-dot" style={{ background: entry.color }} />
          {entry.name}
        </button>
      ))}
    </div>
  );
}
