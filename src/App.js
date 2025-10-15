import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // <-- REMOVED BrowserRouter as Router
import { AuthProvider, useAuth } from './context/AuthContext';

// Page Imports
import LandingPage from './pages/index';
import RegisterPage from './pages/auth/register';
import LoginPage from './pages/auth/login';
import AdminHomePage from './pages/admin/index';
import ClientHomePage from './pages/client/index';

// A component to protect routes
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/client" replace />;
  }
  return children;
};

// The main App Component
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminHomePage />
            </PrivateRoute>
          }
        />

        {/* Client Routes */}
        <Route
          path="/client"
          element={
            <PrivateRoute role="client">
              <ClientHomePage />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;