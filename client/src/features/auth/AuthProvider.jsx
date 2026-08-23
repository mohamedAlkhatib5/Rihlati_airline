import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  api,
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../../shared/lib/apiClient';
import { AuthContext } from './AuthContext';

/**
 * Holds the signed-in user.
 *
 * On mount it exchanges a stored refresh token for a fresh session, so a
 * reload does not sign the viewer out — while the access token itself is never
 * written to disk.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(Boolean(getRefreshToken()));

  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    let cancelled = false;

    api
      .post('/auth/refresh', { refresh_token: refreshToken })
      .then((response) => {
        if (cancelled) return;
        setAccessToken(response.access_token);
        setRefreshToken(response.refresh_token);
        setUser(response.user);
      })
      .catch(() => clearTokens())
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await api.post('/auth/register', payload);
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      canAccessDashboard: Boolean(user?.canAccessDashboard),
      isAdmin: user?.role === 'admin',
      isRestoring,
      login,
      register,
      logout,
    }),
    [user, isRestoring, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
