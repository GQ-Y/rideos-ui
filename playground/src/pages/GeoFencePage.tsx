import { GeoFenceEditor, PageCard, PageHeader } from "@rideos-ai/ui";
import type { GeoFence } from "@rideos-ai/ui";

const FENCES: GeoFence[] = [
  {
    id: "f1",
    name: "青浦主城服务区",
    type: "SERVICE",
    regionId: "qingpu",
    enabled: true,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [90, 70],
          [330, 50],
          [400, 180],
          [300, 300],
          [120, 260],
        ],
      ],
    },
  },
  {
    id: "f2",
    name: "高架禁停区",
    type: "FORBIDDEN",
    regionId: "qingpu",
    enabled: true,
    remark: "高架桥下禁止停放",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [430, 90],
          [560, 110],
          [540, 210],
          [440, 190],
        ],
      ],
    },
  },
  {
    id: "f3",
    name: "地铁站接驳点",
    type: "HUB",
    regionId: "qingpu",
    enabled: true,
    geometry: { center: [520, 300], radiusM: 300 },
  },
];

export function GeoFencePage() {
  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "围栏编辑器"]}
        title="GeoFenceEditor 电子围栏编辑器"
        description="左侧围栏列表 + 中间画布绘制 + 右侧属性编辑;工具栏可切换 选择/绘制多边形/放置接驳点(演示为本地坐标,接入真实地图时替换画布层)"
      />
      <PageCard>
        <GeoFenceEditor fences={FENCES} regionLabel="青浦区" />
      </PageCard>
    </>
  );
}
