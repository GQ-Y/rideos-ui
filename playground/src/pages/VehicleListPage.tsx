import { useMemo, useState } from "react";
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DataTable,
  FilterBar,
  PageCard,
  PageHeader,
  StatStrip,
  StatusBadge,
} from "@rideos/ui";
import type { FilterFieldValue } from "@rideos/ui";

const STATUS_TONES: Record<string, "success" | "warning" | "danger"> = {
  运营中: "success",
  维保中: "warning",
  待审批: "warning",
  已停用: "danger",
};

const CITIES = ["上海", "杭州", "苏州", "南京"];
const MODELS = ["秦PLUS EV", "AION S", "荣威 Ei5", "帝豪 EV"];
const DRIVERS = ["王建国", "李海峰", "张伟", "陈晓东", "刘洋", "赵磊"];
const STATUS_CYCLE = ["运营中", "运营中", "维保中", "待审批", "运营中", "已停用"];

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver: string;
  city: string;
  status: string;
  joinedAt: string;
  [key: string]: unknown;
}

const VEHICLES: Vehicle[] = Array.from({ length: 23 }, (_, i) => ({
  id: `veh-${i + 1}`,
  plate: `沪AD·${String(10086 + i * 137).slice(-5)}`,
  model: MODELS[i % MODELS.length],
  driver: DRIVERS[i % DRIVERS.length],
  city: CITIES[i % CITIES.length],
  status: STATUS_CYCLE[i % STATUS_CYCLE.length],
  joinedAt: `2026-0${(i % 6) + 1}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
}));

const PAGE_SIZE = 8;

export function VehicleListPage() {
  const [keyword, setKeyword] = useState("");
  const [values, setValues] = useState<Record<string, FilterFieldValue>>({});
  const [statKey, setStatKey] = useState("all");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const count = (status: string) => VEHICLES.filter((veh) => veh.status === status).length;
    return [
      { key: "all", label: "全部车辆", value: VEHICLES.length, hint: "演示数据" },
      { key: "运营中", label: "运营中", value: count("运营中"), hint: "正常接单" },
      { key: "维保中", label: "维保中", value: count("维保中"), hint: "维修保养" },
      { key: "待审批", label: "待审批", value: count("待审批"), hint: "等待上线审核" },
      { key: "已停用", label: "已停用", value: count("已停用"), hint: "已下线车辆" },
    ];
  }, []);

  const filtered = useMemo(
    () =>
      VEHICLES.filter((veh) => {
        const text = keyword.trim();
        if (text && !`${veh.plate}${veh.driver}`.includes(text)) return false;
        if (values.city && veh.city !== values.city) return false;
        if (values.status && veh.status !== values.status) return false;
        const joined = values.joined;
        const [from, to] = Array.isArray(joined) ? joined : [];
        if (from && veh.joinedAt < from) return false;
        if (to && veh.joinedAt > to) return false;
        return true;
      }),
    [keyword, values],
  );

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFieldChange(key: string, next: FilterFieldValue) {
    setValues((prev) => ({ ...prev, [key]: next }));
    if (key === "status") setStatKey(typeof next === "string" && next ? next : "all");
    setPage(1);
  }

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "综合场景示例"]}
        title="车辆台账(综合场景)"
        description="场景示例:FilterBar + StatStrip + DataTable 组合的标准列表页。"
        actions={
          <span style={{ display: "inline-flex", gap: 8 }}>
            <Button>
              <ExportOutlined /> 导出
            </Button>
            <Button variant="primary">
              <PlusOutlined /> 新增车辆
            </Button>
          </span>
        }
      />
      <StatStrip
        items={stats}
        activeKey={statKey}
        onSelect={(item) => {
          setStatKey(item.key);
          setValues((prev) => ({ ...prev, status: item.key === "all" ? "" : item.key }));
          setPage(1);
        }}
      />
      <PageCard>
        <FilterBar
          keyword={keyword}
          onKeywordChange={(next) => {
            setKeyword(next);
            setPage(1);
          }}
          placeholder="车牌号 / 司机姓名"
          fields={[
            { key: "city", label: "运营城市", type: "select", options: CITIES },
            { key: "status", label: "车辆状态", type: "select", options: Object.keys(STATUS_TONES) },
            { key: "joined", label: "接入时间", type: "dateRange", more: true },
          ]}
          values={values}
          onFieldChange={handleFieldChange}
          onSubmit={() => setPage(1)}
          onReset={() => {
            setKeyword("");
            setValues({});
            setStatKey("all");
            setPage(1);
          }}
        />
        <DataTable<Vehicle>
          columns={[
            {
              key: "plate",
              title: "车牌号",
              width: 130,
              render: (value) => <strong>{String(value)}</strong>,
            },
            { key: "model", title: "车型", width: 130 },
            { key: "driver", title: "当前司机", width: 110 },
            { key: "city", title: "运营城市", width: 100 },
            {
              key: "status",
              title: "状态",
              width: 100,
              render: (value) => (
                <StatusBadge value={String(value)} tone={STATUS_TONES[String(value)]} />
              ),
            },
            { key: "joinedAt", title: "接入时间", width: 120 },
            {
              key: "actions",
              title: "操作",
              width: 160,
              render: () => (
                <span style={{ display: "inline-flex", gap: 8 }}>
                  <Button>详情</Button>
                  <Button>调度</Button>
                </span>
              ),
            },
          ]}
          rows={rows}
          total={filtered.length}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </PageCard>
    </>
  );
}
