import React, { useEffect, useState } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";
import {
  FaUser,
  FaEnvelope,
  FaWhatsapp,
  FaBuilding,
  FaFlag,
  FaGlobe,
  FaFileInvoice
} from "react-icons/fa";

function ClientProfile() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    personalWhatsappNumber: "",
    businessName: "",
    businessCountry: "",
    businessWebsiteUrl: "",
    GST: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
    const API_BASE = process.env.REACT_APP_API_URL || "";


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/user/profile?action=profile`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        const user = data.user;

        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          personalWhatsappNumber: user.whatsapp_number || "",
          businessName: user.bussiness_name || "",
          businessCountry: user.country || "",
          businessWebsiteUrl: user.website || "",
          GST: user.gst_num || ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/user/profile?action=profile`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            whatsapp_number: formData.personalWhatsappNumber,
            country: formData.businessCountry,
            website: formData.businessWebsiteUrl,
            gst_num: formData.GST,
            bussiness_name: formData.businessName
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- STYLES ---------- */
  const formSectionStyle = { marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" };
  const inputGroupStyle = { marginBottom: "15px", display: "flex", gap: "20px" };
  const inputWrapperStyle = { flex: "1", display: "flex", flexDirection: "column" };
  const labelStyle = { marginBottom: "5px", fontWeight: "500", fontSize: "0.9em", color: "#555" };

  const inputWithIconStyle = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "0 10px",
    background: "#fff"
  };

  const iconStyle = { marginRight: "8px", color: "#777", fontSize: "14px" };
  const inputStyle = { flex: 1, padding: "10px 0", border: "none", outline: "none" };

  const buttonStyle = { padding: "15px", background: "#00c6a7", color: "#fff", border: "none", borderRadius: "5px" };

  return (
    <ClientLayout>
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "30px", background: "#fff", borderRadius: "8px" }}>
        <h2 style={{ textAlign: "center" }}>Client Profile</h2>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div style={formSectionStyle}>
            <h3>Personal Details</h3>

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
          </div>

          <div style={formSectionStyle}>
            <h3>Business Details</h3>

            <div style={inputGroupStyle}>
              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Business Name</label>
                <div style={inputWithIconStyle}>
                  <FaBuilding style={iconStyle} />
                  <input name="businessName" value={formData.businessName} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Country</label>
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
              <label style={labelStyle}>Website</label>
              <div style={inputWithIconStyle}>
                <FaGlobe style={iconStyle} />
                <input name="businessWebsiteUrl" value={formData.businessWebsiteUrl} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={inputWrapperStyle}>
              <label style={labelStyle}>GST</label>
              <div style={inputWithIconStyle}>
                <FaFileInvoice style={iconStyle} />
                <input name="GST" value={formData.GST} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </ClientLayout>
  );
}

export default ClientProfile;
