import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<div className="rounded-3xl bg-white p-8 shadow-sm">Nhân sự</div>} />
            <Route path="/products" element={<div className="rounded-3xl bg-white p-8 shadow-sm">Sản phẩm</div>} />
            <Route path="/warehouse" element={<div className="rounded-3xl bg-white p-8 shadow-sm">Kho bãi</div>} />
            <Route path="/sales" element={<div className="rounded-3xl bg-white p-8 shadow-sm">Bán hàng</div>} />
            <Route path="/accounting" element={<div className="rounded-3xl bg-white p-8 shadow-sm">Kế toán</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
