const dashboardStats = [
  {
    title: 'Tổng Doanh Thu',
    value: '₫250.000.000',
    change: '+12.5%',
    isPositive: true,
  },
  {
    title: 'Đơn Hàng Hôm Nay',
    value: '24',
    change: '+3 từ hôm qua',
    isPositive: true,
  },
  {
    title: 'Khách Hàng Mới',
    value: '8',
    change: '+2 từ tuần trước',
    isPositive: true,
  },
  {
    title: 'Tồn Kho',
    value: '1.250',
    change: '-5 từ hôm qua',
    isPositive: false,
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Tổng quan kinh doanh của bạn hôm nay</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-slate-300"
          >
            <p className="text-sm font-medium text-slate-600">{stat.title}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p
              className={`mt-3 flex items-center gap-1 text-sm font-medium ${
                stat.isPositive ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              <span>📈</span>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Đơn Hàng Gần Đây</h2>
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="font-medium text-slate-900">Đơn hàng #{10000 + i}</p>
                  <p className="text-sm text-slate-600">Ngày {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">₫{50_000_000 * i}</p>
                  <p className="text-xs text-emerald-600">Đã thanh toán</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Hoạt động gần đây</h2>
          <div className="mt-6 space-y-4">
            {[
              { icon: '📊', text: 'Báo cáo tháng được tạo' },
              { icon: '👤', text: 'Khách hàng mới được thêm' },
              { icon: '📦', text: 'Sản phẩm được cập nhật' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl">{activity.icon}</span>
                <p className="text-sm text-slate-600">{activity.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
