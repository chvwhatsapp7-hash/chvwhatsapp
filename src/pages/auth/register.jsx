import React from 'react';
import RegisterForm from '../../components/Auth/RegisterForm';

import { Link, useLocation } from "react-router-dom";

const RegisterPage = () => {
  const location = useLocation();

  const isAdmin =
    new URLSearchParams(location.search).get("from") === "admin";

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Link
        to={isAdmin ? "/admin" : "/"}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#075E54",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ← {isAdmin ? "Back to Dashboard" : "Back to Home"}
      </Link>

      <RegisterForm isAdmin={isAdmin} />
    </div>
  );
};

export default RegisterPage;