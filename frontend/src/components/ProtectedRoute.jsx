import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps protected routes. Redirects to /login if no token exists.
 * Optionally enforces a specific role — if the user's role doesn't match,
 * they're redirected to their own dashboard instead.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Not logged in at all → send to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (requiredRole && user.role !== requiredRole) {
    const roleRedirects = {
      factory: '/factory',
      regulator: '/regulator',
      farmer: '/farmer',
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return children;
}
