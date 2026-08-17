export interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'Không có dữ liệu',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-5 py-4 font-semibold text-slate-700 ${col.width ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : isEmpty || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                  onClick={() => onRowClick?.(item)}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-5 py-4 text-slate-800 ${col.width ?? ''}`}
                    >
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
