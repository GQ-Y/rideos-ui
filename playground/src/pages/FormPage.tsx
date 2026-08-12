import {
  AutoComplete,
  Button,
  Cascader,
  ColorPicker,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  Mention,
  message,
  PageCard,
  PageHeader,
  Rate,
  Select,
  Slider,
  Switch,
  TreeSelect,
  Upload,
  useForm,
} from "@rideos-ai/ui";
import type { UploadRequestOptions } from "@rideos-ai/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const REGION_OPTIONS = [
  {
    label: "华东",
    value: "east",
    children: [
      { label: "上海", value: "sh" },
      { label: "杭州", value: "hz" },
      { label: "苏州", value: "sz" },
    ],
  },
  {
    label: "华北",
    value: "north",
    children: [
      { label: "北京", value: "bj" },
      { label: "天津", value: "tj" },
    ],
  },
];

const ORG_TREE = [
  {
    key: "hq",
    title: "RideOS 集团",
    children: [
      { key: "east", title: "华东大区", children: [{ key: "sh", title: "上海运营中心" }] },
      { key: "lab", title: "创新实验室" },
    ],
  },
];

/** 模拟上传:定时推进度,10MB 以上报错 */
function mockRequest({ file, onProgress, onSuccess, onError }: UploadRequestOptions) {
  if (file.size > 10 * 1024 * 1024) {
    onError("文件超过 10MB 上限");
    return;
  }
  let percent = 0;
  const timer = window.setInterval(() => {
    percent += 20;
    if (percent >= 100) {
      window.clearInterval(timer);
      onSuccess();
    } else {
      onProgress(percent);
    }
  }, 260);
}

export function FormPage() {
  const form = useForm();

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "表单与校验"]}
        title="表单与校验"
        description="Form(规则校验/useForm)/ Upload / AutoComplete / Cascader / TreeSelect"
      />
      <PageCard>
        <DemoSection
          title="Form 表单校验"
          desc="required / pattern / min-max / 自定义异步 validator;FormItem 自动注入 value+onChange,失焦即校验,提交时全量校验"
        >
          <div style={{ maxWidth: 460 }}>
            <Form
              form={form}
              initialValues={{ city: "上海", online: true }}
              onFinish={(values) => message.success(`提交成功:${JSON.stringify(values)}`)}
              onFinishFailed={() => message.error("请检查表单填写")}
            >
              <FormItem name="plate" label="车辆牌照" required
                rules={[{ pattern: /^[\u4e00-\u9fa5][A-Z]{2}·\d{5}$/, message: "格式如:沪AD·12345" }]}
              >
                <Input placeholder="沪AD·12345" allowClear />
              </FormItem>
              <FormItem name="phone" label="司机手机号" required
                rules={[{ pattern: /^1\d{10}$/, message: "手机号格式不正确" }]}
              >
                <Input placeholder="11 位手机号" allowClear />
              </FormItem>
              <FormItem name="city" label="运营城市" required>
                <Select options={["上海", "杭州", "苏州", "南京"]} />
              </FormItem>
              <FormItem name="joinDate" label="接入日期" required>
                <DatePicker allowClear />
              </FormItem>
              <FormItem name="seats" label="座位数" rules={[{ min: 2, max: 7, message: "座位数需在 2-7 之间" }]}>
                <InputNumber min={0} max={99} placeholder="选填" />
              </FormItem>
              <FormItem name="online" label="立即上线" valuePropName="checked">
                <Switch aria-label="立即上线" />
              </FormItem>
              <DemoRow>
                <Button type="submit" variant="primary">
                  提交
                </Button>
                <Button onClick={() => form.reset()}>重置</Button>
                <Button
                  onClick={async () => {
                    const result = await form.validate();
                    message.info(result.valid ? "校验通过" : `发现 ${Object.keys(result.errors).length} 个错误`);
                  }}
                >
                  仅校验
                </Button>
              </DemoRow>
            </Form>
          </div>
        </DemoSection>

        <DemoSection title="Upload 上传" desc="按钮与拖拽两种触发;customRequest 对接任意接口(演示为模拟进度,10MB 以上失败)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, maxWidth: 760 }}>
            <Upload multiple customRequest={mockRequest} />
            <Upload drag multiple maxCount={5} customRequest={mockRequest} accept=".png,.jpg,.pdf" />
          </div>
        </DemoSection>

        <DemoSection title="AutoComplete 自动完成" desc="输入联想,本地过滤(远程场景传 filter={false} 自行更新 options)">
          <div style={{ maxWidth: 300 }}>
            <AutoComplete
              options={["上海虹桥站", "上海浦东机场", "上海南站", "杭州东站", "杭州萧山机场"]}
              placeholder="输入 上海 试试"
              allowClear
              aria-label="站点联想"
            />
          </div>
        </DemoSection>

        <DemoSection title="Cascader 级联选择" desc="多列联动,点选叶子提交完整路径">
          <div style={{ maxWidth: 300 }}>
            <Cascader
              options={REGION_OPTIONS}
              placeholder="选择大区 / 城市"
              allowClear
              aria-label="区域"
              onChange={(path) => path && message.info(`已选择:${path.join(" / ")}`)}
            />
          </div>
        </DemoSection>

        <DemoSection title="TreeSelect 树选择" desc="下拉面板内嵌 Tree,可选任意层级节点">
          <div style={{ maxWidth: 300 }}>
            <TreeSelect treeData={ORG_TREE} placeholder="选择归属组织" allowClear aria-label="组织" />
          </div>
        </DemoSection>

        <DemoSection title="ColorPicker 颜色选择 / Mention 提及" desc="SV 面板 + 色相条 + HEX + 预设;文本域输入 @ 触发人员候选">
          <DemoRow>
            <ColorPicker defaultValue="#009a7a" allowClear aria-label="围栏颜色" />
          </DemoRow>
          <div style={{ maxWidth: 460, marginTop: 12 }}>
            <Mention
              placeholder="输入 @ 提及协作人,如 @wang"
              options={[
                { value: "wangjianguo", label: "王建国", desc: "华东运营" },
                { value: "lihaifeng", label: "李海峰", desc: "华北运营" },
                { value: "zhangwei", label: "张伟", desc: "调度中心" },
              ]}
              onSelect={(option) => message.info(`提及了 ${String(option.label)}`)}
              aria-label="工单备注"
            />
          </div>
        </DemoSection>

        <DemoSection title="Slider 滑块 / Rate 评分" desc="拖拽或方向键调节;评分支持半星与悬停预览">
          <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
            <Slider defaultValue={40} showValue aria-label="派单半径" />
            <Slider defaultValue={60} step={10} disabled aria-label="禁用滑块" />
            <DemoRow>
              <Rate defaultValue={4} aria-label="服务评分" />
              <Rate defaultValue={3.5} allowHalf aria-label="半星评分" />
              <Rate defaultValue={5} disabled aria-label="只读评分" />
            </DemoRow>
          </div>
        </DemoSection>
      </PageCard>
    </>
  );
}
