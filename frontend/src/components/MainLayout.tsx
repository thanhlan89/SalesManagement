import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/employees', label: 'Nhân sự', icon: '👥' },
  { to: '/products', label: 'Sản phẩm', icon: '📦' },
  { to: '/warehouse', label: 'Kho bãi', icon: '🏢' },
  { to: '/sales', label: 'Bán hàng', icon: '🛒' },
  { to: '/accounting', label: 'Kế toán', icon: '💰' },
];

function MainLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <aside className="w-72 border-r border-slate-200 bg-slate-900 text-slate-100 shadow-xl">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Sales
            </p>
            <h1 className="mt-1 text-xl font-bold">Management</h1>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <span aria-hidden="true">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
