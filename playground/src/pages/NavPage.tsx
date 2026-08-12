import { useState } from "react";
import {
  AppstoreOutlined,
  CarOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  BackTop,
  Breadcrumb,
  Col,
  Flex,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Menu,
  message,
  PageCard,
  PageHeader,
  Row,
  Switch,
} from "@rideos-ai/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const MENU_ITEMS = [
  { key: "board", label: "工作台", icon: AppstoreOutlined },
  {
    key: "vehicle",
    label: "车辆管理",
    icon: CarOutlined,
    children: [
      { key: "list", label: "车辆台账" },
      { key: "model", label: "车型管理" },
    ],
  },
  {
    key: "order",
    label: "订单中心",
    icon: FileTextOutlined,
    children: [{ key: "trips", label: "行程订单" }],
  },
  { key: "settings", label: "系统设置", icon: SettingOutlined, disabled: true },
];

function GridCell({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "10px 0",
        textAlign: "center",
        fontSize: 12,
        color: "var(--rideos-brand)",
        background: "var(--rideos-brand-15)",
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  );
}

export function NavPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "导航与布局"]}
        title="导航与布局"
        description="Menu(通用菜单)/ Breadcrumb / Layout / Grid 栅格 / Flex / BackTop(本页右下角)"
      />
      <PageCard>
        <DemoSection title="Menu 导航菜单" desc="通用化菜单:垂直展开 / 水平悬浮子菜单 / 深色主题">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, maxWidth: 620 }}>
            <Menu items={MENU_ITEMS} defaultOpenKeys={["vehicle"]} defaultSelectedKey="list"
              onSelect={(key) => message.info(`选中菜单:${key}`)}
            />
            <Menu items={MENU_ITEMS} theme="dark" defaultOpenKeys={["vehicle"]} defaultSelectedKey="model" />
          </div>
          <div style={{ marginTop: 16, maxWidth: 620 }}>
            <Menu items={MENU_ITEMS} mode="horizontal" defaultSelectedKey="board" />
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#8f959e" }}>
              水平模式:悬停「车辆管理」弹出子菜单
            </p>
          </div>
        </DemoSection>

        <DemoSection title="Breadcrumb 面包屑" desc="独立组件,最后一项为当前页;支持点击跳转">
          <Breadcrumb
            items={[
              { label: "工作台", onClick: () => message.info("跳转:工作台") },
              { label: "车辆管理", onClick: () => message.info("跳转:车辆管理") },
              { label: "车辆台账" },
            ]}
          />
          <div style={{ marginTop: 8 }}>
            <Breadcrumb
              separator=">"
              items={[{ label: "订单中心" }, { label: "行程订单" }, { label: "订单详情" }]}
            />
          </div>
        </DemoSection>

        <DemoSection title="Layout 布局" desc="Header/Sider/Content 组合,Sider 支持折叠">
          <DemoRow>
            <Switch
              checked={collapsed}
              onChange={setCollapsed}
              checkedText="展开"
              uncheckedText="折叠"
              aria-label="折叠侧栏"
            />
          </DemoRow>
          <div style={{ border: "1px solid var(--rideos-n250)", borderRadius: 8, overflow: "hidden", marginTop: 10, maxWidth: 720 }}>
            <Layout>
              <LayoutSider collapsed={collapsed} width={180}>
                <div style={{ padding: 12, fontSize: 12, color: "var(--rideos-n500)" }}>Sider</div>
              </LayoutSider>
              <Layout>
                <LayoutHeader>
                  <div style={{ padding: "0 12px", fontSize: 12, color: "var(--rideos-n500)" }}>Header</div>
                </LayoutHeader>
                <LayoutContent>
                  <div style={{ padding: 24, fontSize: 12, color: "var(--rideos-n500)", textAlign: "center" }}>
                    Content
                  </div>
                </LayoutContent>
              </Layout>
            </Layout>
          </div>
        </DemoSection>

        <DemoSection title="Grid 栅格 / Flex" desc="24 栅格 + gutter 间距;Flex 快捷容器">
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row gutter={8}>
              <Col span={24}>
                <GridCell>span 24</GridCell>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={12}>
                <GridCell>span 12</GridCell>
              </Col>
              <Col span={12}>
                <GridCell>span 12</GridCell>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={8}>
                <GridCell>span 8</GridCell>
              </Col>
              <Col span={8}>
                <GridCell>span 8</GridCell>
              </Col>
              <Col span={8}>
                <GridCell>span 8</GridCell>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={6}>
                <GridCell>span 6</GridCell>
              </Col>
              <Col span={12} offset={6}>
                <GridCell>span 12 · offset 6</GridCell>
              </Col>
            </Row>
            <Flex justify="space-between" gap={8}>
              <GridCell>Flex 1</GridCell>
              <GridCell>Flex 2</GridCell>
              <GridCell>Flex 3</GridCell>
            </Flex>
          </div>
        </DemoSection>

        <DemoSection title="BackTop 回到顶部" desc="页面滚动超过 400px 后,右下角出现回到顶部按钮(本演示站已全局启用)">
          <p style={{ margin: 0, fontSize: 13, color: "#646a73" }}>
            向下滚动本页面即可在右下角看到按钮(位于客服浮窗上方)。
          </p>
        </DemoSection>
      </PageCard>
      <BackTop target={() => document.querySelector(".rideos-page-host") as HTMLElement} />
    </>
  );
}
