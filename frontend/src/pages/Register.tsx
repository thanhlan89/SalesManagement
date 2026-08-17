import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const USERS_KEY = 'sales_management_users';

type RegisterFormState = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterFormState = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedDisplayName = form.displayName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPassword = form.password.trim();
    const trimmedConfirmPassword = form.confirmPassword.trim();

    if (!trimmedDisplayName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as Array<{
      displayName: string;
      email: string;
      password: string;
    }>;

    const alreadyExists = existingUsers.some(
      (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase(),
    );

    if (alreadyExists) {
      setError('Email này đã được đăng ký.');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = {
        displayName: trimmedDisplayName,
        email: trimmedEmail,
        password: trimmedPassword,
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([...existingUsers, newUser]));
      setForm(initialForm);
      navigate('/login');
    } catch {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
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
            <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-slate-700">
              Tên hiển thị
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={form.displayName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Nhập tên hiển thị"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Nhập lại mật khẩu"
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
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
