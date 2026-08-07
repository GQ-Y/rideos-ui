import PropTypes from "prop-types";
import { Pagination } from "../Pagination";

/**
 * 内容列表：表头 + 行渲染 + 底部分页
 * columns: [{ key, title, width?, render?(value, row, index) }]
 */
export function DataTable({
  columns,
  rows,
  rowKey = "id",
  emptyText = "暂无数据",
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
}) {
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
            <tr key={row[rowKey] ?? `${index}`}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row, index) : row[column.key]}
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

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.node.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    render: PropTypes.func,
  })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowKey: PropTypes.string,
  emptyText: PropTypes.node,
  total: PropTypes.number,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
};
