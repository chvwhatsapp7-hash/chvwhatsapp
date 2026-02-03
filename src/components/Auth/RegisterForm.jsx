import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaWhatsapp,
  FaLock,
  FaBuilding,
  FaFlag,
  FaGlobe,
  FaFileInvoice
} from "react-icons/fa";

function RegisterForm() {
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
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  /* ===== Styles ===== */
  const formSectionStyle = { marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" };
  const inputGroupStyle = { marginBottom: "15px", display: "flex", gap: "20px" };
  const inputWrapperStyle = { flex: "1", display: "flex", flexDirection: "column" };
  const labelStyle = { marginBottom: "5px", fontWeight: "500", fontSize: "0.9em", color: "#555" };
  const inputStyle = { padding: "10px 12px", border: "none", outline: "none", width: "100%" };

  const inputWithIconStyle = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "0 10px",
    background: "#fff"
  };

  const iconStyle = { marginRight: "8px", color: "#888", fontSize: "0.9em" };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    backgroundColor: "#00c6a7",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.1em",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px"
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "30px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center" }}>Create your free account</h2>

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div style={formSectionStyle}>
          <h3>Personal details</h3>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>First Name</label>
              <div style={inputWithIconStyle}>
                <FaUser style={iconStyle} />
                <input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Last Name</label>
              <div style={inputWithIconStyle}>
                <FaUser style={iconStyle} />
                <input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Email</label>
              <div style={inputWithIconStyle}>
                <FaEnvelope style={iconStyle} />
                <input name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Whatsapp Number</label>
              <div style={inputWithIconStyle}>
                <FaWhatsapp style={iconStyle} />
                <input name="personalWhatsappNumber" value={formData.personalWhatsappNumber} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Password</label>
            <div style={inputWithIconStyle}>
              <FaLock style={iconStyle} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
              />
              <span onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                {showPassword ? "👁️" : "🔒"}
              </span>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div style={formSectionStyle}>
          <h3>Business details</h3>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Business Name</label>
              <div style={inputWithIconStyle}>
                <FaBuilding style={iconStyle} />
                <input name="businessName" value={formData.businessName} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Business Country</label>
              <div style={inputWithIconStyle}>
                <FaFlag style={iconStyle} />
                <select
                  name="businessCountry"
                  value={formData.businessCountry}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  <option value="">Select</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>
          </div>

          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Business Website</label>
            <div style={inputWithIconStyle}>
              <FaGlobe style={iconStyle} />
              <input name="businessWebsiteUrl" value={formData.businessWebsiteUrl} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* GST */}
        <div style={inputWrapperStyle}>
          <label style={labelStyle}>GST Number</label>
          <div style={inputWithIconStyle}>
            <FaFileInvoice style={iconStyle} />
            <input name="GST" value={formData.GST} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <button type="submit" style={buttonStyle}>Create account</button>
      </form>
    </div>
  );
}

export default RegisterForm;
