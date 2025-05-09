import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthRedirect = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  const isAuthPage =
    location.pathname.startsWith('/auth') ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';
  const isLandingPage = location.pathname === '/';

  // If user is authenticated and trying to access auth or landing page, redirect to dashboard
  if (token && (isAuthPage || isLandingPage)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated and trying to access protected routes, redirect to landing
  if (!token && !isAuthPage && !isLandingPage) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRedirect; 