import { useState } from "react";
import { EnvironmentOutlined, FileTextOutlined, ToolOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  DetailLayout,
  PageHeader,
  Timeline,
} from "@rideos/ui";

export function DetailPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (path: string) => void;
}) {
  const [tab, setTab] = useState("info");

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "详情布局"]}
        title="DetailLayout 详情布局"
        description="返回钮 + 标题/状态 + 摘要栏 + 操作区 + Tabs 内容区 + 右侧 aside"
      />
      <DetailLayout
        onBack={onBack}
        title="沪AD·10086"
        status="运营中"
        summary={[
          { label: "车型", value: "秦PLUS EV" },
          { label: "当前司机", value: "王建国" },
          { label: "运营城市", value: "上海" },
          { label: "今日行程", value: "23 单" },
        ]}
        actions={
          <>
            <Button>导出</Button>
            <Button variant="primary">编辑</Button>
          </>
        }
        dangerActions={
          <Button variant="primary" className="rideos-btn-danger">
            停用
          </Button>
        }
        tabs={[
          { key: "info", label: "基本信息" },
          { key: "record", label: "运营记录" },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        asideLinks={[
          {
            key: "trips",
            label: "查看行程订单",
            desc: "今日 23 单 · 本月 512 单",
            icon: FileTextOutlined,
            onClick: () => onNavigate("/kit/scene"),
          },
          {
            key: "maintenance",
            label: "维保工单历史",
            desc: "最近维保 3 天前",
            icon: ToolOutlined,
            onClick: () => onNavigate("/kit/resource"),
          },
          {
            key: "fence",
            label: "所属围栏",
            desc: "青浦主城服务区",
            icon: EnvironmentOutlined,
            onClick: () => onNavigate("/kit/geofence"),
          },
        ]}
      >
        {tab === "info" ? (
          <Descriptions
            items={[
              { label: "车辆牌照", value: "沪AD·10086" },
              { label: "VIN 码", value: "LGXC16DF6M0001086" },
              { label: "接入时间", value: "2026-03-18" },
              { label: "所属车队", value: "浦东一队" },
              { label: "电池健康度", value: "96%" },
              { label: "备注" },
            ]}
          />
        ) : (
          <Timeline
            items={[
              { title: "完成行程 T20260812200", time: "14:32" },
              { title: "开始接单", time: "08:01" },
              { title: "维保完成重新上线", time: "昨日 15:02", desc: "更换后刹车片" },
              { title: "车辆接入平台", time: "2026-03-18" },
            ]}
          />
        )}
      </DetailLayout>
    </>
  );
}
