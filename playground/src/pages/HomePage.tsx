import { Button, PageCard, PageHeader, StatStrip } from "@rideos/ui";

const KIT_LINKS: Array<{ path: string; title: string; desc: string }> = [
  { path: "/kit/base", title: "基础组件", desc: "Button · Link · Typography · Tag · Badge · Segmented · Statistic 等" },
  { path: "/kit/form", title: "表单与校验", desc: "Form 校验 · Upload · Cascader · TreeSelect · AutoComplete · Slider · Rate" },
  { path: "/kit/nav", title: "导航与布局", desc: "Menu · Breadcrumb · Layout · Grid · Flex · BackTop" },
  { path: "/kit/feedback", title: "反馈与弹层", desc: "Modal · Drawer · FloatWidget" },
  { path: "/kit/data", title: "数据展示", desc: "Descriptions · Timeline · StatStrip · FilterBar · DataTable" },
  { path: "/kit/datetime", title: "日期与时间", desc: "Calendar · TimePicker · Countdown 计时器" },
  { path: "/kit/advanced", title: "树与进阶", desc: "Tree · Transfer 穿梭框 · Skeleton · VirtualList" },
  { path: "/kit/detail", title: "详情布局", desc: "DetailLayout 详情页模板" },
  { path: "/kit/resource", title: "列表页模板", desc: "ResourceListPage 一体化 CRUD" },
  { path: "/kit/geofence", title: "围栏编辑器", desc: "GeoFenceEditor 领域组件" },
  { path: "/kit/charts", title: "图表组件", desc: "LineChart · BarChart · PieChart" },
  { path: "/kit/aichat", title: "AI 对话", desc: "AIChat 流式对话组件" },
  { path: "/kit/scene", title: "综合场景示例", desc: "FilterBar + StatStrip + DataTable 标准列表页" },
  { path: "/kit/auth", title: "登录 / 认证页", desc: "登录 · 注册 · 找回密码 · SSO 单点登录/授权" },
  { path: "/kit/pro", title: "业务 Pro", desc: "SearchSelect 远程搜索 · ImportExport · PermissionGuard" },
  { path: "/kit/tools", title: "页面工具", desc: "Watermark · Scrollbar · Splitter · Anchor · Affix" },
];

export function HomePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <>
      <PageHeader
        breadcrumb={["工作台"]}
        title="RideOS UI 组件总览"
        description="左侧「组件示例」按分类演示全部组件;壳层本身(侧栏/顶栏/多页签)与右下角智能客服也是库内组件。"
        actions={
          <Button variant="primary" onClick={() => onNavigate("/kit/base")}>
            开始浏览
          </Button>
        }
      />
      <StatStrip
        items={[
          { key: "ui", label: "@rideos/ui 组件", value: "24", hint: "含 AIChat / FloatWidget" },
          { key: "charts", label: "@rideos/charts 图表", value: "3", hint: "折线/柱状/饼图" },
          { key: "tests", label: "单元测试", value: "42", hint: "全部通过" },
          { key: "ts", label: "TypeScript", value: "100%", hint: "strict 模式" },
        ]}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {KIT_LINKS.map((link) => (
          <PageCard key={link.path}>
            <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>{link.title}</h3>
            <p style={{ margin: "0 0 12px", color: "#8f959e", fontSize: 12, minHeight: 36 }}>
              {link.desc}
            </p>
            <Button onClick={() => onNavigate(link.path)}>查看示例</Button>
          </PageCard>
        ))}
      </div>
    </>
  );
}
