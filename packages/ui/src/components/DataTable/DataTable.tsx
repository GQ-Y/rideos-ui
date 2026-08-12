import type { Key, ReactNode } from "react";
import { Pagination } from "../Pagination";

export interface DataTableColumn<Row extends Record<string, unknown> = Record<string, unknown>> {
  key: string;
  title: ReactNode;
  width?: string | number;
  render?: (value: unknown, row: Row, rowIndex: number) => ReactNode;
}

export interface DataTableProps<Row extends Record<string, unknown> = Record<string, unknown>> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey?: string;
  emptyText?: ReactNode;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

/**
 * 内容列表：表头 + 行渲染 + 底部分页
 * columns: [{ key, title, width?, render?(value, row, index) }]
 */
export function DataTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  rowKey = "id",
  emptyText = "暂无数据",
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
}: DataTableProps<Row>) {
  const count = total ?? rows.length;

  return (
    <div className="rideos-data-table-wrap">
      <table className="rideos-data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={(row[rowKey] as Key | null | undefined) ?? `${index}`}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row, index) : (row[column.key] as ReactNode)}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="rideos-empty-cell">{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination
        total={count}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
