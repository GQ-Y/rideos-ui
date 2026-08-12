# RideOS UI

RideOS 企业级 React PC 组件库,视觉对齐 Go-UI 设计语言(品牌色 `#009A7A`)。pnpm monorepo 管理,全量 TypeScript,类型随包分发。

| 包               | 说明                                                          | 产物             |
| ---------------- | ------------------------------------------------------------- | ---------------- |
| `@rideos-ai/ui`     | 基础与业务组件(后台壳层、列表页、表单、弹层、AI 对话、浮窗等) | ESM + d.ts + CSS |
| `@rideos-ai/charts` | 图表组件(折线/曲线/柱状/饼图),纯 SVG 零第三方依赖             | ESM + d.ts + CSS |

## 特性

- **开箱即用的后台壳层**:AppShell(深色侧栏 + 顶栏 + 多页签)+ 列表页/详情页组件组合
- **图表**:LineChart(折线/平滑曲线/面积)、BarChart(分组/堆叠)、PieChart(饼/环形),图例开关、悬浮提示、自适应宽度
- **AI 能力**:AIChat 对话组件(流式输出、打字指示、失败重试、快捷问题、代码块渲染)+ FloatWidget 四角浮窗,组合即得智能客服
- **表单控件**:Input / Textarea / Select / Checkbox 统一样式(Select 为自定义下拉面板,支持键盘导航与清空)
- **认证页套件**:AuthLayout 品牌布局 + 登录(账号/验证码)/注册/找回密码(三步)/SSO 单点登录/SSO 授权确认,五页开箱即用
- **TypeScript**:严格模式,全部组件导出 Props 类型
- **三套主题**:墨绿(品牌默认)/ 浅色 / 暗色,`data-rideos-theme` 一键切换;Design Token(`--rideos-*` CSS Variables)统一管控,业务侧禁止复制改色
- **工程化**:Vitest 单测、ESLint/Prettier、GitHub Actions CI、Changesets 语义化发版

## 安装

```bash
# npm 公共 registry 发布后
pnpm add @rideos-ai/ui @rideos-ai/charts
# 或 npm i / yarn add

# peer 依赖
pnpm add react react-dom @ant-design/icons
```

> 发布前的本地联调可以用 `pnpm link` 或在业务仓库里以 `file:`/workspace 协议引用本仓库的 `packages/ui`、`packages/charts`。

## 快速上手(React 集成)

入口引入一次样式,组件按名导入即可:

```tsx
// main.tsx
import "@rideos-ai/ui/styles.css";
import "@rideos-ai/charts/styles.css"; // 用到图表时引入

// App.tsx
import { Button, PageCard, PageHeader, StatusBadge } from "@rideos-ai/ui";
import { LineChart } from "@rideos-ai/charts";

export function App() {
  return (
    <PageCard>
      <PageHeader
        breadcrumb={["车辆管理", "车辆台账"]}
        title="车辆台账"
        actions={<Button variant="primary">新增车辆</Button>}
      />
      <StatusBadge value="运营中" tone="success" />
      <LineChart
        categories={["周一", "周二", "周三"]}
        series={[{ name: "订单量", data: [5210, 5630, 6120] }]}
        smooth
        area
      />
    </PageCard>
  );
}
```

### 图表

```tsx
import { BarChart, LineChart, PieChart } from "@rideos-ai/charts";

// 折线 / 曲线(smooth)/ 面积(area)
<LineChart categories={week} series={[{ name: "GMV", data: gmv }]} smooth area />

// 柱状:多系列分组,或 stacked 堆叠
<BarChart categories={cities} series={[today, yesterday]} stacked />

// 饼图 / 环形图(donut 显示中心总计)
<PieChart data={[{ name: "App", value: 4620 }, { name: "小程序", value: 2890 }]} donut />
```

所有图表:图例点击开关系列、悬浮查看数值、宽度自适应容器(也可传 `width` 固定);颜色走 `--rideos-chart-1..8` token,可整体换肤。

### 智能客服(AIChat + FloatWidget)

```tsx
import { AIChat, FloatWidget } from "@rideos-ai/ui";

<FloatWidget position="bottom-right" badge={1} panelTitle="在线客服">
  <AIChat
    showHeader={false}
    height="100%"
    messages={messages} // 受控消息列表
    onSend={callYourLLM} // 接你的大模型/客服接口
    onStop={stopStreaming}
    suggestions={["如何退款?", "如何接入组件库?"]}
  />
</FloatWidget>;
```

流式接入:助手消息置 `status: "streaming"` 并持续更新 `content`,结束改为 `"done"`;等待期用 `"pending"` 显示打字动画,失败置 `"error"` 配合 `onRetry`。`FloatWidget` 支持 `top-left / top-right / bottom-left / bottom-right` 四角停靠。

### 认证页(登录 / 注册 / SSO)

```tsx
import { AuthLayout, LoginForm } from "@rideos-ai/ui";

<AuthLayout slogan="集团级出行运营平台" footer="© 2026 RideOS">
  <LoginForm
    onLogin={(values) => api.login(values)} // 账号密码 / 手机验证码双模式
    onSendCode={(mobile) => api.sendCode(mobile)}
    onForgotPassword={() => router.push("/auth/reset")}
    onRegister={() => router.push("/auth/register")}
    ssoProviders={[{ key: "sso", label: "统一认证" }]}
    onSsoLogin={() => location.assign(SSO_URL)}
  />
</AuthLayout>;
```

同一 `AuthLayout` 中替换面板即可得到注册页(`RegisterForm`)、找回密码页(`ResetPasswordForm`,三步流程)、SSO 独立登录页(`SsoLoginPanel`)与 OAuth 授权确认页(`SsoAuthorizePanel`)。校验内置,服务端错误通过 `errorMessage` 展示。

## 组件一览

**@rideos-ai/ui**

| 分类      | 组件                                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 通用      | Button · Link · Typography(Title/Text/Paragraph) · Divider · Space · Tag · Badge · Avatar · Icon · ConfigProvider · Watermark · Scrollbar                                                                              |
| 布局      | Layout 族 · Row/Col 栅格 · Flex · Container · Splitter                                                                                                                                                                 |
| 壳层      | AppShell · BrandBar · Sidebar · AppPageTabs                                                                                                                                                                            |
| 页面      | PageHeader · PageCard · DetailLayout · ResourceListPage                                                                                                                                                                |
| 导航      | Menu · Breadcrumb · Tabs · Steps · Dropdown · BackTop · Anchor · Affix                                                                                                                                                 |
| 数据      | DataTable · Pagination · Descriptions · Timeline · Statistic · StatStrip · StatusBadge · FilterBar · Tree · Transfer · Skeleton · VirtualList · Empty · Progress · Collapse · Image · Carousel · QRCode                |
| 日期时间  | DatePicker · DateRangePicker · Calendar · TimePicker · Countdown                                                                                                                                                       |
| 反馈/弹层 | Message · Notification · Alert · Tooltip · Popover · Popconfirm · Spin · Result · Modal · Drawer · FloatWidget · Tour                                                                                                  |
| 表单      | Form/FormItem/useForm · Input · InputNumber · InputTag · Textarea · Select · AutoComplete · Cascader · TreeSelect · Checkbox · Radio · Switch · Slider · Rate · Segmented · Upload · ColorPicker · Mention · FormField |
| 业务 Pro  | SearchSelect · ImportExport · PermissionGuard/PermissionProvider/usePermission                                                                                                                                         |
| 认证      | AuthLayout · LoginForm · RegisterForm · ResetPasswordForm · SsoLoginPanel · SsoAuthorizePanel                                                                                                                          |
| AI        | AIChat                                                                                                                                                                                                                 |
| 领域      | GeoFenceEditor                                                                                                                                                                                                         |
| 工具      | cx · setRideosTheme · useFloatingPosition                                                                                                                                                                              |

**@rideos-ai/charts**:LineChart · BarChart · PieChart · RadarChart · GaugeChart · ScatterChart

组件规划(对标 Element Plus / Ant Design)已全量交付:基础组件 99 个 + 图表 6 个;分阶段路线图见团队建设方案文档。

## 主题定制

### 三套主题切换

内置三套主题,通过 `html`(或任意容器)上的 `data-rideos-theme` 属性区分:

| 主题       | 属性值  | 说明                           |
| ---------- | ------- | ------------------------------ |
| 墨绿(默认) | 无属性  | 品牌形态:墨绿侧栏 + 浅色内容区 |
| 浅色       | `light` | 侧栏/导航浅色化,品牌绿点缀     |
| 暗色       | `dark`  | 全局深色                       |

也可使用内置工具函数:

```tsx
import { setRideosTheme, toggleRideosTheme, getRideosTheme } from "@rideos-ai/ui";

setRideosTheme("light"); // 浅色
setRideosTheme("dark"); // 暗色
setRideosTheme("green"); // 墨绿(品牌默认)
toggleRideosTheme(); // 按 墨绿 → 浅色 → 暗色 循环,返回切换后的主题
```

### 品牌换肤

Token 集中在 `@rideos-ai/ui/tokens.css`,业务项目覆盖 CSS 变量即可换肤,禁止在业务侧复制修改样式:

```css
:root {
  --rideos-brand: #0057ff; /* 品牌色 */
  --rideos-radius: 6px; /* 圆角 */
  --rideos-chart-1: #0057ff; /* 图表主色 */
}
```

## 本地开发

```bash
pnpm install          # 安装(.npmrc 已配置 npmmirror 镜像,私服请自行修改)
pnpm dev              # 启动 playground 演示站(http://localhost:5173)
pnpm test             # 全部单元测试(Vitest + Testing Library)
pnpm typecheck        # 全仓类型检查
pnpm lint             # ESLint
pnpm build            # 构建 @rideos-ai/* 全部包
pnpm verify           # CI 全门禁 + 独立 tarball 的 React 18/19 消费验证
pnpm gen MyComponent  # 组件脚手架:生成目录/测试/导出模板
```

仓库结构:

```text
├── packages/
│   ├── ui/            # @rideos-ai/ui     组件源码 src/components/<Name>/
│   └── charts/        # @rideos-ai/charts 图表源码
├── playground/        # 本地演示站(壳层 + 图表 + AI 对话 + 客服浮窗)
├── scripts/gen.mjs    # 组件脚手架
├── .github/workflows/ # CI:lint → typecheck → test → build
└── .changeset/        # 版本与 CHANGELOG 管理
```

## 版本发布(npm)

采用 [Changesets](https://github.com/changesets/changesets) 语义化发版:

```bash
pnpm changeset            # 1. 记录本次变更(选择包与版本级别,写变更说明)
pnpm version-packages     # 2. 消费 changeset,更新版本号与 CHANGELOG
pnpm release              # 3. 构建并发布到 registry
```

两个包按公共 scoped package 配置，固定发布到 npm 官方 registry。日常版本由 Changesets release PR 管理；真正发布只能从受保护的 `Publish to npm` workflow 手动触发，并要求 npm Trusted Publishing 与 GitHub `npm` environment 审批。

## 质量约定

- 新组件必须:导出 Props 类型、附带单测、在 playground 增加演示、样式只消费 token
- 提交前本地跑 `pnpm lint && pnpm typecheck && pnpm test`,CI 全绿方可合并
- API 破坏性变更需在 changeset 中标记 major 并写迁移说明

## License

Apache-2.0。许可证包含明确的专利授权与专利诉讼终止条款；RideOS 名称和标识的商标权不随许可证授予，详见 `LICENSE` 和 `NOTICE`。
