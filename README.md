# @rideos/ui

RideOS 管理后台专用 React 组件库，视觉对齐 **Go-UI**（品牌色 `#009A7A`）。

## 安装与引入

本地工作区通过路径别名或 `file:` 依赖引用。业务应用中：

```js
import "@rideos/ui/styles.css";
import {
  AppShell,
  DataTable,
  FilterBar,
  PageCard,
  PageHeader,
  StatusBadge,
  Button,
} from "@rideos/ui";
```

## 组件一览

| 组件 | 用途 |
|---|---|
| `AppShell` | 顶栏 + 页签 + 侧栏 + 内容区 |
| `BrandBar` | 顶部信息栏 |
| `AppPageTabs` | 内容页多页签导航 |
| `Sidebar` | 左侧业务菜单 |
| `PageHeader` / `PageCard` | 内容页标题与卡片容器 |
| `FilterBar` | 列表筛选条 |
| `DataTable` | 内容列表 |
| `Pagination` | 分页（也可被 DataTable 内嵌） |
| `StatusBadge` / `Button` | 状态徽标 / 基础按钮 |

## 目录结构

```text
src/
├── index.js                 # 包入口
├── components/<Name>/       # 一组件一目录（Name.jsx + index.js）
├── styles/
│   ├── tokens.css           # Design Token
│   ├── base.css
│   ├── components.css
│   └── index.css            # 样式总入口
└── utils/cx.js
```

## 脚本

```bash
pnpm install
pnpm build    # Vite library mode → dist/rideos-ui.js
```

## 设计约束

- Token 与壳层样式集中在本库，业务 App 禁止复制改色。
- React / react-dom / @ant-design/icons 为 peerDependencies，不打进产物。
