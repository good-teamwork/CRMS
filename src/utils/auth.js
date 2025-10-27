// Simple authentication utilities
export const AUTH_TOKEN_KEY = 'auth-token';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) {
    // Auto-create mock token for demo
    const mockUser = {
      sub: '1',
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin',
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    const mockToken = btoa(JSON.stringify(mockUser));
    setAuthToken(mockToken);
    return true;
  }
  
  try {
    const tokenData = JSON.parse(atob(token));
    return tokenData.exp && tokenData.exp > Date.now();
  } catch {
    return false;
  }
}

export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) {
    // If no token, set a mock user for demo purposes
    const mockUser = {
      id: '1',
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin',
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    const mockToken = btoa(JSON.stringify(mockUser));
    setAuthToken(mockToken);
    return mockUser;
  }
  
  try {
    const tokenData = JSON.parse(atob(token));
    return {
      id: tokenData.sub,
      email: tokenData.email,
      name: tokenData.name,
      role: tokenData.role,
    };
  } catch {
    return null;
  }
}
