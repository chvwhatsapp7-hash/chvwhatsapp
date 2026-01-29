import React, { useEffect, useState } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";

function ClientProfile() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    personalWhatsappNumber: "",
    password: "",
    businessName: "",
    businessCountry: "",
    businessWebsiteUrl: "",
    GST: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "http://localhost:3000/api/user/profile?action=profile",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        const user = data.user;

        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          personalWhatsappNumber: user.whatsapp_number || "",
          password: "",
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/api/user/profile?action=profile",
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

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formSectionStyle = { marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" };
  const inputGroupStyle = { marginBottom: "15px", display: "flex", gap: "20px" };
  const inputWrapperStyle = { flex: "1", display: "flex", flexDirection: "column" };
  const labelStyle = { marginBottom: "5px", fontWeight: "500", fontSize: "0.9em", color: "#555" };
  const inputStyle = { padding: "10px 12px", border: "1px solid #ddd", borderRadius: "4px" };
  const passwordWrapper = { ...inputWrapperStyle, position: "relative" };
  const eyeIconStyle = { position: "absolute", right: "12px", top: "38px", cursor: "pointer" };
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
                <input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Whatsapp Number</label>
                <input
                  name="personalWhatsappNumber"
                  value={formData.personalWhatsappNumber}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={passwordWrapper}>
              <label style={labelStyle}>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
              />
              <span onClick={togglePasswordVisibility} style={eyeIconStyle}>
                {showPassword ? "👁️" : "🔒"}
              </span>
            </div>
          </div>

          <div style={formSectionStyle}>
            <h3>Business Details</h3>

            <div style={inputGroupStyle}>
              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Business Name</label>
                <input name="businessName" value={formData.businessName} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={inputWrapperStyle}>
                <label style={labelStyle}>Country</label>
                <select name="businessCountry" value={formData.businessCountry} onChange={handleChange} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>

            <div style={inputWrapperStyle}>
              <label style={labelStyle}>Website</label>
              <input
                name="businessWebsiteUrl"
                value={formData.businessWebsiteUrl}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputWrapperStyle}>
              <label style={labelStyle}>GST</label>
              <input name="GST" value={formData.GST} onChange={handleChange} style={inputStyle} />
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
