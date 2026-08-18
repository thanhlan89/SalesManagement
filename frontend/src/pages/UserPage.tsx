import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';

const tasks = [
  { title: 'Tạo đơn hàng mới', description: 'Nhập khách hàng, sản phẩm và xác nhận thanh toán.' },
  { title: 'Kiểm tra tồn kho', description: 'Xem nhanh sản phẩm còn hàng trước khi tư vấn.' },
  { title: 'Chăm sóc khách hàng', description: 'Theo dõi khách vừa mua và ghi chú yêu cầu.' },
];

const todayOrders = [
  { id: 'DH-2104', customer: 'Anh Tuấn', status: 'Chờ xác nhận' },
  { id: 'DH-2105', customer: 'Chị Hạnh', status: 'Đang đóng gói' },
  { id: 'DH-2106', customer: 'Cửa hàng Phúc An', status: 'Sẵn sàng giao' },
];

function UserPage() {
  const navigate = useNavigate();
  const session = getSession();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="dashboard-page">
      <aside className="sidebar user-sidebar">
        <div>
          <div className="sidebar-logo">U</div>
          <h1>Người dùng</h1>
          <p className="sidebar-subtitle">Sales Management</p>
        </div>
        <nav>
          <a className="active" href="/user">Công việc</a>
          <a href="/user">Đơn của tôi</a>
          <a href="/user">Khách hàng</a>
          <a href="/user">Sản phẩm</a>
        </nav>
        <button onClick={handleLogout}>Đăng xuất</button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p>Xin chào, {session?.name}</p>
            <h2>Khu vực nhân viên bán hàng</h2>
          </div>
          <button>+ Tạo đơn hàng</button>
        </header>

        <div className="role-badge user">Vai trò: Người dùng</div>

        <div className="task-grid">
          {tasks.map((task) => (
            <article className="task-card" key={task.title}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <button>Bắt đầu</button>
            </article>
          ))}
        </div>

        <section className="panel">
          <div className="panel-heading">
            <h3>Đơn hàng hôm nay</h3>
            <button>Làm mới</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td><span>{order.status}</span></td>
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

export default UserPage;
