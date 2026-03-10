import React from 'react';
import {Routes, Route, Navigate } from 'react-router-dom'; // <-- REMOVED BrowserRouter as Router
import { AuthProvider, useAuth } from './context/AuthContext';

// Page Imports
import LandingPage from './components/Landing/index';
import RegisterPage from './pages/auth/register';
import LoginPage from './pages/auth/login';
import AdminHomePage from './pages/admin/index';
import ClientHomePage from './pages/client/index';
import AddClient from './pages/admin/AddClient';
import AllUsers from "./pages/admin/allusers";
import AdminLayout from './components/Layout/AdminLayout';


import Campaigns from './pages/client/campaigns'
import Templates from './pages/client/templates'
import Contacts from './pages/client/contacts';
import ClientProfile from './pages/client/profile'
import ResetPasswordPage from './pages/auth/resetpassword';

// A component to protect routes
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; // or a loader
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return user.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/client" replace />;
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
        <Route path="/resetpassword" element={<ResetPasswordPage />} />    


        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminHomePage />
            </PrivateRoute>
          }
        />
        <Route
  path="/admin/add-client"
  element={
    <PrivateRoute role="admin">
      <AddClient />
    </PrivateRoute>
  }
/>
<Route
  path="/admin/allusers"
  element={
    <PrivateRoute role="admin">
      <AdminLayout pageTitle="All Users">
        <AllUsers />
      </AdminLayout>
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

        <Route
          path="/client/campaigns"
          element={
            <PrivateRoute role="client">
              <Campaigns />
            </PrivateRoute>
          }
        />

        <Route
          path="/client/templates"
          element={
            <PrivateRoute role="client">
              <Templates />
            </PrivateRoute>
          }
        />

        <Route
          path="/client/contacts"
          element={
            <PrivateRoute role="client">
              <Contacts />
            </PrivateRoute>
          }
        />

      

        <Route
          path="/client/profile"
          element={
            <PrivateRoute role="client">
              <ClientProfile />
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