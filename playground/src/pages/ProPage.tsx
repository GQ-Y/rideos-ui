import { useState } from "react";
import {
  Alert,
  Button,
  Divider,
  ImportExport,
  message,
  PageCard,
  PageHeader,
  PermissionGuard,
  PermissionProvider,
  SearchSelect,
  Switch,
} from "@rideos-ai/ui";
import type { SearchSelectOption } from "@rideos-ai/ui";
import { DemoRow, DemoSection } from "./DemoSection";

const ALL_DRIVERS: SearchSelectOption[] = [
  { value: "d1", label: "王建国", desc: "沪AD·10086 · 华东" },
  { value: "d2", label: "王海峰", desc: "沪AD·10223 · 华东" },
  { value: "d3", label: "李建军", desc: "京BD·33021 · 华北" },
  { value: "d4", label: "张伟", desc: "杭AD·55190 · 华东" },
  { value: "d5", label: "陈晓东", desc: "苏ED·77045 · 华东" },
];

export function ProPage() {
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState<string | number | null>(null);
  const [canDelete, setCanDelete] = useState(false);

  function searchDrivers(keyword: string) {
    if (!keyword) {
      setOptions([]);
      return;
    }
    setLoading(true);
    /* 模拟远程接口延迟 */
    window.setTimeout(() => {
      setOptions(ALL_DRIVERS.filter((item) => String(item.label).includes(keyword)));
      setLoading(false);
    }, 600);
  }

  const permissions = ["vehicle:export", "vehicle:import", ...(canDelete ? ["vehicle:delete"] : [])];

  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "业务 Pro"]}
        title="业务 Pro 组件"
        description="SearchSelect 远程搜索 / ImportExport 导入导出 / PermissionGuard 权限控制"
      />
      <PageCard>
        <DemoSection
          title="SearchSelect 远程搜索选择"
          desc="输入防抖 300ms 触发 onSearch,业务侧请求接口回填 options(演示为 600ms 模拟延迟;试试输入「王」)"
        >
          <div style={{ maxWidth: 340 }}>
            <SearchSelect
              onSearch={searchDrivers}
              options={options}
              loading={loading}
              value={driver}
              onChange={(next, option) => {
                setDriver(next);
                if (option) message.success(`已选择司机:${String(option.label)}`);
              }}
              placeholder="搜索司机姓名"
              aria-label="搜索司机"
            />
          </div>
        </DemoSection>

        <DemoSection
          title="ImportExport 导入导出"
          desc="导出直接回调;导入打开弹窗(模板下载 + 拖拽上传 + 结果反馈,演示为模拟导入)"
        >
          <ImportExport
            onExport={() => message.success("已开始导出,完成后通知你")}
            onDownloadTemplate={() => message.info("模板下载(演示)")}
            onImport={(file) =>
              new Promise((resolve) =>
                window.setTimeout(
                  () =>
                    resolve({
                      success: 18,
                      failed: 2,
                      errors: [`${file.name} 第 3 行:手机号格式错误`, `${file.name} 第 9 行:城市不存在`],
                    }),
                  900,
                ),
              )
            }
          />
        </DemoSection>

        <DemoSection
          title="PermissionGuard 权限控制"
          desc="PermissionProvider 注入权限码,PermissionGuard 按钮/区块级控制;切换开关体验授权变化"
        >
          <DemoRow>
            <Switch
              checked={canDelete}
              onChange={setCanDelete}
              checkedText="有删除权限"
              uncheckedText="无删除权限"
              aria-label="切换删除权限"
            />
          </DemoRow>
          <Divider />
          <PermissionProvider permissions={permissions}>
            <DemoRow>
              <PermissionGuard permission="vehicle:export">
                <Button>导出车辆</Button>
              </PermissionGuard>
              <PermissionGuard permission="vehicle:import">
                <Button>导入车辆</Button>
              </PermissionGuard>
              <PermissionGuard
                permission="vehicle:delete"
                fallback={
                  <Button disabled title="缺少 vehicle:delete 权限">
                    删除车辆(无权限)
                  </Button>
                }
              >
                <Button variant="primary" className="rideos-btn-danger">
                  删除车辆
                </Button>
              </PermissionGuard>
            </DemoRow>
            <div style={{ marginTop: 12, maxWidth: 560 }}>
              <PermissionGuard
                permission="finance:view"
                fallback={<Alert type="warning" message="你没有查看结算数据的权限(finance:view)" />}
              >
                <Alert type="success" message="结算数据区块" />
              </PermissionGuard>
            </div>
          </PermissionProvider>
        </DemoSection>
      </PageCard>
    </>
  );
}
