import { PageCard, PageHeader } from "@rideos-ai/ui";
import {
  BarChart,
  GaugeChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
} from "@rideos-ai/charts";

const WEEK = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const CITIES = ["上海", "杭州", "苏州", "南京"];

export function ChartsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "图表组件"]}
        title="图表组件 @rideos-ai/charts"
        description="纯 SVG 实现、零第三方依赖:折线 / 曲线 / 面积 / 柱状(分组、堆叠) / 饼图 / 环形 / 雷达 / 仪表盘 / 散点。图例可点击开关系列,悬浮查看数值。"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 12,
        }}
      >
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>折线图 · 本周订单趋势</h3>
          <LineChart
            categories={WEEK}
            series={[
              { name: "下单量", data: [5210, 5630, 5480, 6120, 6890, 7420, 7050] },
              { name: "完成量", data: [5020, 5450, 5290, 5900, 6640, 7180, 6820] },
            ]}
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>曲线图 + 面积 · GMV(万元)</h3>
          <LineChart
            categories={WEEK}
            series={[{ name: "GMV", data: [86, 92, 88, 103, 121, 138, 129] }]}
            smooth
            area
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>柱状图(分组) · 各城市日订单</h3>
          <BarChart
            categories={CITIES}
            series={[
              { name: "昨日", data: [3120, 2450, 1890, 1660] },
              { name: "今日", data: [3480, 2610, 2050, 1720] },
            ]}
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>柱状图(堆叠) · 车型结构</h3>
          <BarChart
            categories={CITIES}
            series={[
              { name: "快车", data: [1800, 1400, 1100, 900] },
              { name: "专车", data: [900, 700, 550, 480] },
              { name: "出租车", data: [780, 510, 400, 340] },
            ]}
            stacked
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>饼图 · 订单渠道占比</h3>
          <PieChart
            data={[
              { name: "App", value: 4620 },
              { name: "小程序", value: 2890 },
              { name: "扫码", value: 1240 },
              { name: "其他", value: 380 },
            ]}
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>雷达图 · 城市运营健康度</h3>
          <RadarChart
            indicators={[
              { name: "供给", max: 100 },
              { name: "履约", max: 100 },
              { name: "体验", max: 100 },
              { name: "安全", max: 100 },
              { name: "增长", max: 100 },
            ]}
            series={[
              { name: "上海", data: [86, 92, 88, 95, 70] },
              { name: "杭州", data: [72, 85, 90, 88, 82] },
            ]}
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>仪表盘 · 今日完单率</h3>
          <GaugeChart
            value={82.6}
            min={0}
            max={100}
            title="完单率"
            valueFormatter={(v) => `${v.toFixed(1)}%`}
            segments={[
              { to: 60, color: "var(--rideos-danger, #fe5042)" },
              { to: 85, color: "var(--rideos-warning, #ffa51e)" },
              { to: 100, color: "var(--rideos-success, #4db054)" },
            ]}
            height={240}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>散点图 · 里程 vs 客单价</h3>
          <ScatterChart
            xLabel="里程(km)"
            yLabel="客单价(元)"
            series={[
              {
                name: "快车",
                data: [[3, 14], [5, 18], [8, 24], [12, 33], [15, 40], [7, 22], [10, 29]],
              },
              {
                name: "专车",
                data: [[4, 26], [6, 33], [9, 45], [13, 58], [16, 70], [11, 52]],
              },
            ]}
            height={260}
          />
        </PageCard>
        <PageCard>
          <h3 style={{ margin: "0 0 8px" }}>环形图 · 车辆状态分布</h3>
          <PieChart
            data={[
              { name: "运营中", value: 986 },
              { name: "维保中", value: 132 },
              { name: "待审批", value: 96 },
              { name: "已停用", value: 72 },
            ]}
            donut
            centerTitle="车辆总数"
            height={260}
          />
        </PageCard>
      </div>
    </>
  );
}
