import { useCallback } from 'react';
import authApi, { type LoginRequest } from '../api/auth.api';

export const useAuth = () => {
  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);

    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors during logout
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refreshToken');
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('accessToken'));
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem('access_token') || localStorage.getItem('accessToken');
  }, []);

  return { login, logout, isAuthenticated, getToken };
};

export default useAuth;
