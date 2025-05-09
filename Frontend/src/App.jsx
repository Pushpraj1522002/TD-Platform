import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import AuthenticationPage from './pages/AuthenticationPage/AuthenticationPage';
import DashboardPage from './pages/DashboardPage/DashboardPage'
import CanvasPage from './pages/CanvasPage/CanvasPage'
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect/AuthRedirect';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <AuthRedirect>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/:authType" element={<AuthenticationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/canvas" element={
              <ProtectedRoute>
                <CanvasPage />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthRedirect>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
