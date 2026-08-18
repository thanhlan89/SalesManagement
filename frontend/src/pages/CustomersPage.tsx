import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  type Customer,
} from '../lib/customers';

type CustomerFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  segment: Customer['segment'];
  active: boolean;
  notes: string;
};

const emptyForm: CustomerFormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  segment: 'new',
  active: true,
  notes: '',
};

function CustomersPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CustomerFormState>(emptyForm);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.company.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const refreshCustomers = () => {
    setCustomers(getCustomers());
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setError('');
    setForm(emptyForm);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setError('');
    setForm(emptyForm);
  };

  const startEdit = (customer: Customer) => {
    setIsCreating(false);
    setEditingId(customer.id);
    setError('');
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      segment: customer.segment,
      active: customer.active,
      notes: customer.notes,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Tên và email khách hàng là bắt buộc.');
      return;
    }

    if (isCreating) {
      const created = createCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        address: form.address.trim(),
        segment: form.segment,
        active: form.active,
        notes: form.notes.trim(),
      });

      if (!created) {
        setError('Email khách hàng này đã tồn tại.');
        return;
      }
    } else if (editingId) {
      const updated = updateCustomer(editingId, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        address: form.address.trim(),
        segment: form.segment,
        active: form.active,
        notes: form.notes.trim(),
      });

      if (!updated) {
        setError('Không thể cập nhật. Có thể email đã bị trùng.');
        return;
      }
    }

    refreshCustomers();
    resetForm();
  };

  const handleDelete = (customer: Customer) => {
    const confirmed = window.confirm(`Xóa khách hàng "${customer.name}"?`);
    if (!confirmed) return;

    const removed = deleteCustomer(customer.id);
    if (removed) refreshCustomers();
  };

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
          <Link to="/manager">Tổng quan</Link>
          <Link to="/manager/users">Người dùng</Link>
          <Link className="active" to="/manager/customers">
            Khách hàng
          </Link>
          <a href="/manager">Doanh thu</a>
          <a href="/manager">Kho hàng</a>
        </nav>
        <button onClick={handleLogout}>Đăng xuất</button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p>Xin chào, {session?.name}</p>
            <h2>Quản lý khách hàng</h2>
          </div>
          <button onClick={startCreate}>+ Thêm khách hàng</button>
        </header>

        <div className="role-badge manager">Vai trò: Quản lý</div>

        <section className="panel users-panel">
          <div className="panel-heading">
            <h3>Danh sách khách hàng</h3>
            <div className="users-search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên, email, công ty, số điện thoại..."
              />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Công ty</th>
                  <th>Phân loại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.company}</td>
                    <td>
                      {customer.segment === 'vip'
                        ? 'VIP'
                        : customer.segment === 'inactive'
                          ? 'Ngưng'
                          : 'Mới'}
                    </td>
                    <td>
                      <span className={customer.active ? 'status active' : 'status inactive'}>
                        {customer.active ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => startEdit(customer)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(customer)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {(isCreating || editingId) && (
          <section className="panel user-form-panel">
            <div className="panel-heading">
              <h3>{isCreating ? 'Thêm khách hàng' : 'Chỉnh sửa khách hàng'}</h3>
              <button type="button" className="ghost-button" onClick={resetForm}>
                Đóng
              </button>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
              <label>
                Họ tên
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Nhập họ tên"
                />
              </label>

              <div className="user-form-grid">
                <label>
                  Email
                  <input
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="name@example.com"
                  />
                </label>

                <label>
                  Số điện thoại
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="0900000000"
                  />
                </label>
              </div>

              <div className="user-form-grid">
                <label>
                  Công ty
                  <input
                    value={form.company}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, company: event.target.value }))
                    }
                    placeholder="Tên công ty"
                  />
                </label>

                <label>
                  Địa chỉ
                  <input
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                    placeholder="Địa chỉ"
                  />
                </label>
              </div>

              <div className="user-form-grid">
                <label>
                  Phân loại
                  <select
                    value={form.segment}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        segment: event.target.value as Customer['segment'],
                      }))
                    }
                  >
                    <option value="new">Mới</option>
                    <option value="vip">VIP</option>
                    <option value="inactive">Ngưng</option>
                  </select>
                </label>

                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, active: event.target.checked }))
                    }
                  />
                  <span>Đang hoạt động</span>
                </label>
              </div>

              <label>
                Ghi chú
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Ghi chú chăm sóc khách hàng"
                />
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <div className="form-actions">
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Hủy
                </button>
                <button type="submit">{isCreating ? 'Tạo khách hàng' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}

export default CustomersPage;
