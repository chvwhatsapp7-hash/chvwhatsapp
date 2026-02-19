// import { hover } from "@testing-library/user-event/dist/hover";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/updatepassword?action=updatepassword`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Password updated successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>
          Create a new password to access your account
        </p>

        <form onSubmit={submitHandler}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Show Password */}
          <div style={styles.checkbox}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <span style={{ marginLeft: 8 }}>Show Password</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        {/* Back to Login */}
        <p
          style={styles.backToLogin}
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordForm;

/* ===================== STYLES ===================== */

const styles = {
  container: {
    minHeight: "50vh",
    display: "flex",
    padding: "15px",
  },

  card: {
    width: "460px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    color: "#171515",
    backdropFilter: "blur(8px)",
  },

  title: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "10px",
    textAlign: "center",
  },

  subtitle: {
    fontSize: "15px",
    color: "#020e16",
    marginBottom: "30px",
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: "18px",
  },

  label: {
    fontSize: "13px",
    color: "#040f15",
    marginBottom: "6px",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #b3c1c1",
    outline: "none",
    background: "#fbfcfc",
    color: "#090202",
    fontSize: "14px",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    marginBottom: "22px",
    color: "#01070c",
  },

  button: {
    width: "100%",
    padding: "15px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(90deg, #11d1d1, #11d1d1)",
    color: "#f7fafc",
    transition: "all 0.3s ease",
  },

  message: {
    marginTop: "18px",
    textAlign: "center",
    color: "#c21111",
    fontSize: "14px",
  },

  backToLogin: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "14px",
    color: "#035923",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
