import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Simulate authentication state
  // In a real app, this would come from tokens in localStorage/sessionStorage
  const [user, setUser] = useState(null); // { id: 'user1', role: 'client', name: 'John Doe' } or { id: 'admin1', role: 'admin', name: 'Admin User' }

  const login = (userData, role) => {
    // This is where actual API call for login would happen
    // On success:
    setUser({ ...userData, role });
    // Save token to local storage etc.
    console.log(`User ${userData.name} logged in as ${role}`);
  };

  const logout = () => {
    setUser(null);
    // Clear tokens from local storage etc.
    console.log('User logged out');
  };

  const isAuthenticated = !!user;
  const isAdmin = user && user.role === 'admin';
  const isClient = user && user.role === 'client';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isClient, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

