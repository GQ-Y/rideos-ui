# @rideos-ai/ui

RideOS 企业级 React PC 组件库，提供后台壳层、页面布局、表单、数据展示、反馈、认证、权限、富文本和 AI 对话组件。

## 安装

```bash
npm install @rideos-ai/ui react react-dom @ant-design/icons
```

支持 React 18 和 React 19，包格式为 ESM，并随包提供 TypeScript 类型声明。

## 使用

```tsx
import "@rideos-ai/ui/styles.css";
import { Button, PageCard, PageHeader } from "@rideos-ai/ui";

export function Example() {
  return (
    <PageCard>
      <PageHeader title="车辆台账" />
      <Button variant="primary">新增车辆</Button>
    </PageCard>
  );
}
```

只需要 Design Token 时可以导入：

```ts
import "@rideos-ai/ui/tokens.css";
```

### 富文本编辑器

```tsx
import { useState } from "react";
import { RichTextEditor } from "@rideos-ai/ui";

export function ArticleEditor() {
  const [html, setHtml] = useState("<h2>运营公告</h2><p>请输入正文</p>");

  return (
    <RichTextEditor
      value={html}
      onChange={setHtml}
      maxCharacters={8000}
      onImageUpload={async (file) => uploadToObjectStorage(file)}
    />
  );
}
```

`RichTextEditor` 包含标题、基础格式、列表、任务列表、链接、图片、表格、对齐、颜色、高亮、代码块、撤销重做、全屏、字符统计和只读模式。未提供 `onImageUpload` 时，本地图片会转为 data URL；生产环境建议接入对象存储，并在服务端持久化 HTML 前执行白名单清洗。

## License

Apache-2.0。商标权不随本许可证授予，详见随包分发的 `LICENSE` 和 `NOTICE`。
