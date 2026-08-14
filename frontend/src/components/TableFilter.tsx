import { useState } from 'react';
import { Input, Button } from './FormControls';

interface TableFilterProps {
  onSearch: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  placeholder?: string;
  filterOptions?: { key: string; label: string; type: 'text' | 'select'; options?: { value: string; label: string }[] }[];
}

function TableFilter({ onSearch, onFilter, placeholder = 'Tìm kiếm...', filterOptions }: TableFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilters({});
    onSearch('');
    onFilter?.({});
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-2xl bg-slate-100 px-4 py-3 font-medium text-slate-700 hover:bg-slate-200 transition"
        >
          🔽 Bộ lọc
        </button>
      </div>

      {showFilters && filterOptions && filterOptions.length > 0 && (
        <div className="grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2 lg:grid-cols-3">
          {filterOptions.map((filter) => (
            <div key={filter.key}>
              {filter.type === 'text' ? (
                <Input
                  label={filter.label}
                  type="text"
                  value={filters[filter.key] ?? ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.label}
                />
              ) : (
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
                  value={filters[filter.key] ?? ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">-- {filter.label} --</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          <div className="flex items-end">
            <Button variant="secondary" size="md" onClick={handleReset} className="w-full">
              Đặt lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableFilter;
