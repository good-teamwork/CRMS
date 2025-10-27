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
    return false;
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
    return null;
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
