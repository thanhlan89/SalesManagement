import { useEffect, useState } from 'react';
import { inventoryApi, type Warehouse } from '../api/inventory.api';

function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setIsLoading(true);
      try {
        const response = await inventoryApi.listWarehouses();
        setWarehouses(response.items);
      } catch (error) {
        console.error('Failed to fetch warehouses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kho bãi</h1>
          <p className="mt-2 text-slate-600">Theo dõi tồn kho và điều phối hàng hóa</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600">
          + Thêm kho
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500">Đang tải...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900">{warehouse.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{warehouse.location}</p>
              {warehouse.capacity && (
                <p className="mt-4 text-sm text-slate-700">
                  <span className="font-medium">Sức chứa:</span> {warehouse.capacity.toLocaleString('vi-VN')} đơn vị
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WarehousePage;

