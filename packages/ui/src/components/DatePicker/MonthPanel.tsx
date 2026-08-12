import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export const padNum = (n: number) => String(n).padStart(2, "0");

export function formatDate(year: number, month: number, day: number) {
  return `${year}-${padNum(month + 1)}-${padNum(day)}`;
}

export function todayString() {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
}

interface Cell {
  date: string;
  day: number;
  inMonth: boolean;
}

function buildCells(year: number, month: number): Cell[] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(year, month, i - lead + 1);
    cells.push({
      date: formatDate(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    });
  }
  return cells;
}

export interface MonthPanelProps {
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  /** 单选选中 */
  value?: string;
  /** 范围选中(高亮区间) */
  rangeStart?: string;
  rangeEnd?: string;
  /** 悬浮预览日期(范围选择中) */
  onHover?: (date: string | null) => void;
  onPick: (date: string) => void;
}

/** 月面板:DatePicker / DateRangePicker 共用 */
export function MonthPanel({
  viewYear,
  viewMonth,
  onViewChange,
  value,
  rangeStart,
  rangeEnd,
  onHover,
  onPick,
}: MonthPanelProps) {
  const today = todayString();
  const cells = buildCells(viewYear, viewMonth);

  function shift(months: number) {
    const next = new Date(viewYear, viewMonth + months, 1);
    onViewChange(next.getFullYear(), next.getMonth());
  }

  const [lo, hi] =
    rangeStart && rangeEnd
      ? rangeStart <= rangeEnd
        ? [rangeStart, rangeEnd]
        : [rangeEnd, rangeStart]
      : [undefined, undefined];

  return (
    <div className="rideos-datepanel">
      <div className="rideos-datepanel-head">
        <span>
          <button type="button" aria-label="上一年" onClick={() => shift(-12)}>
            <DoubleLeftOutlined />
          </button>
          <button type="button" aria-label="上一月" onClick={() => shift(-1)}>
            <LeftOutlined />
          </button>
        </span>
        <strong>
          {viewYear} 年 {viewMonth + 1} 月
        </strong>
        <span>
          <button type="button" aria-label="下一月" onClick={() => shift(1)}>
            <RightOutlined />
          </button>
          <button type="button" aria-label="下一年" onClick={() => shift(12)}>
            <DoubleRightOutlined />
          </button>
        </span>
      </div>
      <div className="rideos-datepanel-grid" onMouseLeave={onHover ? () => onHover(null) : undefined}>
        {WEEKDAYS.map((day) => (
          <span key={day} className="rideos-datepanel-week">
            {day}
          </span>
        ))}
        {cells.map((cell) => {
          const inRange = lo && hi ? cell.date > lo && cell.date < hi : false;
          const isEdge = cell.date === rangeStart || cell.date === rangeEnd;
          return (
            <button
              type="button"
              key={cell.date}
              className={cx(
                "rideos-datepanel-day",
                !cell.inMonth && "is-out",
                cell.date === today && "is-today",
                (cell.date === value || isEdge) && "is-selected",
                inRange && "is-in-range",
              )}
              onClick={() => onPick(cell.date)}
              onMouseEnter={onHover ? () => onHover(cell.date) : undefined}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
