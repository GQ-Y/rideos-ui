import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { Descriptions } from "../Descriptions";
import { Drawer } from "../Drawer";
import { FilterBar } from "../FilterBar";
import { FormField } from "../FormField";
import { Modal } from "../Modal";
import { PageCard } from "../PageCard";
import { PageHeader } from "../PageHeader";
import { StatStrip } from "../StatStrip";
import { StatusBadge } from "../StatusBadge";
import { Tabs } from "../Tabs";

function renderCell(column, value, row) {
  if (column.render) return column.render(value, row);
  if (column.type === "status") return <StatusBadge value={value} />;
  return value ?? "—";
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
}) {
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({});
  const [activeStat, setActiveStat] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(tabs?.[0]?.key);
  const [rows, setRows] = useState(initialRows);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState({});
  const [confirm, setConfirm] = useState(null);
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
      render: (value, row) => renderCell(column, value, row),
    })),
    {
      key: "_actions",
      title: "操作",
      width: "200px",
      render: (_, row) => (
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
  ], [columns]);

  function flash(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openCreate() {
    const seed = {};
    formFields.forEach((field) => { seed[field.key] = field.defaultValue ?? ""; });
    setForm(seed);
    setDrawer({ mode: "create" });
  }

  function openEdit(row) {
    setForm({ ...row });
    setDrawer({ mode: "edit", row });
  }

  function openDetail(row) {
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
    setRows((current) => current.map((item) => (
      item[rowKey] === confirm[rowKey]
        ? { ...item, status: confirm.nextStatus || "已处理", updatedAt: "刚刚" }
        : item
    )));
    flash(`${confirm.confirmAction || "操作"}成功（Mock）`);
    setConfirm(null);
    setReason("");
  }

  const detailItems = (drawer?.row && (detailFields || formFields).map((field) => ({
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
      {tabs?.length > 0 && (
        <Tabs items={tabs} activeKey={tab} onChange={(key) => { setTab(key); setPage(1); }} />
      )}
      {stats?.length > 0 && (
        <StatStrip
          items={stats}
          activeKey={activeStat}
          onSelect={(item) => {
            setActiveStat(item.key);
            setFilters((current) => ({ ...current, ...(item.filter || {}) }));
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
              <Button onClick={() => onNavigate(drawer.row.navigateTo)}>相关跳转</Button>
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
                  <select
                    value={form[field.key] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  >
                    <option value="">请选择</option>
                    {(field.options || []).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={form[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={form[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
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
          <textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="必填，写入操作审计" />
        </FormField>
      </Modal>
    </PageCard>
  );
}

ResourceListPage.propTypes = {
  breadcrumb: PropTypes.array,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  rowKey: PropTypes.string,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  tabs: PropTypes.array,
  createLabel: PropTypes.string,
  formFields: PropTypes.array,
  detailFields: PropTypes.array,
  allowCreate: PropTypes.bool,
  confirmTitle: PropTypes.string,
  confirmHint: PropTypes.string,
  onNavigate: PropTypes.func,
  extraActions: PropTypes.node,
  stats: PropTypes.array,
  filterFields: PropTypes.array,
  onRowDetail: PropTypes.func,
};
