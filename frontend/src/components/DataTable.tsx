export interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
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
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-4 font-semibold text-slate-700 ${col.width ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                Đang tải...
              </td>
            </tr>
          ) : isEmpty || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="border-b border-slate-100 transition hover:bg-slate-50"
                onClick={() => onRowClick?.(item)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-6 py-4 text-slate-900 ${col.width ?? ''}`}>
                    {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
