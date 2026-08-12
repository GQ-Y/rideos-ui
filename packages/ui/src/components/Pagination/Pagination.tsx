import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export interface PaginationProps {
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <footer className="rideos-table-pagination">
      <span>共 {total} 条记录</span>
      <div>
        <button
          type="button"
          aria-label="上一页"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          <LeftOutlined />
        </button>
        <button type="button" className="active" aria-current="page">{page}</button>
        <button
          type="button"
          aria-label="下一页"
          disabled={page >= pageCount}
          onClick={() => onPageChange?.(page + 1)}
        >
          <RightOutlined />
        </button>
      </div>
    </footer>
  );
}
