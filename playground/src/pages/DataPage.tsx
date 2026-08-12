import { useState } from "react";
import {
  Button,
  Carousel,
  Collapse,
  DataTable,
  Descriptions,
  Empty,
  FilterBar,
  Image,
  PageCard,
  PageHeader,
  Progress,
  QRCode,
  StatStrip,
  StatusBadge,
  Steps,
  Timeline,
} from "@rideos/ui";
import type { FilterFieldValue } from "@rideos/ui";
import { DemoRow, DemoSection } from "./DemoSection";

interface OrderRow {
  id: string;
  orderNo: string;
  driver: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

const ORDERS: OrderRow[] = Array.from({ length: 23 }, (_, i) => ({
  id: `ord-${i + 1}`,
  orderNo: `T2026081${String(200 + i)}`,
  driver: ["王建国", "李海峰", "张伟", "陈晓东"][i % 4],
  amount: 18 + (i % 7) * 6.5,
  status: ["已完成", "进行中", "待支付", "已完成"][i % 4],
}));

export function DataPage() {
  const [statKey, setStatKey] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, FilterFieldValue>>({});
  const [page, setPage] = useState(1);

  const rows = ORDERS.slice((page - 1) * 5, page * 5);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "数据展示"]}
        title="数据展示"
        description="Descriptions / Timeline / StatStrip / Progress / Steps / Empty / FilterBar / DataTable + Pagination"
      />
      <PageCard>
        <DemoSection title="Descriptions 描述列表" desc="column 控制列数,value 缺省显示 —">
          <Descriptions
            column={3}
            items={[
              { label: "车辆牌照", value: "沪AD·10086" },
              { label: "车型", value: "秦PLUS EV" },
              { label: "运营城市", value: "上海" },
              { label: "当前司机", value: "王建国" },
              { label: "接入时间", value: "2026-03-18" },
              { label: "备注" },
            ]}
          />
        </DemoSection>

        <DemoSection title="Timeline 时间线" desc="title / time / desc">
          <Timeline
            items={[
              { title: "工单创建", time: "09:12", desc: "客服转派维保工单 #4821" },
              { title: "司机交车", time: "10:05" },
              { title: "维保完成", time: "14:40", desc: "更换后刹车片,例行检查通过" },
              { title: "重新上线", time: "15:02" },
            ]}
          />
        </DemoSection>

        <DemoSection title="StatStrip 统计条" desc="传 onSelect 后卡片可点击,配合 activeKey 高亮联动筛选">
          <StatStrip
            activeKey={statKey}
            onSelect={(item) => setStatKey(item.key)}
            items={[
              { key: "all", label: "全部订单", value: ORDERS.length, hint: "演示数据" },
              { key: "done", label: "已完成", value: 12, hint: "占比 52%" },
              { key: "running", label: "进行中", value: 6 },
              { key: "unpaid", label: "待支付", value: 5, hint: "需跟进" },
            ]}
          />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            当前选中:{statKey}
          </p>
        </DemoSection>

        <DemoSection title="Progress 进度条" desc="线形 / 环形,normal / success / exception 状态">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
            <Progress percent={35} />
            <Progress percent={100} />
            <Progress percent={68} status="exception" />
          </div>
          <DemoRow>
            <div style={{ marginTop: 14, display: "flex", gap: 16 }}>
              <Progress percent={75} type="circle" size={96} />
              <Progress percent={100} type="circle" size={96} />
              <Progress percent={42} type="circle" size={96} status="exception" />
            </div>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Steps 步骤条" desc="流程指示:完成 / 进行中 / 等待,可点击回退">
          <div style={{ maxWidth: 640 }}>
            <Steps
              items={[
                { title: "提交申请", description: "司机发起提现" },
                { title: "财务审核", description: "T+1 内完成" },
                { title: "打款", description: "银行处理中" },
                { title: "完成" },
              ]}
              current={1}
            />
          </div>
        </DemoSection>

        <DemoSection title="Collapse 折叠面板" desc="多开或手风琴模式">
          <div style={{ maxWidth: 560 }}>
            <Collapse
              defaultActiveKeys={["rule"]}
              items={[
                { key: "rule", label: "计价规则", children: "起步价 13 元(3 公里),超出后 2.3 元/公里,夜间(23:00-05:00)加收 20%。" },
                { key: "invoice", label: "发票说明", children: "行程结束后 24 小时内可在订单详情页申请电子发票。" },
                { key: "refund", label: "退改规则", children: "出发前 5 分钟可免费取消;司机到达后取消将收取空驶费。", disabled: false },
              ]}
            />
          </div>
        </DemoSection>

        <DemoSection title="QRCode 二维码" desc="零依赖 SVG 生成(版本 1-10 自适应,纠错 L/M/Q/H),支持过期遮罩刷新">
          <DemoRow>
            <QRCode value="https://rideos.example.com/download" />
            <QRCode value="RIDEOS-CHECKIN-20260812" size={120} level="H" />
            <QRCode value="expired-demo" size={120} expired onRefresh={() => undefined} />
          </DemoRow>
        </DemoSection>

        <DemoSection title="Image 图片 / Carousel 走马灯" desc="Image 支持加载失败兜底与点击全屏预览;Carousel 自动轮播、悬停暂停">
          <DemoRow>
            <Image
              src="https://picsum.photos/seed/rideos1/240/140"
              alt="示例图片"
              width={240}
              height={140}
            />
            <Image src="/broken-url.png" alt="失败兜底" width={240} height={140} />
          </DemoRow>
          <div style={{ maxWidth: 520, marginTop: 12 }}>
            <Carousel interval={3000}>
              {["春季安全驾驶周", "新城市开通:南京", "司机之家焕新上线"].map((text, index) => (
                <div
                  key={text}
                  style={{
                    height: 140,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#fff",
                    background: ["#0b3d2e", "#0f5a41", "#009a7a"][index],
                  }}
                >
                  {text}
                </div>
              ))}
            </Carousel>
          </div>
        </DemoSection>

        <DemoSection title="Empty 空状态" desc="缺省图 + 描述 + 引导操作">
          <div style={{ maxWidth: 320, border: "1px solid var(--rideos-n250)", borderRadius: 8 }}>
            <Empty description="还没有配置围栏">
              <Button variant="primary">去创建</Button>
            </Empty>
          </div>
        </DemoSection>

        <DemoSection title="FilterBar 筛选条" desc="keyword + 字段配置(text/select/dateRange/number),日期区间已升级为 DateRangePicker">
          <FilterBar
            keyword={keyword}
            onKeywordChange={setKeyword}
            placeholder="订单号 / 司机"
            fields={[
              { key: "status", label: "订单状态", type: "select", options: ["已完成", "进行中", "待支付"] },
              { key: "amount", label: "金额下限", type: "number", more: true },
              { key: "range", label: "下单时间", type: "dateRange", more: true },
            ]}
            values={filterValues}
            onFieldChange={(key, next) => setFilterValues((prev) => ({ ...prev, [key]: next }))}
            onSubmit={() => undefined}
            onReset={() => {
              setKeyword("");
              setFilterValues({});
            }}
          />
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8f959e" }}>
            当前筛选值:{JSON.stringify({ keyword, ...filterValues })}
          </p>
        </DemoSection>

        <DemoSection title="DataTable 数据表格" desc="列配置 + render 自定义单元格,底部内置 Pagination">
          <DataTable<OrderRow>
            columns={[
              { key: "orderNo", title: "订单号", width: 150 },
              { key: "driver", title: "司机", width: 110 },
              {
                key: "amount",
                title: "金额",
                width: 100,
                render: (value) => `¥ ${Number(value).toFixed(2)}`,
              },
              {
                key: "status",
                title: "状态",
                width: 100,
                render: (value) => <StatusBadge value={String(value)} />,
              },
            ]}
            rows={rows}
            total={ORDERS.length}
            page={page}
            pageSize={5}
            onPageChange={setPage}
          />
        </DemoSection>
      </PageCard>
    </>
  );
}
