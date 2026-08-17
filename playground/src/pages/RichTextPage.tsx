import { useRef, useState } from "react";
import {
  Button,
  PageCard,
  PageHeader,
  RichTextEditor,
  Tag,
} from "@rideos-ai/ui";
import type {
  RichTextChangeDetail,
  RichTextEditorHandle,
} from "@rideos-ai/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const INITIAL_CONTENT = `
<h1>RideOS 运营公告</h1>
<p>各位同事，<strong>新版调度策略</strong>将于本周五 22:00 生效，请提前完成车辆与司机资料核对。</p>
<blockquote><p>变更期间不会影响乘客下单，调度控制台可能出现短时数据刷新延迟。</p></blockquote>
<h2>上线检查项</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>完成生产车辆标签同步</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>复核夜间调度阈值</p></div></li>
</ul>
<h2>区域安排</h2>
<table><tbody>
  <tr><th><p>区域</p></th><th><p>负责人</p></th><th><p>状态</p></th></tr>
  <tr><td><p>华东</p></td><td><p>王静</p></td><td><p><mark data-color="#d9f7be">已就绪</mark></p></td></tr>
  <tr><td><p>华南</p></td><td><p>陈宇</p></td><td><p><mark data-color="#fff1b8">待确认</mark></p></td></tr>
</tbody></table>
<p>详细说明请查看 <a target="_blank" rel="noopener noreferrer nofollow" href="https://github.com/GQ-Y/rideos-ui">RideOS UI 仓库</a>。</p>
`;

export function RichTextPage() {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [html, setHtml] = useState(INITIAL_CONTENT);
  const [detail, setDetail] = useState<RichTextChangeDetail | null>(null);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "富文本编辑器"]}
        title="RichTextEditor 富文本编辑器"
        description="完整排版、列表、链接、图片、表格、颜色、字数统计、HTML 输出与只读预览"
      />
      <PageCard>
        <DemoSection
          title="业务内容编辑"
          desc="受控 HTML 模式；支持本地图片转 data URL，也可通过 onImageUpload 接入对象存储"
        >
          <DemoRow>
            <Tag tone="brand">Tiptap 3</Tag>
            <Tag tone="success">React 18 / 19</Tag>
            <Tag tone="info">HTML + JSON</Tag>
            <Tag tone="default">表格可调整列宽</Tag>
          </DemoRow>
          <div style={{ marginTop: 14 }}>
            <RichTextEditor
              ref={editorRef}
              value={html}
              onChange={(nextHtml, nextDetail) => {
                setHtml(nextHtml);
                setDetail(nextDetail);
              }}
              aria-label="运营公告编辑器"
              placeholder="输入运营公告内容…"
              minHeight={360}
              maxCharacters={8000}
            />
          </div>
          <DemoRow>
            <Button variant="primary" onClick={() => editorRef.current?.focus("end")}>继续编辑</Button>
            <Button onClick={() => setHtml(INITIAL_CONTENT)}>恢复示例</Button>
            <Button onClick={() => editorRef.current?.clear()}>清空内容</Button>
            <span style={{ color: "var(--rideos-n500)", fontSize: 12 }}>
              {detail
                ? `${detail.characters} 字符 · ${detail.words} 词 · ${detail.isEmpty ? "空内容" : "有内容"}`
                : "编辑后实时输出统计"}
            </span>
          </DemoRow>
        </DemoSection>

        <DemoSection title="只读预览" desc="使用同一 HTML 值，无工具栏且不可编辑">
          <RichTextEditor
            value={html}
            readOnly
            toolbar={false}
            showCharacterCount={false}
            minHeight={160}
            aria-label="运营公告只读预览"
          />
        </DemoSection>

        <DemoSection title="HTML 输出" desc="可直接提交给业务 API；服务端持久化前仍应执行白名单清洗">
          <pre
            style={{
              maxHeight: 240,
              padding: 14,
              margin: 0,
              overflow: "auto",
              color: "#d8e1e8",
              background: "#1f2329",
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {html}
          </pre>
        </DemoSection>
      </PageCard>
    </>
  );
}
