import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';
import { getCustomers, updateCustomer, type Customer } from '../lib/customers';
import {
  formatCurrency,
  getAllOrders,
  getCatalog,
  updateOrderStatus,
  type CustomerOrder,
} from '../lib/storefront';

type OrderFilter = 'all' | 'processing' | 'shipping' | 'completed';
type EmployeeSection = 'overview' | 'orders' | 'customers' | 'inventory';

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
  const [activeSection, setActiveSection] = useState<EmployeeSection>('overview');
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    () => catalog.find((item) => item.stock <= 15)?.id ?? catalog[0]?.id ?? null,
  );
  const [noteDraft, setNoteDraft] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0] ?? null,
    [customers, selectedCustomerId],
  );

  const selectedProduct = useMemo(
    () => catalog.find((item) => item.id === selectedProductId) ?? catalog[0] ?? null,
    [catalog, selectedProductId],
  );

  const visibleOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === 'all' || order.status === filter;
      const matchesSearch =
        !query || order.id.toLowerCase().includes(query) || order.email.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [filter, orderSearch, orders]);

  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    return customers
      .filter((customer) => {
        if (!query) return customer.active;
        return [customer.name, customer.email, customer.company, customer.phone]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 6);
  }, [customerSearch, customers]);

  const visibleInventory = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    return catalog
      .filter((item) => showAllInventory || item.stock <= 15)
      .filter((item) =>
        !query || [item.id, item.name, item.category].join(' ').toLowerCase().includes(query),
      )
      .slice(0, 12);
  }, [catalog, inventorySearch, showAllInventory]);

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
  const highlightCustomers = visibleCustomers.slice(0, 4);

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

  const focusSection = (section: EmployeeSection) => {
    setActiveSection(section);
    document.getElementById(`employee-${section}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTask = (title: string) => {
    setCompletedTasks((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  };

  const startNoteEdit = () => {
    if (!selectedCustomer) return;
    setNoteDraft(selectedCustomer.notes);
    setIsEditingNote(true);
  };

  const saveCustomerNote = () => {
    if (!selectedCustomer) return;
    const updated = updateCustomer(selectedCustomer.id, { notes: noteDraft });
    if (updated) {
      refreshData();
      setSelectedCustomerId(updated.id);
      setIsEditingNote(false);
    }
  };

  const copyProductPitch = async () => {
    if (!selectedProduct) return;

    const pitch = `Đây là ${selectedProduct.name}, ${selectedProduct.description.toLowerCase()} Giá tham khảo: ${formatCurrency(selectedProduct.price)}.`;
    try {
      await navigator.clipboard.writeText(pitch);
      setCopiedProductId(selectedProduct.id);
    } catch {
      setCopiedProductId(null);
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
          <button className={activeSection === 'overview' ? 'active' : ''} type="button" onClick={() => focusSection('overview')}>
            Tổng quan
          </button>
          <button className={activeSection === 'orders' ? 'active' : ''} type="button" onClick={() => focusSection('orders')}>
            Đơn hàng
          </button>
          <button className={activeSection === 'customers' ? 'active' : ''} type="button" onClick={() => focusSection('customers')}>
            Khách hàng
          </button>
          <button className={activeSection === 'inventory' ? 'active' : ''} type="button" onClick={() => focusSection('inventory')}>
            Tồn kho
          </button>
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
        <header className="employee-hero" id="employee-overview">
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
              <button type="button" onClick={() => setCompletedTasks([])}>Đặt lại checklist</button>
            </div>
            <div className="task-grid employee-task-grid">
              {tasks.map((task) => (
                <article className="task-card" key={task.title}>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <button type="button" onClick={() => toggleTask(task.title)}>
                    {completedTasks.includes(task.title) ? 'Đã hoàn thành' : 'Bắt đầu'}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <aside className="panel employee-focus" id="employee-orders">
            <div className="panel-heading">
              <h3>Đơn ưu tiên</h3>
              <input
                className="employee-search"
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Tìm mã đơn hoặc email"
                aria-label="Tìm đơn hàng"
              />
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
          <article className="panel" id="employee-customers">
            <div className="panel-heading">
              <h3>Khách hàng ưu tiên</h3>
              <div className="panel-tools">
                <input
                  className="employee-search"
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Tìm khách hàng"
                  aria-label="Tìm khách hàng"
                />
                <button type="button" onClick={refreshData}>Làm mới</button>
              </div>
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
              <button type="button" onClick={startNoteEdit}>Ghi chú</button>
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
                {isEditingNote ? (
                  <div className="employee-note-editor">
                    <label htmlFor="customer-note">Ghi chú chăm sóc</label>
                    <textarea
                      id="customer-note"
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      rows={4}
                    />
                    <div className="order-actions">
                      <button type="button" onClick={saveCustomerNote}>Lưu ghi chú</button>
                      <button type="button" className="secondary-action" onClick={() => setIsEditingNote(false)}>
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p><strong>Ghi chú:</strong> {selectedCustomer.notes || 'Chưa có ghi chú.'}</p>
                )}
              </div>
            ) : (
              <p className="empty-note">Chưa chọn khách hàng.</p>
            )}
          </article>
        </section>

        <section className="panel employee-inventory-panel" id="employee-inventory">
          <div className="panel-heading">
            <div>
              <h3>Tồn kho cần chú ý</h3>
              <p className="panel-subtitle">Các sản phẩm có thể cần bổ sung trong ca này.</p>
            </div>
            <div className="panel-tools inventory-tools">
              <input
                className="employee-search"
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Tìm sản phẩm, mã hoặc danh mục"
                aria-label="Tìm sản phẩm trong tồn kho"
              />
              <button type="button" onClick={() => setShowAllInventory((current) => !current)}>
                {showAllInventory ? 'Chỉ tồn kho thấp' : 'Xem tất cả sản phẩm'}
              </button>
            </div>
          </div>
          <div className="inventory-content">
            <div className="inventory-alert-list">
              {visibleInventory.length === 0 ? (
                <p className="empty-note">Không tìm thấy sản phẩm phù hợp.</p>
              ) : visibleInventory.map((item) => (
                <button
                  className={`inventory-alert ${selectedProduct?.id === item.id ? 'active' : ''}`}
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedProductId(item.id)}
                >
                  <div><strong>{item.name}</strong><span>{item.category}</span></div>
                  <span className="stock-warning">Còn {item.stock}</span>
                </button>
              ))}
              {visibleInventory.length > 0 && showAllInventory ? (
                <p className="inventory-result-note">Hiển thị {visibleInventory.length} sản phẩm phù hợp.</p>
              ) : null}
            </div>

            {selectedProduct ? (
              <div className="product-detail" aria-live="polite">
                <div className="detail-top">
                  <div>
                    <span className="product-detail-badge">{selectedProduct.badge}</span>
                    <h4>{selectedProduct.name}</h4>
                  </div>
                  <strong className="product-detail-price">{formatCurrency(selectedProduct.price)}</strong>
                </div>
                <p className="product-detail-description">{selectedProduct.description}</p>
                <h5 className="product-spec-heading">Thông số sản phẩm</h5>
                <div className="product-spec-grid">
                  <div><span>Mã sản phẩm</span><strong>{selectedProduct.id}</strong></div>
                  <div><span>Danh mục</span><strong>{selectedProduct.category}</strong></div>
                  <div><span>Đánh giá</span><strong>⭐ {selectedProduct.rating} / 5</strong></div>
                  <div><span>Tồn kho</span><strong>{selectedProduct.stock} sản phẩm</strong></div>
                </div>
                <div className="product-pitch">
                  <span>Gợi ý giới thiệu</span>
                  <p>Đây là {selectedProduct.name}, {selectedProduct.description.toLowerCase()}</p>
                  <button type="button" className="copy-pitch-button" onClick={copyProductPitch}>
                    {copiedProductId === selectedProduct.id ? 'Đã sao chép' : 'Sao chép giới thiệu'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="empty-note">Chưa có sản phẩm để xem chi tiết.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default UserPage;
