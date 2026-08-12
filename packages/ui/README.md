# @rideos/ui

RideOS 企业级 React PC 组件库，提供后台壳层、页面布局、表单、数据展示、反馈、认证、权限和 AI 对话组件。

## 安装

```bash
npm install @rideos/ui react react-dom @ant-design/icons
```

支持 React 18 和 React 19，包格式为 ESM，并随包提供 TypeScript 类型声明。

## 使用

```tsx
import "@rideos/ui/styles.css";
import { Button, PageCard, PageHeader } from "@rideos/ui";

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
import "@rideos/ui/tokens.css";
```

## License

Apache-2.0。商标权不随本许可证授予，详见随包分发的 `LICENSE` 和 `NOTICE`。
