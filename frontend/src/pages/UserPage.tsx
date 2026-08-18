import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';
import { getCustomers, type Customer } from '../lib/customers';
import {
  formatCurrency,
  getAllOrders,
  getCatalog,
  updateOrderStatus,
  type CustomerOrder,
} from '../lib/storefront';

type OrderFilter = 'all' | 'processing' | 'shipping' | 'completed';

const statusLabels: Record<CustomerOrder['status'], string> = {
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
};

const tasks = [
  {
    title: 'Xác nhận đơn mới',
    description: 'Kiểm tra đơn chờ xử lý và gọi xác nhận với khách hàng.',
  },
  {
    title: 'Đóng gói và bàn giao',
    description: 'Ưu tiên đơn đang giao để chuyển sang bộ phận vận chuyển.',
  },
  {
    title: 'Chăm sóc khách hàng',
    description: 'Theo dõi khách VIP và cập nhật ghi chú sau mỗi cuộc trao đổi.',
  },
];

function UserPage() {
  const navigate = useNavigate();
  const session = getSession();
  const catalog = getCatalog();
  const [orders, setOrders] = useState<CustomerOrder[]>(() => getAllOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0] ?? null,
    [customers, selectedCustomerId],
  );

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const metrics = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'processing').length;
    const shipping = orders.filter((order) => order.status === 'shipping').length;
    const completed = orders.filter((order) => order.status === 'completed').length;
    const vipCustomers = customers.filter((customer) => customer.segment === 'vip').length;
    const lowStock = catalog.filter((item) => item.stock <= 15).length;

    return [
      { label: 'Đơn chờ xử lý', value: pending.toString(), hint: 'Cần xác nhận' },
      { label: 'Đơn đang giao', value: shipping.toString(), hint: 'Theo dõi vận chuyển' },
      { label: 'Đơn hoàn tất', value: completed.toString(), hint: 'Đã bàn giao' },
      { label: 'Khách VIP', value: vipCustomers.toString(), hint: 'Ưu tiên chăm sóc' },
      { label: 'Tồn kho thấp', value: lowStock.toString(), hint: 'Cần cảnh báo' },
    ];
  }, [catalog, customers, orders]);

  const pendingCount = orders.filter((order) => order.status === 'processing').length;
  const highlightCustomers = customers.filter((customer) => customer.active).slice(0, 4);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const refreshData = () => {
    setOrders(getAllOrders());
    setCustomers(getCustomers());
  };

  const handleAdvanceStatus = (order: CustomerOrder, nextStatus: CustomerOrder['status']) => {
    const updated = updateOrderStatus(order.id, nextStatus);
    if (updated) {
      refreshData();
      setSelectedOrderId(updated.id);
    }
  };

  const getOrderCustomerName = (email: string) => {
    const matched = customers.find((customer) => customer.email.toLowerCase() === email.toLowerCase());
    return matched?.name ?? email;
  };

  return (
    <main className="employee-portal">
      <aside className="employee-sidebar">
        <div className="employee-brand">
          <div className="employee-logo">E</div>
          <div>
            <h1>Employee Hub</h1>
            <p>Khu vực nhân viên</p>
          </div>
        </div>

        <nav className="employee-nav">
          <button className="active" type="button">
            Tổng quan
          </button>
          <button type="button">Đơn hàng</button>
          <button type="button">Khách hàng</button>
          <button type="button">Tồn kho</button>
        </nav>

        <div className="employee-summary">
          <p>Ca làm</p>
          <strong>{session?.name}</strong>
          <span>{session?.email}</span>
          <div className="employee-chip">Vai trò: Nhân viên</div>
        </div>

        <button className="employee-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      <section className="employee-main">
        <header className="employee-hero">
          <div>
            <p className="eyebrow">Vận hành mượt, xử lý nhanh</p>
            <h2>Bảng điều khiển nhân viên</h2>
            <p className="hero-copy">
              Theo dõi đơn hàng, chăm sóc khách hàng và xử lý tồn kho trong một màn hình làm việc.
            </p>
          </div>

          <div className="employee-hero-card">
            <strong>{pendingCount}</strong>
            <span>đơn đang chờ xử lý</span>
          </div>
        </header>

        <div className="employee-metrics">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>{metric.hint}</span>
            </article>
          ))}
        </div>

        <div className="employee-layout">
          <section className="panel">
            <div className="panel-heading">
              <h3>Công việc trong ca</h3>
              <button type="button">+ Tạo việc</button>
            </div>
            <div className="task-grid employee-task-grid">
              {tasks.map((task) => (
                <article className="task-card" key={task.title}>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <button type="button">Bắt đầu</button>
                </article>
              ))}
            </div>
          </section>

          <aside className="panel employee-focus">
            <div className="panel-heading">
              <h3>Đơn ưu tiên</h3>
              <div className="order-filters">
                {(['all', 'processing', 'shipping', 'completed'] as OrderFilter[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={filter === item ? 'active' : ''}
                    onClick={() => setFilter(item)}
                  >
                    {item === 'all' ? 'Tất cả' : statusLabels[item]}
                  </button>
                ))}
              </div>
            </div>

            <div className="order-list">
              {visibleOrders.length === 0 ? (
                <p className="empty-note">Không có đơn nào trong bộ lọc này.</p>
              ) : (
                visibleOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className={`order-row ${selectedOrder?.id === order.id ? 'active' : ''}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div>
                      <strong>{order.id}</strong>
                      <span>{getOrderCustomerName(order.email)}</span>
                    </div>
                    <div>
                      <strong>{formatCurrency(order.total)}</strong>
                      <span className={`order-badge ${order.status}`}>{statusLabels[order.status]}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedOrder ? (
              <div className="order-detail">
                <div className="detail-top">
                  <h4>{selectedOrder.id}</h4>
                  <span className={`order-badge ${selectedOrder.status}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>

                <p>
                  Khách hàng: <strong>{getOrderCustomerName(selectedOrder.email)}</strong>
                </p>
                <p>
                  Ngày tạo:{' '}
                  <strong>{new Date(selectedOrder.placedAt).toLocaleString('vi-VN')}</strong>
                </p>

                <div className="detail-items">
                  {selectedOrder.items.map((item) => (
                    <div className="detail-item" key={item.itemId}>
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  <button
                    type="button"
                    disabled={selectedOrder.status === 'processing'}
                    onClick={() => handleAdvanceStatus(selectedOrder, 'processing')}
                  >
                    Chuyển chờ xử lý
                  </button>
                  <button
                    type="button"
                    disabled={selectedOrder.status === 'shipping'}
                    onClick={() => handleAdvanceStatus(selectedOrder, 'shipping')}
                  >
                    Chuyển đang giao
                  </button>
                  <button
                    type="button"
                    disabled={selectedOrder.status === 'completed'}
                    onClick={() => handleAdvanceStatus(selectedOrder, 'completed')}
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <section className="employee-grid">
          <article className="panel">
            <div className="panel-heading">
              <h3>Khách hàng ưu tiên</h3>
              <button type="button" onClick={refreshData}>
                Làm mới
              </button>
            </div>

            <div className="customer-list">
              {highlightCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className={selectedCustomer?.id === customer.id ? 'active customer-row' : 'customer-row'}
                  onClick={() => setSelectedCustomerId(customer.id)}
                >
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.company || customer.email}</span>
                  </div>
                  <span className={`status ${customer.active ? 'active' : 'inactive'}`}>
                    {customer.segment === 'vip' ? 'VIP' : 'Theo dõi'}
                  </span>
                </button>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h3>Chi tiết khách hàng</h3>
              <button type="button">Ghi chú</button>
            </div>

            {selectedCustomer ? (
              <div className="customer-detail">
                <div className="detail-top">
                  <h4>{selectedCustomer.name}</h4>
                  <span className={`status ${selectedCustomer.active ? 'active' : 'inactive'}`}>
                    {selectedCustomer.active ? 'Hoạt động' : 'Tạm khóa'}
                  </span>
                </div>

                <p>
                  <strong>Email:</strong> {selectedCustomer.email}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {selectedCustomer.phone}
                </p>
                <p>
                  <strong>Công ty:</strong> {selectedCustomer.company}
                </p>
                <p>
                  <strong>Nhóm:</strong>{' '}
                  {selectedCustomer.segment === 'vip'
                    ? 'VIP'
                    : selectedCustomer.segment === 'inactive'
                      ? 'Ngưng'
                      : 'Mới'}
                </p>
                <p>
                  <strong>Ghi chú:</strong> {selectedCustomer.notes}
                </p>
              </div>
            ) : (
              <p className="empty-note">Chưa chọn khách hàng.</p>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

export default UserPage;
