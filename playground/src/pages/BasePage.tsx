import { useState } from "react";
import { BellOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  FormField,
  Input,
  InputNumber,
  InputTag,
  Link,
  PageCard,
  PageHeader,
  Pagination,
  Paragraph,
  RadioGroup,
  Segmented,
  Select,
  Space,
  Statistic,
  StatusBadge,
  Switch,
  Tabs,
  Tag,
  Text,
  Textarea,
  Title,
} from "@rideos/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const TAB_CONTENT: Record<string, string> = {
  info: "「基本信息」页签内容:Tabs 为受控组件,由 activeKey + onChange 驱动。",
  record: "「运营记录」页签内容:切换页签只改变 activeKey。",
  config: "「配置」页签内容:页签项通过 items 传入。",
};

export function BasePage() {
  const [tab, setTab] = useState("info");
  const [page, setPage] = useState(1);
  const [city, setCity] = useState<string | number | null>(null);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "基础组件"]}
        title="基础组件"
        description="Button / Link / Typography / Tag / Badge / Avatar / Segmented / Statistic / InputTag / StatusBadge / Divider / Tabs / Pagination / Input / InputNumber / Radio / Switch / Textarea / Select / FormField"
      />
      <PageCard>
        <DemoSection title="Button 按钮" desc="variant: default | primary;支持原生 button 属性与自定义 className">
          <DemoRow>
            <Button>默认按钮</Button>
            <Button variant="primary">主要按钮</Button>
            <Button variant="primary" className="rideos-btn-danger">
              危险操作
            </Button>
            <Button disabled>禁用按钮</Button>
            <Button variant="primary" disabled>
              主要禁用
            </Button>
            <Button variant="primary">
              <PlusOutlined /> 带图标
            </Button>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Tag 标签 / Badge 徽标 / Avatar 头像" desc="六种语义色标签、数字角标与小红点、三种形态头像">
          <DemoRow>
            <Tag>默认</Tag>
            <Tag tone="brand">品牌</Tag>
            <Tag tone="success">成功</Tag>
            <Tag tone="warning">警告</Tag>
            <Tag tone="danger" closable>
              可关闭
            </Tag>
            <Tag tone="info" bordered>
              描边
            </Tag>
            <Divider direction="vertical" />
            <Badge count={5}>
              <Button>
                <BellOutlined /> 消息
              </Button>
            </Badge>
            <Badge count={120} max={99}>
              <Button>告警</Button>
            </Badge>
            <Badge dot>
              <Button>更新</Button>
            </Badge>
            <Divider direction="vertical" />
            <Avatar text="王建国" />
            <Avatar text="李" size={40} shape="square" />
            <Avatar size={40} />
          </DemoRow>
        </DemoSection>

        <DemoSection title="Link 链接 / Typography 排版" desc="文字链接与标题/文本/段落排版(省略、复制)">
          <DemoRow>
            <Link href="https://example.com" target="_blank">
              外部链接
            </Link>
            <Link onClick={() => undefined}>动作链接</Link>
            <Link danger>危险链接</Link>
            <Link disabled>禁用链接</Link>
          </DemoRow>
          <div style={{ maxWidth: 560, marginTop: 12 }}>
            <Title level={4}>四级标题 Title</Title>
            <Space direction="vertical" size="small">
              <Text>
                普通文本,<Text strong>加粗</Text>、<Text type="success">成功</Text>、
                <Text type="danger">危险</Text>、<Text code>code</Text>、
                <Text delete>删除线</Text>、<Text underline>下划线</Text>
              </Text>
              <Paragraph ellipsis={{ rows: 2 }}>
                这是一段可折叠省略的长文本:RideOS 平台面向集团多业态出行场景,覆盖车辆资产、司机运力、
                订单履约与结算对账全链路,通过统一的组件库与设计规范保障各业务后台体验一致、研发提效。
                此段落设置了两行省略,超出部分将以省略号截断。
              </Paragraph>
              <Paragraph copyable>点击右侧图标复制这段文本(copyable)</Paragraph>
            </Space>
          </div>
        </DemoSection>

        <DemoSection title="Segmented 分段控制器 / Statistic 统计数值 / InputTag 标签输入">
          <DemoRow>
            <Segmented options={["日", "周", "月", "年"]} defaultValue="周" />
            <Segmented options={["列表", "卡片"]} size="small" />
          </DemoRow>
          <DemoRow>
            <div style={{ display: "flex", gap: 32, marginTop: 14 }}>
              <Statistic title="今日订单" value={5731} suffix="单" />
              <Statistic title="完成率" value={98.216} precision={1} suffix="%" />
              <Statistic title="活跃车辆" value={1286} prefix="共" />
            </div>
          </DemoRow>
          <div style={{ maxWidth: 420, marginTop: 14 }}>
            <InputTag defaultValue={["夜班", "机场线"]} placeholder="回车添加标签" max={6} />
          </div>
        </DemoSection>

        <DemoSection title="Radio 单选 / Switch 开关 / InputNumber 数字输入">
          <DemoRow>
            <RadioGroup options={["全部", "运营中", "已停用"]} defaultValue="全部" />
            <Divider direction="vertical" />
            <RadioGroup options={["日", "周", "月"]} defaultValue="周" optionType="button" />
            <Divider direction="vertical" />
            <Switch defaultChecked aria-label="开关" />
            <Switch checkedText="开" uncheckedText="关" aria-label="带文案开关" />
            <Switch loading defaultChecked aria-label="加载中开关" />
            <Divider direction="vertical" />
            <div style={{ width: 140 }}>
              <InputNumber defaultValue={50} min={0} max={999} step={10} aria-label="数量" />
            </div>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Divider 分割线" desc="水平(可带文案)/ 虚线 / 垂直">
          <Divider textAlign="left">车辆信息</Divider>
          <Divider dashed>虚线分组</Divider>
        </DemoSection>

        <DemoSection title="StatusBadge 状态徽标" desc="tone 可显式指定;不指定时按文案关键词自动推断">
          <DemoRow>
            <StatusBadge value="运营中" tone="success" />
            <StatusBadge value="预警" tone="warning" />
            <StatusBadge value="已停用" tone="danger" />
            <StatusBadge value="只读" tone="neutral" />
            <span style={{ color: "#8f959e", fontSize: 12 }}>自动推断:</span>
            <StatusBadge value="待审批" />
            <StatusBadge value="审核失败" />
            <StatusBadge value="草稿" />
            <StatusBadge value="正常" />
          </DemoRow>
        </DemoSection>

        <DemoSection title="Tabs 标签页" desc="受控组件:items + activeKey + onChange">
          <Tabs
            items={[
              { key: "info", label: "基本信息" },
              { key: "record", label: "运营记录" },
              { key: "config", label: "配置" },
            ]}
            activeKey={tab}
            onChange={setTab}
          />
          <p style={{ margin: 0, fontSize: 13, color: "#646a73" }}>{TAB_CONTENT[tab]}</p>
        </DemoSection>

        <DemoSection title="Pagination 分页" desc="total / page / pageSize 受控翻页">
          <Pagination total={128} page={page} pageSize={10} onPageChange={setPage} />
        </DemoSection>

        <DemoSection title="Input 输入框" desc="前后缀 / 清空按钮 / 禁用 / 密码框,onChange 直接回传字符串">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, maxWidth: 780 }}>
            <Input placeholder="基础输入框" />
            <Input placeholder="可清空" allowClear defaultValue="点右侧清空" />
            <Input placeholder="搜索关键字" prefix={<SearchOutlined />} allowClear />
            <Input placeholder="金额" prefix="¥" suffix="元" />
            <Input type="password" placeholder="密码框" />
            <Input placeholder="禁用状态" disabled value="不可编辑" />
          </div>
        </DemoSection>

        <DemoSection title="Textarea 文本域" desc="autoSize 随内容自动增高">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, maxWidth: 780 }}>
            <Textarea placeholder="固定 3 行" />
            <Textarea placeholder="autoSize:输入换行试试" autoSize rows={1} />
          </div>
        </DemoSection>

        <DemoSection
          title="Select 选择器"
          desc="自定义下拉面板(不再是原生 select):键盘导航 / 可清空 / 禁用选项;面板 portal 到 body,不会被滚动容器裁剪"
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, maxWidth: 780 }}>
            <Select
              placeholder="选择运营城市"
              allowClear
              value={city}
              onChange={setCity}
              options={["上海", "杭州", "苏州", "南京"]}
            />
            <Select
              placeholder="含禁用选项"
              options={[
                { label: "快车", value: "express" },
                { label: "专车", value: "premier" },
                { label: "出租车(未开通)", value: "taxi", disabled: true },
              ]}
            />
            <Select placeholder="禁用状态" disabled options={["A", "B"]} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8f959e" }}>
            当前选中:{city == null ? "(空)" : String(city)}
          </p>
        </DemoSection>

        <DemoSection title="FormField 表单字段" desc="label / required / hint / error 组合 Input / Select / Textarea">
          <div style={{ maxWidth: 420 }}>
            <FormField label="车辆牌照" required hint="示例:沪AD·12345">
              <Input placeholder="请输入车牌号" allowClear />
            </FormField>
            <FormField label="运营城市" required>
              <Select placeholder="请选择城市" options={["上海", "杭州", "苏州"]} />
            </FormField>
            <FormField label="联系电话" error="手机号格式不正确">
              <Input defaultValue="1380013" />
            </FormField>
            <FormField label="备注">
              <Textarea rows={3} placeholder="选填" />
            </FormField>
          </div>
        </DemoSection>
      </PageCard>
    </>
  );
}
