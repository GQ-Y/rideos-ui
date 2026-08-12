import { useRef, useState } from "react";
import {
  Affix,
  Anchor,
  Button,
  message,
  PageCard,
  PageHeader,
  Scrollbar,
  Splitter,
  Tag,
  Watermark,
} from "@rideos-ai/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const ANCHOR_SECTIONS = [
  { key: "basic", title: "基本信息" },
  { key: "operation", title: "运营记录" },
  { key: "settlement", title: "结算明细" },
];

export function ToolsPage() {
  const anchorBoxRef = useRef<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState(0.5);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "页面工具"]}
        title="页面工具"
        description="Watermark 水印 / Scrollbar 滚动条 / Splitter 分隔面板 / Anchor 锚点 / Affix 固钉"
      />
      <PageCard>
        <DemoSection title="Watermark 水印" desc="canvas 平铺生成,不影响内容交互;支持多行与角度">
          <Watermark content={["RideOS 机密", "平台管理员"]}>
            <div
              style={{
                padding: 24,
                border: "1px solid var(--rideos-n250)",
                borderRadius: 8,
                minHeight: 140,
              }}
            >
              <h4 style={{ margin: "0 0 8px" }}>结算对账单(演示)</h4>
              <p style={{ margin: 0, fontSize: 13, color: "#646a73", lineHeight: 1.8 }}>
                本区域覆盖防泄密水印。水印层 pointer-events 为 none,
                文本可正常选择复制,表单可正常操作。
              </p>
            </div>
          </Watermark>
        </DemoSection>

        <DemoSection title="Scrollbar 滚动条" desc="统一美化的滚动容器(6px 圆角滑块)">
          <div style={{ maxWidth: 420 }}>
            <Scrollbar height={150}>
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--rideos-n200)",
                    fontSize: 13,
                  }}
                >
                  第 {i + 1} 条运营日志:车辆调度完成
                </div>
              ))}
            </Scrollbar>
          </div>
        </DemoSection>

        <DemoSection title="Splitter 分隔面板" desc={`拖拽中缝调整比例(当前 ${(ratio * 100).toFixed(0)}%)`}>
          <div style={{ height: 200, border: "1px solid var(--rideos-n250)", borderRadius: 8, overflow: "hidden" }}>
            <Splitter defaultRatio={0.5} onRatioChange={setRatio}>
              <div style={{ padding: 16, fontSize: 13, color: "#646a73" }}>左面板:围栏列表</div>
              <div style={{ padding: 16, fontSize: 13, color: "#646a73" }}>右面板:地图画布</div>
            </Splitter>
          </div>
        </DemoSection>

        <DemoSection title="Anchor 锚点 + Affix 固钉" desc="容器内滚动:右侧锚点跟随高亮,顶部操作条固钉吸附">
          <div
            ref={anchorBoxRef}
            style={{
              position: "relative",
              display: "flex",
              gap: 16,
              height: 260,
              overflow: "auto",
              border: "1px solid var(--rideos-n250)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Affix offsetTop={0} target={() => anchorBoxRef.current ?? document.documentElement}>
                <DemoRow>
                  <Tag tone="brand">固钉操作条</Tag>
                  <Button onClick={() => message.info("固钉区域的操作")}>保存</Button>
                </DemoRow>
              </Affix>
              {ANCHOR_SECTIONS.map((section) => (
                <div key={section.key} id={`anchor-${section.key}`} style={{ paddingTop: 16 }}>
                  <h4 style={{ margin: "0 0 8px" }}>{section.title}</h4>
                  <div
                    style={{
                      height: 160,
                      borderRadius: 6,
                      background: "var(--rideos-n100)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--rideos-n500)",
                      fontSize: 12,
                    }}
                  >
                    {section.title} 内容区
                  </div>
                </div>
              ))}
            </div>
            <div style={{ width: 120, flex: "0 0 auto", position: "sticky", top: 0, alignSelf: "flex-start" }}>
              <Anchor
                offsetTop={8}
                container={() => anchorBoxRef.current ?? document.documentElement}
                items={ANCHOR_SECTIONS.map((section) => ({
                  key: section.key,
                  href: `#anchor-${section.key}`,
                  title: section.title,
                }))}
              />
            </div>
          </div>
        </DemoSection>
      </PageCard>
    </>
  );
}
