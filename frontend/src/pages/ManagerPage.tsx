import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';

const stats = [
  { label: 'Doanh thu hôm nay', value: '24.800.000đ', trend: '+12%' },
  { label: 'Đơn hàng mới', value: '36', trend: '+8' },
  { label: 'Nhân viên hoạt động', value: '12', trend: '+2' },
  { label: 'Sản phẩm sắp hết', value: '9', trend: '-3' },
];

const orders = [
  { id: 'DH-1001', customer: 'Công ty Minh Anh', total: '8.400.000đ', status: 'Đã thanh toán' },
  { id: 'DH-1002', customer: 'Shop Gia Huy', total: '3.250.000đ', status: 'Đang xử lý' },
  { id: 'DH-1003', customer: 'Lan Beauty', total: '12.600.000đ', status: 'Đã giao' },
];

function ManagerPage() {
  const navigate = useNavigate();
  const session = getSession();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">M</div>
          <h1>Quản lý</h1>
          <p className="sidebar-subtitle">Sales Management</p>
        </div>
        <nav>
          <Link className="active" to="/manager">
            Tổng quan
          </Link>
          <Link to="/manager/users">Người dùng</Link>
          <Link to="/manager/customers">Khách hàng</Link>
          <a href="/manager">Doanh thu</a>
          <a href="/manager">Kho hàng</a>
          <a href="/manager">Báo cáo</a>
        </nav>
        <button onClick={handleLogout}>Đăng xuất</button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p>Xin chào, {session?.name}</p>
            <h2>Bảng điều khiển quản lý</h2>
          </div>
          <button>+ Tạo báo cáo</button>
        </header>

        <div className="role-badge manager">Vai trò: Quản lý</div>

        <div className="stats-grid">
          {stats.map((item) => (
            <article className="stat-card" key={item.label}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.trend} so với hôm qua</span>
            </article>
          ))}
        </div>

        <section className="panel">
          <div className="panel-heading">
            <h3>Đơn hàng cần theo dõi</h3>
            <button>Xem tất cả</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.total}</td>
                    <td>
                      <span>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ManagerPage;
