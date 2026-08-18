import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUser,
  deleteUser,
  getSession,
  getUsers,
  logout,
  updateUser,
  type User,
  type UserRole,
} from '../lib/auth';

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
};

const emptyForm: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  active: true,
};

function UsersPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    );
  }, [search, users]);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const resetForm = () => {
    setEditingId(null);
    setIsCreating(false);
    setError('');
    setForm(emptyForm);
  };

  const startCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setError('');
    setForm(emptyForm);
  };

  const startEdit = (user: User) => {
    setIsCreating(false);
    setEditingId(user.id);
    setError('');
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Tên và email là bắt buộc.');
      return;
    }

    if (isCreating && form.password.trim().length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (isCreating) {
      const created = createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
        active: form.active,
      });

      if (!created) {
        setError('Email này đã tồn tại.');
        return;
      }
    } else if (editingId) {
      const updated = updateUser(editingId, {
        name: form.name.trim(),
        email: form.email.trim(),
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        role: form.role,
        active: form.active,
      });

      if (!updated) {
        setError('Không thể cập nhật. Có thể email đã bị trùng.');
        return;
      }
    }

    refreshUsers();
    resetForm();
  };

  const handleDelete = (user: User) => {
    if (session?.id === user.id) {
      alert('Không thể xóa chính tài khoản đang đăng nhập.');
      return;
    }

    const confirmed = window.confirm(`Xóa người dùng "${user.name}"?`);
    if (!confirmed) return;

    const removed = deleteUser(user.id);
    if (removed) refreshUsers();
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
          <Link className="active" to="/manager/users">
            Người dùng
          </Link>
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
            <h2>Quản lý người dùng</h2>
          </div>
          <button onClick={startCreate}>+ Thêm người dùng</button>
        </header>

        <div className="role-badge manager">Vai trò: Quản lý</div>

        <section className="panel users-panel">
          <div className="panel-heading">
            <h3>Danh sách người dùng</h3>
            <div className="users-search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên, email, vai trò..."
              />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role === 'manager' ? 'Quản lý' : 'Người dùng'}</td>
                    <td>
                      <span className={user.active ? 'status active' : 'status inactive'}>
                        {user.active ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => startEdit(user)}>
                          Sửa
                        </button>
                        <button type="button" className="danger" onClick={() => handleDelete(user)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Không tìm thấy người dùng nào.
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
              <h3>{isCreating ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</h3>
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

              <label>
                Email
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="name@example.com"
                />
              </label>

              <label>
                Mật khẩu {isCreating ? '' : '(để trống nếu không đổi)'}
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Mật khẩu"
                />
              </label>

              <div className="user-form-grid">
                <label>
                  Vai trò
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value as UserRole,
                      }))
                    }
                  >
                    <option value="user">Người dùng</option>
                    <option value="manager">Quản lý</option>
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

              {error ? <p className="form-error">{error}</p> : null}

              <div className="form-actions">
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Hủy
                </button>
                <button type="submit">{isCreating ? 'Tạo người dùng' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}

export default UsersPage;
