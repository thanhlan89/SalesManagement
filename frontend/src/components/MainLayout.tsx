import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: '▦' },
  { to: '/employees', label: 'Nhân sự', icon: '◉' },
  { to: '/products', label: 'Sản phẩm', icon: '□' },
  { to: '/warehouse', label: 'Kho bãi', icon: '▤' },
  { to: '/sales', label: 'Bán hàng', icon: '◇' },
  { to: '/accounting', label: 'Kế toán', icon: '₫' },
];

function MainLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 shadow-xl lg:flex">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
              Sales
            </p>
            <h1 className="mt-1 text-xl font-bold">Management</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-sm">
                {icon}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                Sales
              </p>
              <h1 className="text-lg font-bold">Management</h1>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Đăng xuất
            </button>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
