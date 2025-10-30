import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css'; // Import the new stylesheet

const LandingPage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Array of features to display in the grid
  const features = [
    {
      icon: '🚀',
      title: 'Campaign Management',
      description: 'Create, schedule, and manage bulk WhatsApp campaigns with an intuitive interface. Reach thousands of customers at once.',
    },
    {
      icon: '📝',
      title: 'Message Templates',
      description: 'Pre-save and reuse frequently sent messages. Personalize your templates with dynamic variables like {{name}} for a custom touch.',
    },
    {
      icon: '👥',
      title: 'Contact Management',
      description: 'Easily upload your contact lists via CSV. Segment your audience into groups for targeted and effective messaging.',
    },
    {
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'Get visual insights into your campaign performance. Track key metrics like delivery rates and message volume to optimize your strategy.',
    },
    {
      icon: '✅',
      title: 'Admin Approval System',
      description: 'A powerful admin dashboard allows for client management and the review and approval of message templates, ensuring quality control.',
    },
    {
      icon: '🔒',
      title: 'Seamless & Secure API',
      description: 'Built on top of the official WhatsApp Business API for reliable, secure, and scalable communication with your clients.',
    },
  ];

  return (
    <div className="landing-page-container">
      {/* --- Navigation Bar --- */}
      <nav className="landing-nav">
        <Link to="/" className="nav-logo">
          CHV Whatsapp
        </Link>
        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-button">Sign Up</Link>
            </>
          ) : (
            <>
              <span style={{ color: '#333' }}>Hello, {user.name}!</span>
              {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
              {user.role === 'client' && <Link to="/client">My Dashboard</Link>}
              <button onClick={logout} className="nav-button">Logout</button>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* --- Hero Section --- */}
        <section className="hero-section">
          <h1 className="hero-title">
            The Ultimate WhatsApp Marketing Platform
          </h1>
          <p className="hero-subtitle">
            Connect, engage, and grow your business with powerful bulk messaging,
            contact management, and insightful analytics, all through the official WhatsApp Business API.
          </p>
          <Link to="/register" className="hero-cta">
            Get Started for Free
          </Link>
        </section>

        {/* --- Features Section --- */}
        <section className="features-section">
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CHV Whatsapp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;