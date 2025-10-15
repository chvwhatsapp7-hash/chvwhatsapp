import React, {useState} from "react";


function RegisterForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        personalWhatsappNumber: '',
        password: '',
        businessName: '',
        businessCountry: '',
        businessWebsiteUrl: '',
        GST: '',
    });

    const[showPassword, setShowPassword] = useState(false);
    const[error, setError] = useState('');
    const[success, setSuccess] = useState('');

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value })); 
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if(!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.businessName || !formData.businessCountry || !formData.businessWebsiteUrl ||!formData.GST) {
            setError('Please fill all the required fields.');
            return;
        }

        if(!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            /*
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.message || 'Registration failed.');
            }
            */

            console.log('Registration Data:', formData);
            setSuccess('Registration successful! Please check your email for verification.');

            setFormData({
                firstName: '', lastName: '', email: '', personalWhatsappNumber: '', password: '',
                businessName: '', businessCountry: '', businessWebsiteUrl: '', GST: '',
            });

        } catch(err) {
            setError(err.message || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        }
    };

    
    const formSectionStyle = { marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' };
    const inputGroupStyle = { marginBottom: '15px', display: 'flex', gap: '20px' };
    const inputWrapperStyle = { flex: '1', display: 'flex', flexDirection: 'column' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9em', color: '#555' };
    const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1em' };
    const passwordInputWrapperStyle = { ...inputWrapperStyle, position: 'relative' };
    const eyeIconStyle = {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#888'
    };
    const buttonStyle = {
        width: '100%', padding: '15px', backgroundColor: '#00c6a7', color: 'white',
        border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer',
        marginTop: '20px', fontWeight: 'bold'
    };
    const linkStyle = { color: '#00c6a7', textDecoration: 'none' };



    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Create your free account</h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '0.9em' }}>Enter details below to create your Whatsapp Notifier account.</p>

            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
            {success && <p style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}


            <form onSubmit={handleSubmit}>
                <div style={formSectionStyle}>
                    <h3 style={{ marginBottom: '20px', color: '#333' }}>Personal details</h3>
                    <div style={inputGroupStyle}>
                        <div style={inputWrapperStyle}>
                            <label htmlFor="firstName" style={labelStyle}>First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your First name"
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputWrapperStyle}>
                            <label htmlFor="lastName" style={labelStyle}>Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <div style={inputWrapperStyle}>
                            <label htmlFor="email" style={labelStyle}>Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputWrapperStyle}>
                            <label htmlFor="personalWhatsappNumber" style={labelStyle}>Whatsapp Number</label>
                            <input
                                type="text"
                                id="personalWhatsappNumber"
                                name="personalWhatsappNumber"
                                value={formData.personalWhatsappNumber}
                                onChange={handleChange}
                                placeholder="Enter your Whatsapp Number"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <div style={passwordInputWrapperStyle}>
                        <label htmlFor="password" style={labelStyle}>PASSWORD</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="********"
                            required
                            style={inputStyle}
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            style={eyeIconStyle}
                        >
                            {showPassword ? '👁️' : '🔒'} {/* You can use an actual eye icon font or SVG here */}
                        </span>
                        </div>
    
                    </div>
                    </div>

                    {/* Business details */}
                    <div style={formSectionStyle}>
                    <h3 style={{ marginBottom: '20px', color: '#333' }}>Business details</h3>
                    <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9em' }}>
                        Legal business entity with a live website is required to access WhatsApp API
                    </p>
                    <div style={inputGroupStyle}>
                        <div style={inputWrapperStyle}>
                        <label htmlFor="businessName" style={labelStyle}>BUSINESS NAME</label>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Enter business name"
                            required
                            style={inputStyle}
                        />
                        </div>
                        <div style={inputWrapperStyle}>
                        <label htmlFor="businessCountry" style={labelStyle}>BUSINESS COUNTRY</label>
                        <select
                            id="businessCountry"
                            name="businessCountry"
                            value={formData.businessCountry}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        >
                            <option value="">Select your country</option>
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                        </select>
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <div style={inputWrapperStyle}>
                            <label htmlFor="businessWebsiteUrl" style={labelStyle}>BUSINESS WEBSITE URL (MUST BE LIVE)</label>
                            <input
                                type="url"
                                id="businessWebsiteUrl"
                                name="businessWebsiteUrl"
                                value={formData.businessWebsiteUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#333' }}>Other details</h3>
                        <div style={inputGroupStyle}>
                            <div style={inputWrapperStyle}>
                                <label htmlFor="GST" style={labelStyle}>GST Number</label>
                                <input
                                    id="GST"
                                    name="GST"
                                    value={formData.GST}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    
                                </input>
                            </div>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.85em', color: '#666', marginBottom: '25px' }}>
                    By creating your account, you agree to our <a href="#" style={linkStyle}>Terms and Conditions</a>, <a href="#" style={linkStyle}>Privacy Policy</a> and <a href="#" style={linkStyle}>Refund Policy</a>.
                    </p>

                    <button type="submit" style={buttonStyle}>Create account</button>

                </div>
            </form>
        </div>
    )

}

export default RegisterForm;