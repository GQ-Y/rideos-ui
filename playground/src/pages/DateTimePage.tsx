import { useState } from "react";
import {
  Calendar,
  Countdown,
  DatePicker,
  DateRangePicker,
  PageCard,
  PageHeader,
  TimePicker,
} from "@rideos/ui";
import type { DateRange } from "@rideos/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const EVENTS: Record<string, string> = {};
{
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  EVENTS[`${month}-08`] = "例行维保";
  EVENTS[`${month}-15`] = "版本发布";
  EVENTS[`${month}-22`] = "运营复盘";
}

export function DateTimePage() {
  const [date, setDate] = useState<string | undefined>(undefined);
  const [single, setSingle] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange | null>(null);
  const [time, setTime] = useState<string | null>("09:30:00");
  const [deadline] = useState(() => Date.now() + 2 * 3600 * 1000 + 35 * 60 * 1000);
  const [since] = useState(() => Date.now() - 3 * 3600 * 1000 - 12 * 60 * 1000);
  const [crossDay] = useState(() => Date.now() + 50 * 3600 * 1000);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "日期与时间"]}
        title="日期与时间"
        description="DatePicker / DateRangePicker / Calendar 日历 / TimePicker 时间选择器 / Countdown 计时器"
      />
      <PageCard>
        <DemoSection
          title="DatePicker / DateRangePicker 日期选择"
          desc="月面板弹层选择单日或日期范围(悬浮预览区间);FilterBar 的日期筛选已内置使用"
        >
          <DemoRow>
            <div style={{ width: 200 }}>
              <DatePicker value={single} onChange={setSingle} allowClear aria-label="单日期" />
            </div>
            <div style={{ width: 280 }}>
              <DateRangePicker value={range} onChange={setRange} allowClear aria-label="日期范围" />
            </div>
          </DemoRow>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            单日:{single ?? "(空)"} · 范围:{range ? `${range[0]} ~ ${range[1]}` : "(空)"}
          </p>
        </DemoSection>

        <DemoSection
          title="Calendar 日历"
          desc="月视图面板:受控选中、翻月/翻年、今天定位,dateCellRender 自定义单元格内容(日程/徽标)"
        >
          <Calendar
            value={date}
            onSelect={setDate}
            dateCellRender={(d) =>
              EVENTS[d] ? <span style={{ color: "var(--rideos-brand)" }}>· {EVENTS[d]}</span> : null
            }
          />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            当前选中:{date ?? "(未选择)"}
          </p>
        </DemoSection>

        <DemoSection
          title="TimePicker 时间选择器"
          desc="时/分/秒三列滚动面板(自定义弹层),支持不含秒、清空、此刻"
        >
          <DemoRow>
            <div style={{ width: 200 }}>
              <TimePicker value={time ?? undefined} onChange={setTime} allowClear aria-label="时间" />
            </div>
            <div style={{ width: 180 }}>
              <TimePicker showSeconds={false} placeholder="时:分(不含秒)" />
            </div>
            <div style={{ width: 180 }}>
              <TimePicker disabled placeholder="禁用状态" />
            </div>
          </DemoRow>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            当前值:{time ?? "(空)"}
          </p>
        </DemoSection>

        <DemoSection title="Countdown 计时器" desc="deadline 倒计时(结束触发 onFinish)/ since 正计时;自动拆分天数">
          <DemoRow>
            <Countdown title="大促开始倒计时" deadline={deadline} />
            <Countdown title="工单处理时长(正计时)" since={since} showDays={false} />
            <Countdown title="跨天示例" deadline={crossDay} suffix="后开始" />
          </DemoRow>
        </DemoSection>
      </PageCard>
    </>
  );
}
