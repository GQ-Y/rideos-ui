import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { Descriptions } from "../Descriptions";
import { Drawer } from "../Drawer";
import { FilterBar } from "../FilterBar";
import type { FilterField, FilterFieldValue } from "../FilterBar";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { InputNumber } from "../InputNumber";
import { Modal } from "../Modal";
import { Select } from "../Select";
import { Textarea } from "../Textarea";
import { PageCard } from "../PageCard";
import { PageHeader } from "../PageHeader";
import { StatStrip } from "../StatStrip";
import { StatusBadge } from "../StatusBadge";
import { Tabs } from "../Tabs";

/** 行数据单元格值 */
export type ResourceRowValue = string | number | null | undefined;

/**
 * 列表行数据。除业务字段外支持以下约定字段:
 * - tab:所属页签 key(配合 tabs 过滤)
 * - confirmAction:行上确认操作按钮文案(如 停用/删除)
 * - nextStatus:确认操作后写入的状态
 * - navigateTo:详情抽屉"相关跳转"目标路径
 */
export type ResourceRow = Record<string, ResourceRowValue>;

/** 列定义(type 为 status 时用 StatusBadge 渲染) */
export interface ResourceColumn {
  key: string;
  title: ReactNode;
  width?: string | number;
  type?: string;
  render?: (value: ResourceRowValue, row: ResourceRow) => ReactNode;
}

/** 页签定义 */
export interface ResourceListTab {
  key: string;
  label: ReactNode;
}

/** 新建/编辑表单字段定义 */
export interface ResourceFormField {
  key: string;
  label: ReactNode;
  /** 控件类型,默认 text */
  type?: "text" | "number" | "select" | "textarea";
  required?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  /** select 选项 */
  options?: string[];
  defaultValue?: ResourceRowValue;
}

/** 详情字段定义(缺省复用 formFields) */
export interface ResourceDetailField {
  key: string;
  label: ReactNode;
}

/** 统计卡片定义(点击可联动筛选) */
export interface ResourceStat {
  key: string;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** 点击后合并进筛选条件 */
  filter?: Record<string, FilterFieldValue>;
}

type ResourceDrawerState =
  | { mode: "create"; row?: undefined }
  | { mode: "edit"; row: ResourceRow }
  | { mode: "detail"; row: ResourceRow };

function renderCell(column: ResourceColumn, value: ResourceRowValue, row: ResourceRow): ReactNode {
  if (column.render) return column.render(value, row);
  if (column.type === "status") return <StatusBadge value={value} />;
  return value ?? "—";
}

export interface ResourceListPageProps {
  breadcrumb?: ReactNode[];
  title: ReactNode;
  description?: ReactNode;
  columns: ResourceColumn[];
  /** 初始行数据(组件内部维护增删改,Mock) */
  rows: ResourceRow[];
  rowKey?: string;
  /** 关键字搜索匹配的字段 */
  searchKeys?: string[];
  placeholder?: string;
  /** 可选页签 */
  tabs?: ResourceListTab[];
  createLabel?: string;
  /** 新建/编辑表单字段 */
  formFields?: ResourceFormField[];
  /** 详情字段(缺省用 formFields) */
  detailFields?: ResourceDetailField[];
  allowCreate?: boolean;
  confirmTitle?: string;
  confirmHint?: string;
  onNavigate?: (path: string) => void;
  extraActions?: ReactNode;
  /** 统计卡片 */
  stats?: ResourceStat[];
  /** 筛选字段 */
  filterFields?: FilterField[];
  /** 自定义行详情回调(优先于内置详情抽屉) */
  onRowDetail?: (row: ResourceRow) => void;
}

/**
 * 标准资源列表页模板：筛选 + 表 + 抽屉表单/详情 + 确认弹窗 + 可选 Tabs
 */
export function ResourceListPage({
  breadcrumb,
  title,
  description,
  columns,
  rows: initialRows,
  rowKey = "id",
  searchKeys = ["name", "code"],
  placeholder = "关键字",
  tabs,
  createLabel = "新建",
  formFields = [],
  detailFields,
  allowCreate = true,
  confirmTitle = "确认操作",
  confirmHint = "请填写原因后确认。",
  onNavigate,
  extraActions,
  stats,
  filterFields = [],
  onRowDetail,
}: ResourceListPageProps) {
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<Record<string, FilterFieldValue>>({});
  const [activeStat, setActiveStat] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(tabs?.[0]?.key);
  const [rows, setRows] = useState(initialRows);
  const [drawer, setDrawer] = useState<ResourceDrawerState | null>(null);
  const [form, setForm] = useState<Record<string, ResourceRowValue>>({});
  const [confirm, setConfirm] = useState<ResourceRow | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    let list = rows;
    if (tabs?.length && tab) {
      list = list.filter((row) => !row.tab || row.tab === tab);
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        const [from, to] = value;
        list = list.filter((row) => {
          const raw = String(row[key] ?? "");
          if (from && raw < from) return false;
          if (to && raw > to) return false;
          return true;
        });
        return;
      }
      list = list.filter((row) => String(row[key] ?? "") === String(value));
    });
    const q = keyword.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)));
  }, [rows, keyword, searchKeys, tabs, tab, filters]);

  const pageRows = filtered.slice((page - 1) * 10, page * 10);

  const tableColumns = useMemo(() => [
    ...columns.map((column) => ({
      ...column,
      render: (value: unknown, row: ResourceRow) => renderCell(column, value as ResourceRowValue, row),
    })),
    {
      key: "_actions",
      title: "操作",
      width: "200px",
      render: (_: unknown, row: ResourceRow) => (
        <div className="rideos-row-actions">
          <button type="button" onClick={() => (onRowDetail ? onRowDetail(row) : openDetail(row))}>详情</button>
          <button type="button" onClick={() => openEdit(row)}>编辑</button>
          {row.confirmAction && (
            <button type="button" className="danger" onClick={() => setConfirm(row)}>
              {row.confirmAction}
            </button>
          )}
        </div>
      ),
    },
  ], [columns, onRowDetail]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openCreate() {
    const seed: Record<string, ResourceRowValue> = {};
    formFields.forEach((field) => { seed[field.key] = field.defaultValue ?? ""; });
    setForm(seed);
    setDrawer({ mode: "create" });
  }

  function openEdit(row: ResourceRow) {
    setForm({ ...row });
    setDrawer({ mode: "edit", row });
  }

  function openDetail(row: ResourceRow) {
    setDrawer({ mode: "detail", row });
  }

  function saveForm() {
    for (const field of formFields) {
      if (field.required && !String(form[field.key] ?? "").trim()) {
        flash(`请填写${field.label}`);
        return;
      }
    }
    if (drawer?.mode === "create") {
      const id = `new-${Date.now()}`;
      setRows((current) => [{ id, status: "草稿", updatedAt: "刚刚", ...form }, ...current]);
      flash("已创建（Mock）");
    } else if (drawer?.mode === "edit") {
      setRows((current) => current.map((item) => (
        item[rowKey] === drawer.row[rowKey] ? { ...item, ...form, updatedAt: "刚刚" } : item
      )));
      flash("已保存（Mock）");
    }
    setDrawer(null);
  }

  function submitConfirm() {
    if (!reason.trim()) {
      flash("请填写原因");
      return;
    }
    if (!confirm) return;
    setRows((current) => current.map((item) => (
      item[rowKey] === confirm[rowKey]
        ? { ...item, status: confirm.nextStatus || "已处理", updatedAt: "刚刚" }
        : item
    )));
    flash(`${confirm.confirmAction || "操作"}成功（Mock）`);
    setConfirm(null);
    setReason("");
  }

  const detailFieldList: ResourceDetailField[] = detailFields || formFields;
  const detailItems = (drawer?.row && detailFieldList.map((field) => ({
    key: field.key,
    label: field.label,
    value: drawer.row[field.key],
  }))) || [];

  return (
    <PageCard>
      <PageHeader
        breadcrumb={breadcrumb}
        title={title}
        description={description}
        actions={(
          <div className="rideos-header-actions">
            {extraActions}
            {allowCreate && <Button variant="primary" onClick={openCreate}>{createLabel}</Button>}
          </div>
        )}
      />
      {toast && <div className="rideos-toast">{toast}</div>}
      {tabs && tabs.length > 0 && (
        <Tabs items={tabs} activeKey={tab} onChange={(key: string) => { setTab(key); setPage(1); }} />
      )}
      {stats && stats.length > 0 && (
        <StatStrip
          items={stats}
          activeKey={activeStat}
          onSelect={(item) => {
            const stat = item as ResourceStat;
            setActiveStat(stat.key);
            setFilters((current) => ({ ...current, ...(stat.filter || {}) }));
            setPage(1);
          }}
        />
      )}
      <FilterBar
        keyword={keyword}
        onKeywordChange={(value) => { setKeyword(value); setPage(1); }}
        placeholder={placeholder}
        fields={filterFields}
        values={filters}
        onFieldChange={(key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setPage(1);
        }}
        onReset={() => {
          setKeyword("");
          setFilters({});
          setActiveStat("");
          setPage(1);
        }}
        onSubmit={() => setPage(1)}
      />
      <DataTable
        columns={tableColumns}
        rows={pageRows}
        rowKey={rowKey}
        total={filtered.length}
        page={page}
        pageSize={10}
        onPageChange={setPage}
      />

      <Drawer
        open={Boolean(drawer)}
        title={drawer?.mode === "create" ? createLabel : drawer?.mode === "edit" ? `编辑 · ${title}` : `详情 · ${title}`}
        onClose={() => setDrawer(null)}
        width={520}
        footer={drawer?.mode === "detail" ? (
          <>
            <Button onClick={() => setDrawer(null)}>关闭</Button>
            <Button variant="primary" onClick={() => openEdit(drawer.row)}>编辑</Button>
            {onNavigate && drawer?.row?.navigateTo && (
              <Button onClick={() => onNavigate(String(drawer.row.navigateTo))}>相关跳转</Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={() => setDrawer(null)}>取消</Button>
            <Button variant="primary" onClick={saveForm}>保存</Button>
          </>
        )}
      >
        {drawer?.mode === "detail" ? (
          <Descriptions items={detailItems} column={1} />
        ) : (
          <div className="rideos-form-grid">
            {formFields.map((field) => (
              <FormField key={field.key} label={field.label} required={field.required} hint={field.hint}>
                {field.type === "select" ? (
                  <Select
                    value={form[field.key] == null || form[field.key] === "" ? null : form[field.key]}
                    options={field.options || []}
                    placeholder="请选择"
                    onChange={(next) =>
                      setForm((current) => ({ ...current, [field.key]: next == null ? "" : String(next) }))
                    }
                  />
                ) : field.type === "textarea" ? (
                  <Textarea
                    rows={4}
                    value={String(form[field.key] ?? "")}
                    placeholder={field.placeholder}
                    onChange={(next) => setForm((current) => ({ ...current, [field.key]: next }))}
                  />
                ) : field.type === "number" ? (
                  <InputNumber
                    value={
                      form[field.key] == null || form[field.key] === ""
                        ? null
                        : Number(form[field.key])
                    }
                    placeholder={field.placeholder}
                    onChange={(next) =>
                      setForm((current) => ({ ...current, [field.key]: next ?? "" }))
                    }
                  />
                ) : (
                  <Input
                    value={String(form[field.key] ?? "")}
                    placeholder={field.placeholder}
                    onChange={(next) => setForm((current) => ({ ...current, [field.key]: next }))}
                  />
                )}
              </FormField>
            ))}
          </div>
        )}
      </Drawer>

      <Modal
        open={Boolean(confirm)}
        title={confirmTitle}
        danger
        onClose={() => { setConfirm(null); setReason(""); }}
        footer={(
          <>
            <Button onClick={() => { setConfirm(null); setReason(""); }}>取消</Button>
            <Button variant="primary" className="rideos-btn-danger" onClick={submitConfirm}>确认</Button>
          </>
        )}
      >
        <p className="rideos-modal-hint">{confirmHint}</p>
        <p className="rideos-modal-hint">对象：{confirm?.name || confirm?.code || confirm?.[rowKey]}</p>
        <FormField label="原因" required>
          <Textarea rows={3} value={reason} onChange={setReason} placeholder="必填,写入操作审计" />
        </FormField>
      </Modal>
    </PageCard>
  );
}
