import React from "react";
import { Link } from "react-router-dom";
import ResetPasswordForm from "../../../components/Authentication/ResetPasswordForm";

const Resetpasswordpage = () => {
  return (
    <div
      style={{
        backgroundColor: "#e5ecf7",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Link
        to="/"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#709d98",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
      </Link>

      <ResetPasswordForm />
    </div>
  );
};

export default Resetpasswordpage;
