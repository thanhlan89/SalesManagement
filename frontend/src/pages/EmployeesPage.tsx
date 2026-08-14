import { useEffect, useState } from 'react';

function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        // Placeholder - will integrate with users API
        setEmployees([]);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nhân sự</h1>
          <p className="mt-2 text-slate-600">Quản lý thông tin nhân viên và phân quyền</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600">
          + Thêm nhân viên
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {isLoading ? (
          <div className="text-center text-slate-500">Đang tải...</div>
        ) : employees.length === 0 ? (
          <div className="text-center text-slate-500">Chưa có nhân viên. Hãy thêm nhân viên đầu tiên!</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-700">Tên</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Vị trí</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">{emp.name}</td>
                  <td className="px-4 py-4 text-slate-600">{emp.email}</td>
                  <td className="px-4 py-4 text-slate-600">{emp.role}</td>
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Hoạt động
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EmployeesPage;

