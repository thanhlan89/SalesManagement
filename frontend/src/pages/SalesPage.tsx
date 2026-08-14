import { useEffect, useState } from 'react';
import { salesApi, type SalesOrder } from '../api/sales.api';

function SalesPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSalesOrders = async () => {
      setIsLoading(true);
      try {
        const response = await salesApi.listSalesOrders();
        setSalesOrders(response.items);
      } catch (error) {
        console.error('Failed to fetch sales orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'bg-slate-100 text-slate-700',
      'pending': 'bg-amber-100 text-amber-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'completed': 'bg-emerald-100 text-emerald-700',
      'cancelled': 'bg-rose-100 text-rose-700',
    };
    return statusMap[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bán hàng</h1>
          <p className="mt-2 text-slate-600">Theo dõi đơn hàng, doanh thu và pipeline bán hàng</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600">
          + Tạo đơn hàng
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 font-semibold text-slate-700">Số đơn hàng</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Khách hàng</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Tổng tiền</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : salesOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              salesOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-slate-600">{order.customerId.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    ₫{order.totalAmount.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesPage;

