import React, { useState } from "react";
import {useLocation } from "react-router-dom";

function RegisterPage() {
  const location = useLocation();
  const isAdmin = new URLSearchParams(location.search).get("from") === "admin";

  return <RegisterForm isAdmin={isAdmin} />;
}

function RegisterForm({ isAdmin }) {
  // const navigate = useNavigate(); // <-- REMOVE THIS line
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    personalWhatsappNumber: "",
    password: "",
    businessName: "",
    businessCountry: "",
    businessWebsiteUrl: "",
    GST: "",
    role: "client",

  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ...rest of code


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

const mapToBackendPayload = (fd) => ({
  first_name: fd.firstName,
  last_name: fd.lastName,
  email: fd.email,
  password: fd.password,
  whatsapp_number: fd.personalWhatsappNumber,
  country: fd.businessCountry,
  website: fd.businessWebsiteUrl,
  gst_num: fd.GST,
  role: isAdmin ? fd.role : "client",  // 👈 important
  created_by: isAdmin ? 1 : 0,         // 👈 replace 1 with actual logged-in admin id later
});



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.businessName ||
      !formData.businessCountry ||
      !formData.businessWebsiteUrl ||
      !formData.GST
    ) {
      setError("Please fill all the required fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const payload = mapToBackendPayload(formData);
const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {}

      if (response.ok) {
        setSuccess(data?.message || "Registration successful! Please check your email.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          personalWhatsappNumber: "",
          password: "",
          businessName: "",
          businessCountry: "",
          businessWebsiteUrl: "",
          GST: "",
        });
      } else {
        setError(data?.message || "Error occurred. Try again later.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const formSectionStyle = { marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" };
  const inputGroupStyle = { marginBottom: "15px", display: "flex", gap: "20px" };
  const inputWrapperStyle = { flex: "1", display: "flex", flexDirection: "column" };
  const labelStyle = { marginBottom: "5px", fontWeight: "500", fontSize: "0.9em", color: "#555" };
  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "1em" };
  const passwordWrapperStyle = { ...inputWrapperStyle, position: "relative" };
  const eyeStyle = { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#888" };
  const buttonStyle = { width: "100%", padding: "15px", backgroundColor: "#00c6a7", color: "#fff", border: "none", borderRadius: "5px", fontSize: "1.1em", cursor: loading ? "not-allowed" : "pointer", marginTop: "20px", fontWeight: "bold" };
  const linkButtonStyle = { background: "none", border: "none", padding: 0, cursor: "pointer", color: "#00c6a7" };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "30px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>Create your free account</h2>
      <p style={{ textAlign: "center", marginBottom: "30px", color: "#666", fontSize: "0.9em" }}>Enter details below to create your Whatsapp Notifier account.</p>

      {error && <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{error}</p>}
      {success && <p style={{ color: "green", textAlign: "center", marginBottom: "15px" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div style={formSectionStyle}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>Personal details</h3>
          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Whatsapp Number</label>
              <input type="text" name="personalWhatsappNumber" value={formData.personalWhatsappNumber} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={passwordWrapperStyle}>
              <label style={labelStyle}>Password</label>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} style={inputStyle} />
              <span onClick={togglePasswordVisibility} style={eyeStyle}>{showPassword ? "👁️" : "🔒"}</span>
            </div>
          </div>
          {isAdmin && (
  <div style={inputWrapperStyle}>
    <label style={labelStyle}>Register As</label>
    <select
      name="role"
      value={formData.role}
      onChange={handleChange}
      style={inputStyle}
    >
      <option value="client">Client</option>
      <option value="admin">Admin</option>
    </select>
  </div>
)}


        </div>

        {/* Business Details */}
        <div style={formSectionStyle}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>Business details</h3>
          <p style={{ marginBottom: "20px", color: "#666", fontSize: "0.9em" }}>Legal business entity with a live website is required to access WhatsApp API</p>
          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Business Country</label>
              <select name="businessCountry" value={formData.businessCountry} onChange={handleChange} style={inputStyle}>
                <option value="">Select country</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Business Website URL (must be live)</label>
              <input type="url" name="businessWebsiteUrl" value={formData.businessWebsiteUrl} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>GST Number</label>
              <input type="text" name="GST" value={formData.GST} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.85em", color: "#666", marginBottom: "25px" }}>
            By creating your account, you agree to our{" "}
            <button type="button" style={linkButtonStyle} onClick={() => alert("Terms & Conditions coming soon!")}>Terms and Conditions</button>,{" "}
            <button type="button" style={linkButtonStyle} onClick={() => alert("Privacy Policy coming soon!")}>Privacy Policy</button> and{" "}
            <button type="button" style={linkButtonStyle} onClick={() => alert("Refund Policy coming soon!")}>Refund Policy</button>.
          </p>

          <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
