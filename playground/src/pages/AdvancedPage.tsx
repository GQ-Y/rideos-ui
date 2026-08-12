import { useState } from "react";
import {
  Button,
  PageCard,
  PageHeader,
  Skeleton,
  StatusBadge,
  Transfer,
  Tree,
  VirtualList,
} from "@rideos/ui";
import type { TransferItem, TreeNodeData } from "@rideos/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const ORG_TREE: TreeNodeData[] = [
  {
    key: "hq",
    title: "RideOS 集团",
    children: [
      {
        key: "east",
        title: "华东大区",
        children: [
          { key: "sh", title: "上海运营中心" },
          { key: "hz", title: "杭州运营中心" },
          { key: "sz", title: "苏州运营中心" },
        ],
      },
      {
        key: "north",
        title: "华北大区",
        children: [
          { key: "bj", title: "北京运营中心" },
          { key: "tj", title: "天津运营中心", disabled: true },
        ],
      },
      { key: "lab", title: "创新实验室" },
    ],
  },
];

const CITY_TRANSFER: TransferItem[] = [
  {
    key: "east",
    title: "华东",
    children: [
      { key: "sh", title: "上海" },
      { key: "hz", title: "杭州" },
      { key: "sz", title: "苏州" },
      { key: "nj", title: "南京" },
    ],
  },
  {
    key: "north",
    title: "华北",
    children: [
      { key: "bj", title: "北京" },
      { key: "tj", title: "天津" },
    ],
  },
];

const VEHICLES = Array.from({ length: 10000 }, (_, i) => ({
  id: `veh-${i + 1}`,
  plate: `沪AD·${String(10000 + i).slice(-5)}`,
  status: ["运营中", "维保中", "已停用"][i % 3],
}));

export function AdvancedPage() {
  const [checkedKeys, setCheckedKeys] = useState<string[]>(["sh"]);
  const [targetKeys, setTargetKeys] = useState<string[]>(["bj"]);
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "树与进阶"]}
        title="树与进阶"
        description="Tree 树 / Transfer 树形穿梭框 / Skeleton 骨架屏 / VirtualList 虚拟列表(万级数据)"
      />
      <PageCard>
        <DemoSection
          title="Tree 树形控件"
          desc="展开/收起、单选高亮、可勾选(父子联动 + 半选)、禁用节点"
        >
          <div style={{ maxWidth: 360 }}>
            <Tree
              data={ORG_TREE}
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={setCheckedKeys}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            已勾选叶子:{checkedKeys.length ? checkedKeys.join(", ") : "(空)"}
          </p>
        </DemoSection>

        <DemoSection
          title="Transfer 穿梭框(树形左右移动)"
          desc="两栏树结构,勾选叶子后左右移动;平铺数据同样适用"
        >
          <div style={{ maxWidth: 720 }}>
            <Transfer
              data={CITY_TRANSFER}
              targetKeys={targetKeys}
              onChange={(keys) => setTargetKeys(keys)}
              titles={["未开通城市", "已开通城市"]}
              height={240}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            已开通:{targetKeys.length ? targetKeys.join(", ") : "(空)"}
          </p>
        </DemoSection>

        <DemoSection title="Skeleton 骨架屏" desc="头像/标题/段落占位 + 微光动画;loading=false 渲染真实内容">
          <DemoRow>
            <Button onClick={() => setSkeletonLoading((v) => !v)}>
              {skeletonLoading ? "加载完成" : "重新加载"}
            </Button>
          </DemoRow>
          <div style={{ maxWidth: 560, marginTop: 12 }}>
            <Skeleton loading={skeletonLoading} avatar rows={3}>
              <div style={{ display: "flex", gap: 14 }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--rideos-brand-15)",
                    color: "var(--rideos-brand)",
                    fontWeight: 600,
                  }}
                >
                  王
                </span>
                <div>
                  <h4 style={{ margin: "0 0 6px" }}>王建国 · 金牌司机</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#646a73" }}>
                    累计行程 1,286 单,好评率 99.2%,服务年限 3 年;当前驾驶沪AD·10086,状态运营中。
                  </p>
                </div>
              </div>
            </Skeleton>
          </div>
        </DemoSection>

        <DemoSection
          title="VirtualList 虚拟列表"
          desc="10,000 行数据只渲染可视区 DOM,滚动流畅;固定行高 40px"
        >
          <div style={{ maxWidth: 560 }}>
            <VirtualList
              data={VEHICLES}
              itemHeight={40}
              height={320}
              itemKey={(item) => item.id}
              renderItem={(item, index) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  <span style={{ color: "#8f959e", width: 56 }}>#{index + 1}</span>
                  <strong style={{ flex: 1 }}>{item.plate}</strong>
                  <StatusBadge value={item.status} />
                </div>
              )}
            />
          </div>
        </DemoSection>
      </PageCard>
    </>
  );
}
