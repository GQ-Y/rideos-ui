import { useState } from "react";
import type { ReactNode } from "react";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

const pad = (n: number) => String(n).padStart(2, "0");

function fmt(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function todayStr() {
  const now = new Date();
  return fmt(now.getFullYear(), now.getMonth(), now.getDate());
}

interface CalendarCell {
  date: string;
  day: number;
  inMonth: boolean;
}

/** 生成 6x7 完整周网格(周一开头) */
function buildCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  /* 周一为一周第一天 */
  const lead = (first.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(year, month, i - lead + 1);
    cells.push({
      date: fmt(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    });
  }
  return cells;
}

export interface CalendarProps {
  /** 受控选中日期(YYYY-MM-DD) */
  value?: string;
  /** 非受控默认选中日期 */
  defaultValue?: string;
  onSelect?: (date: string) => void;
  /** 面板年月变化(month 为 1-12) */
  onPanelChange?: (year: number, month: number) => void;
  /** 单元格附加内容(日程/徽标),返回 null 不渲染 */
  dateCellRender?: (date: string) => ReactNode;
  /** 紧凑卡片模式(小尺寸单元格) */
  compact?: boolean;
  className?: string;
}

/**
 * 日历:月视图面板,支持受控选中与自定义单元格内容(日程/徽标)
 */
export function Calendar({
  value: valueProp,
  defaultValue,
  onSelect,
  onPanelChange,
  dateCellRender,
  compact = false,
  className,
}: CalendarProps) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? todayStr());
  const value = valueProp ?? innerValue;
  const base = new Date(value);
  const validBase = Number.isNaN(base.getTime()) ? new Date() : base;
  const [viewYear, setViewYear] = useState(validBase.getFullYear());
  const [viewMonth, setViewMonth] = useState(validBase.getMonth());

  const today = todayStr();
  const cells = buildCells(viewYear, viewMonth);

  function changePanel(year: number, month: number) {
    const next = new Date(year, month, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    onPanelChange?.(next.getFullYear(), next.getMonth() + 1);
  }

  function select(date: string) {
    if (valueProp === undefined) setInnerValue(date);
    onSelect?.(date);
    const d = new Date(date);
    if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) {
      changePanel(d.getFullYear(), d.getMonth());
    }
  }

  return (
    <div className={cx("rideos-calendar", compact && "is-compact", className)}>
      <div className="rideos-calendar-head">
        <strong>
          {viewYear} 年 {viewMonth + 1} 月
        </strong>
        <span className="rideos-calendar-nav">
          <button
            type="button"
            aria-label="上一年"
            onClick={() => changePanel(viewYear - 1, viewMonth)}
          >
            <DoubleLeftOutlined />
          </button>
          <button
            type="button"
            aria-label="上一月"
            onClick={() => changePanel(viewYear, viewMonth - 1)}
          >
            <LeftOutlined />
          </button>
          <Button onClick={() => select(today)}>今天</Button>
          <button
            type="button"
            aria-label="下一月"
            onClick={() => changePanel(viewYear, viewMonth + 1)}
          >
            <RightOutlined />
          </button>
          <button
            type="button"
            aria-label="下一年"
            onClick={() => changePanel(viewYear + 1, viewMonth)}
          >
            <DoubleRightOutlined />
          </button>
        </span>
      </div>
      <div className="rideos-calendar-grid" role="grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="rideos-calendar-week">
            {day}
          </span>
        ))}
        {cells.map((cell) => (
          <button
            type="button"
            key={cell.date}
            className={cx(
              "rideos-calendar-cell",
              !cell.inMonth && "is-out",
              cell.date === today && "is-today",
              cell.date === value && "is-selected",
            )}
            onClick={() => select(cell.date)}
          >
            <span className="rideos-calendar-day">{cell.day}</span>
            {dateCellRender && (
              <span className="rideos-calendar-cell-content">{dateCellRender(cell.date)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
