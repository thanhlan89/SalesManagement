import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import LoginPage from './pages/Login';
import CustomersPage from './pages/CustomersPage';
import ManagerPage from './pages/ManagerPage';
import RegisterPage from './pages/Register';
import UsersPage from './pages/UsersPage';
import UserPage from './pages/UserPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<RoleRedirect />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/manager/users" element={<UsersPage />} />
        <Route path="/manager/customers" element={<CustomersPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route path="/user" element={<UserPage />} />
      </Route>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
