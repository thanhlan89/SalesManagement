import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const USERS_KEY = 'sales_management_users';
const DEFAULT_DEMO_USER = {
  displayName: 'Admin Sales',
  email: 'admin@sales.com',
  password: '123456',
};

const getStoredUsers = () => {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);
    const parsedUsers = rawUsers ? JSON.parse(rawUsers) : [];

    if (!Array.isArray(parsedUsers) || parsedUsers.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_DEMO_USER]));
      return [DEFAULT_DEMO_USER];
    }

    return parsedUsers;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_DEMO_USER]));
    return [DEFAULT_DEMO_USER];
  }
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const savedUsers = getStoredUsers();
      const matchedUser = savedUsers.find(
        (user: { email: string; password: string; displayName?: string }) =>
          user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
      );

      if (!matchedUser) {
        setError('Email hoặc mật khẩu không đúng.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem(
        'current_user',
        JSON.stringify({
          displayName: matchedUser.displayName || matchedUser.email,
          email: matchedUser.email,
        }),
      );

      navigate('/dashboard');
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Sales Management</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
