import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, type UserRole } from '../lib/auth';

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    const created = register({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      active: true,
    });

    if (!created) {
      setError('Email này đã được đăng ký.');
      setIsSubmitting(false);
      return;
    }

    navigate('/login');
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="brand-panel">
          <div className="brand-logo">S</div>
          <h1>Sales Management</h1>
          <p>Chọn đúng loại tài khoản để hệ thống mở giao diện phù hợp sau khi đăng nhập.</p>
        </section>

        <section className="auth-card">
          <h2>Đăng ký</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tên hiển thị"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mật khẩu"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
            />

            <div className="role-picker">
              <button
                type="button"
                className={role === 'user' ? 'selected' : ''}
                onClick={() => setRole('user')}
              >
                Người dùng
              </button>
              <button
                type="button"
                className={role === 'manager' ? 'selected' : ''}
                onClick={() => setRole('manager')}
              >
                Quản lý
              </button>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="auth-switch">
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default RegisterPage;
