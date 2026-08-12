import { useState } from "react";
import {
  CompassOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Drawer,
  Dropdown,
  FloatWidget,
  FormField,
  Input,
  message,
  Modal,
  notification,
  PageCard,
  PageHeader,
  Popconfirm,
  Popover,
  Result,
  Spin,
  Textarea,
  Tooltip,
  Tour,
} from "@rideos/ui";
import { DemoRow, DemoSection } from "./DemoSection";

export function FeedbackPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [drawerRight, setDrawerRight] = useState(false);
  const [drawerLeft, setDrawerLeft] = useState(false);
  const [floatOpen, setFloatOpen] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "反馈与弹层"]}
        title="反馈与弹层"
        description="Message / Alert / Tooltip / Popover / Popconfirm / Dropdown / Spin / Result / Modal / Drawer / FloatWidget"
      />
      <PageCard>
        <DemoSection title="Tour 漫游式引导" desc="聚光灯高亮页面元素,分步引导新功能">
          <DemoRow>
            <Button variant="primary" onClick={() => setTourOpen(true)}>
              <CompassOutlined /> 开始引导
            </Button>
          </DemoRow>
          <Tour
            open={tourOpen}
            onClose={() => setTourOpen(false)}
            onFinish={() => message.success("引导完成,开始使用吧")}
            steps={[
              {
                target: "#tour-message",
                title: "全局提示",
                description: "操作结果用 message 轻提示,不打断流程。",
              },
              {
                target: "#tour-alert",
                title: "警告提示",
                description: "页面级的静态信息用 Alert 常驻展示。",
              },
              { title: "开始体验", description: "以上就是反馈体系的核心组件。" },
            ]}
          />
        </DemoSection>

        <div id="tour-message">
          <DemoSection title="Message 全局提示" desc="命令式 API:message.success / error / warning / info">
          <DemoRow>
            <Button onClick={() => message.success("保存成功")}>成功提示</Button>
            <Button onClick={() => message.error("网络异常,请重试")}>失败提示</Button>
            <Button onClick={() => message.warning("余额即将不足")}>警告提示</Button>
            <Button onClick={() => message.info("已切换到杭州站点")}>信息提示</Button>
          </DemoRow>
          </DemoSection>
        </div>

        <DemoSection title="Notification 通知提醒框" desc="命令式角落通知:标题 + 描述,四个方位,duration=0 常驻">
          <DemoRow>
            <Button
              onClick={() =>
                notification.success({ title: "导出完成", description: "运营周报已生成,点击下载查看。" })
              }
            >
              右上通知
            </Button>
            <Button
              onClick={() =>
                notification.warning({
                  title: "围栏告警",
                  description: "3 辆车在服务区边界外停放,请及时处理。",
                  placement: "bottom-right",
                })
              }
            >
              右下通知
            </Button>
            <Button
              onClick={() =>
                notification.error({ title: "对账失败", description: "存在 2 笔差异,已暂停自动结算。", duration: 0 })
              }
            >
              常驻通知(手动关)
            </Button>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Alert 警告提示" desc="四种语义,支持描述/操作区/可关闭">
          <div id="tour-alert" style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            <Alert type="success" message="围栏配置已生效" closable />
            <Alert type="info" message="本周日 02:00-04:00 结算服务升级" action={<Button>查看公告</Button>} />
            <Alert type="warning" message="3 辆车辆保险即将到期" description="请在「综合场景示例」中筛选处理,逾期将自动下线。" closable />
            <Alert type="error" message="昨日对账存在 2 笔差异" />
          </div>
        </DemoSection>

        <DemoSection title="Tooltip / Popover / Popconfirm" desc="悬停文字提示 / 富内容气泡 / 轻量二次确认">
          <DemoRow>
            <Tooltip title="导出当前筛选结果为 Excel">
              <Button>
                <ExportOutlined /> 悬停看提示
              </Button>
            </Tooltip>
            <Popover
              title="车辆概要"
              content={
                <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                  沪AD·10086 · 秦PLUS EV
                  <br />
                  司机:王建国 · 今日 23 单
                </div>
              }
            >
              <Button>悬停看气泡</Button>
            </Popover>
            <Popconfirm
              title="确认停用该车辆?"
              description="停用后将不再接单"
              danger
              onConfirm={() => message.success("已停用")}
            >
              <Button className="rideos-btn-danger" variant="primary">
                <StopOutlined /> 停用(气泡确认)
              </Button>
            </Popconfirm>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Dropdown 下拉菜单" desc="任意触发器 + 菜单项(图标/危险项/分隔线)">
          <DemoRow>
            <Dropdown
              items={[
                { key: "edit", label: "编辑", icon: EditOutlined },
                { key: "export", label: "导出", icon: ExportOutlined },
                { key: "disable", label: "停用", icon: StopOutlined, danger: true, divider: true },
              ]}
              onSelect={(key) => message.info(`点击了菜单项:${key}`)}
            >
              <Button>
                更多操作 <DownOutlined />
              </Button>
            </Dropdown>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Spin 加载" desc="独立指示器或包裹内容显示遮罩">
          <DemoRow>
            <Button onClick={() => setSpinning((v) => !v)}>{spinning ? "完成加载" : "重新加载"}</Button>
          </DemoRow>
          <div style={{ maxWidth: 420, marginTop: 12 }}>
            <Spin spinning={spinning} tip="数据加载中...">
              <div style={{ padding: 20, border: "1px solid var(--rideos-n250)", borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#646a73" }}>
                  这里是业务内容区域,加载时会覆盖半透明遮罩与转圈指示器。
                </p>
              </div>
            </Spin>
          </div>
        </DemoSection>

        <DemoSection title="Result 结果页" desc="操作结果与异常状态(success/error/403/404/500)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <Result
              status="success"
              title="提现申请已提交"
              subTitle="预计 1-3 个工作日到账"
              extra={<Button variant="primary">查看进度</Button>}
            />
            <Result status="404" title="页面不存在" subTitle="你访问的页面可能已下线" extra={<Button>返回首页</Button>} />
          </div>
        </DemoSection>

        <DemoSection title="Modal 对话框" desc="open 受控;footer 缺省提供 取消/确定,danger 渲染红色确认钮">
          <DemoRow>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              打开基础弹窗
            </Button>
            <Button className="rideos-btn-danger" variant="primary" onClick={() => setDangerOpen(true)}>
              危险确认弹窗
            </Button>
          </DemoRow>
          <Modal open={modalOpen} title="编辑车辆信息" onClose={() => setModalOpen(false)} width={480}>
            <p className="rideos-modal-hint">Modal 内可以放任意内容,例如一个小表单:</p>
            <FormField label="车辆牌照" required>
              <Input defaultValue="沪AD·10086" allowClear />
            </FormField>
            <FormField label="备注">
              <Textarea rows={2} placeholder="选填" />
            </FormField>
          </Modal>
          <Modal
            open={dangerOpen}
            title="停用车辆"
            danger
            width={420}
            onClose={() => setDangerOpen(false)}
          >
            <p className="rideos-modal-hint">停用后车辆将不再接单,确认继续?</p>
          </Modal>
        </DemoSection>

        <DemoSection title="Drawer 抽屉" desc="placement: right | left;footer 可自定义">
          <DemoRow>
            <Button variant="primary" onClick={() => setDrawerRight(true)}>
              右侧抽屉
            </Button>
            <Button onClick={() => setDrawerLeft(true)}>左侧抽屉</Button>
          </DemoRow>
          <Drawer
            open={drawerRight}
            title="新建司机"
            width={440}
            onClose={() => setDrawerRight(false)}
            footer={
              <>
                <Button onClick={() => setDrawerRight(false)}>取消</Button>
                <Button variant="primary" onClick={() => setDrawerRight(false)}>
                  提交
                </Button>
              </>
            }
          >
            <FormField label="姓名" required>
              <Input placeholder="请输入姓名" allowClear />
            </FormField>
            <FormField label="手机号" required hint="用于接收调度通知">
              <Input placeholder="请输入手机号" allowClear />
            </FormField>
          </Drawer>
          <Drawer
            open={drawerLeft}
            title="筛选条件"
            placement="left"
            width={360}
            onClose={() => setDrawerLeft(false)}
          >
            <p style={{ margin: 0, color: "#646a73", fontSize: 13 }}>
              左侧抽屉常用于放置高级筛选或导航。
            </p>
          </Drawer>
        </DemoSection>

        <DemoSection
          title="FloatWidget 四角浮窗"
          desc="position: top-left / top-right / bottom-left / bottom-right;右下角的在线客服即全局 FloatWidget + AIChat 组合"
        >
          <DemoRow>
            <Button variant="primary" onClick={() => setFloatOpen(true)}>
              打开左上角浮窗演示
            </Button>
            <span style={{ color: "#8f959e", fontSize: 12 }}>
              右下角常驻的客服气泡也是本组件(badge 角标 + Esc 关闭)。
            </span>
          </DemoRow>
          <FloatWidget
            position="top-left"
            open={floatOpen}
            onOpenChange={setFloatOpen}
            panelTitle="公告"
            panelWidth={320}
            panelHeight={220}
          >
            <div style={{ padding: 16, fontSize: 13, color: "#2b2f36", lineHeight: 1.7 }}>
              FloatWidget 可停靠四个角,面板内容完全自定义。
              触发钮支持 badge 角标、受控/非受控展开,Esc 可关闭。
            </div>
          </FloatWidget>
        </DemoSection>
      </PageCard>
    </>
  );
}
