import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHomePath, login } from '../lib/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const session = login(email, password);

    if (!session) {
      setError('Email hoặc mật khẩu không đúng.');
      setIsSubmitting(false);
      return;
    }

    navigate(getHomePath(session.role));
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="brand-panel">
          <div className="brand-logo">S</div>
          <h1>Sales Management</h1>
          <p>Đăng nhập theo vai trò để vào khu vực quản lý, nhân viên hoặc khách hàng.</p>
        </section>

        <section className="auth-card">
          <h2>Đăng nhập</h2>

          <form onSubmit={handleSubmit} className="auth-form">
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

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="demo-list">
            <p>Quản lý: manager@sales.com / 123456</p>
            <p>Nhân viên: user@sales.com / 123456</p>
            <p>Khách hàng: customer@sales.com / 123456</p>
          </div>

          <p className="auth-switch">
            Bạn mới biết đến chúng tôi? <Link to="/register">Đăng ký</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
