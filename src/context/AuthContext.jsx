import React, { createContext, useState, useContext} from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, role) => {
    const newUser = { ...userData, role };
    setUser(newUser);

    // save user so refresh doesn't logout
    localStorage.setItem("user", JSON.stringify(newUser));

    console.log(`User ${userData.name} logged in as ${role}`);
  };

  const logout = () => {
    setUser(null);

    // remove stored user
    localStorage.removeItem("user");

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