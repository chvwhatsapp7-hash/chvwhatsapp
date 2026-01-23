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
        "/api/auth/update-password?action=updatepassword",
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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #000000, #0a1f33, #7ecbff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },

  card: {
    width: "460px",
    background: "rgba(10, 25, 40, 0.95)",
    padding: "40px",
    borderRadius: "16px",
    color: "#ffffff",
    boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
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
    color: "#cfd9e0",
    marginBottom: "30px",
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: "18px",
  },

  label: {
    fontSize: "13px",
    color: "#9ad7ff",
    marginBottom: "6px",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #1e3a5f",
    outline: "none",
    background: "#0f243a",
    color: "#ffffff",
    fontSize: "14px",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    marginBottom: "22px",
    color: "#d1e8ff",
  },

  button: {
    width: "100%",
    padding: "15px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(90deg, #7ecbff, #3fa9f5)",
    color: "#001018",
    transition: "all 0.3s ease",
  },

  message: {
    marginTop: "18px",
    textAlign: "center",
    color: "#ff8a8a",
    fontSize: "14px",
  },

  backToLogin: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "14px",
    color: "#7ecbff",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
