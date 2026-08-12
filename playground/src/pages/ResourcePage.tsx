import { PageHeader, ResourceListPage } from "@rideos-ai/ui";
import type { ResourceRow } from "@rideos-ai/ui";

const DRIVERS: ResourceRow[] = [
  { id: "d1", name: "王建国", phone: "13800001111", city: "上海", trips: 1286, status: "在职", tab: "active", confirmAction: "停用", nextStatus: "已停用", navigateTo: "/kit/scene" },
  { id: "d2", name: "李海峰", phone: "13800002222", city: "杭州", trips: 964, status: "在职", tab: "active", confirmAction: "停用", nextStatus: "已停用" },
  { id: "d3", name: "张伟", phone: "13800003333", city: "上海", trips: 1730, status: "在职", tab: "active", confirmAction: "停用", nextStatus: "已停用" },
  { id: "d4", name: "陈晓东", phone: "13800004444", city: "苏州", trips: 412, status: "培训中", tab: "active" },
  { id: "d5", name: "刘洋", phone: "13800005555", city: "南京", trips: 88, status: "已停用", tab: "disabled" },
  { id: "d6", name: "赵磊", phone: "13800006666", city: "杭州", trips: 236, status: "已停用", tab: "disabled" },
];

export function ResourcePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "列表页模板"]}
        title="ResourceListPage 列表页模板"
        description="一个组件跑通 CRUD:筛选 + 统计卡 + 页签 + 表格 + 新建/编辑抽屉 + 详情抽屉 + 确认弹窗(演示数据在组件内维护)"
      />
      <ResourceListPage
        title="司机管理"
        description="模板演示:试试新建、编辑、点击行内「停用」或统计卡联动筛选。"
        rows={DRIVERS}
        searchKeys={["name", "phone"]}
        placeholder="姓名 / 手机号"
        createLabel="新建司机"
        tabs={[
          { key: "active", label: "在职" },
          { key: "disabled", label: "已停用" },
        ]}
        columns={[
          { key: "name", title: "姓名", width: 110 },
          { key: "phone", title: "手机号", width: 140 },
          { key: "city", title: "城市", width: 90 },
          { key: "trips", title: "累计行程", width: 100 },
          { key: "status", title: "状态", width: 100, type: "status" },
        ]}
        formFields={[
          { key: "name", label: "姓名", required: true },
          { key: "phone", label: "手机号", required: true, hint: "用于接收调度通知" },
          { key: "city", label: "城市", type: "select", options: ["上海", "杭州", "苏州", "南京"] },
          { key: "status", label: "状态", type: "select", options: ["在职", "培训中", "已停用"], defaultValue: "在职" },
          { key: "remark", label: "备注", type: "textarea" },
        ]}
        filterFields={[
          { key: "city", label: "城市", type: "select", options: ["上海", "杭州", "苏州", "南京"] },
          { key: "status", label: "状态", type: "select", options: ["在职", "培训中", "已停用"] },
        ]}
        stats={[
          { key: "all", label: "全部司机", value: 6, filter: {} },
          { key: "active", label: "在职", value: 3, filter: { status: "在职" } },
          { key: "training", label: "培训中", value: 1, filter: { status: "培训中" } },
          { key: "disabled", label: "已停用", value: 2, filter: { status: "已停用" } },
        ]}
        confirmTitle="停用司机"
        confirmHint="停用后该司机将无法接单,确认继续?"
        onNavigate={onNavigate}
      />
    </>
  );
}
