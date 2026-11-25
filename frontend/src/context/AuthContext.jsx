import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  API_BASE_URL,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  fetchCurrentUser,
  setOnUnauthorizedHandler
} from '../services/api';

const AuthContext = createContext(null);

function consumeAuthHashParams() {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return { accessToken: null, authError: null };
  }

  const params = new URLSearchParams(hash.slice(1));
  const accessToken = params.get('access_token');
  const authError = params.get('auth_error');

  if (accessToken || authError) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  return { accessToken, authError };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const logout = useCallback((reason = null) => {
    clearAuthToken();
    setUser(null);
    setAuthError(typeof reason === 'string' && reason ? reason : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setOnUnauthorizedHandler((reason) => {
      logout(reason);
    });
    return () => setOnUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const { accessToken: hashToken, authError: hashError } = consumeAuthHashParams();

      if (hashError) {
        clearAuthToken();
        if (isMounted) {
          setUser(null);
          setAuthError(hashError);
          setIsLoading(false);
        }
        return;
      }

      if (hashToken) {
        setAuthToken(hashToken);
      }

      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setAuthError(null);
        }
      } catch (err) {
        clearAuthToken();
        if (isMounted) {
          setUser(null);
          if (hashToken) {
            setAuthError('Unable to load your Google profile. Please try signing in again.');
          } else if (err?.status === 401) {
            setAuthError('Your session expired. Please sign in again.');
          } else {
            setAuthError(err?.message || 'Unable to verify authentication session.');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogle = useCallback(() => {
    setAuthError(null);
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    loginWithGoogle,
    logout,
    clearAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
