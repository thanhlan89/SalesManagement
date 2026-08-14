import { useEffect, useState } from 'react';

function AccountingPage() {
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Placeholder for invoices and payments API
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kế toán</h1>
          <p className="mt-2 text-slate-600">Quản lý hóa đơn, thanh toán và báo cáo tài chính</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600">
          + Tạo hóa đơn
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Hóa đơn</h3>
          <p className="mt-4 text-3xl font-bold text-slate-900">0</p>
          <p className="mt-2 text-sm text-slate-600">Đang chờ xử lý</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Thanh toán</h3>
          <p className="mt-4 text-3xl font-bold text-emerald-600">₫0</p>
          <p className="mt-2 text-sm text-slate-600">Tháng này</p>
        </div>
      </div>
    </div>
  );
}

export default AccountingPage;

