# @rideos/charts

RideOS React SVG 图表组件库，提供折线图、柱状图、饼图、雷达图、仪表盘和散点图。

## 安装

```bash
npm install @rideos/charts react react-dom
```

支持 React 18 和 React 19，包格式为 ESM，并随包提供 TypeScript 类型声明。

## 使用

```tsx
import "@rideos/charts/styles.css";
import { LineChart } from "@rideos/charts";

export function Example() {
  return (
    <LineChart
      categories={["周一", "周二", "周三"]}
      series={[{ name: "订单量", data: [5210, 5630, 6120] }]}
      smooth
      area
    />
  );
}
```

图表颜色优先读取 `--rideos-chart-*` CSS Variables；未加载 `@rideos/ui` 时使用内置回退色。

## License

Apache-2.0。商标权不随本许可证授予，详见随包分发的 `LICENSE` 和 `NOTICE`。
