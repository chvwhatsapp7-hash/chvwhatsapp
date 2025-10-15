import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css'; // We'll create this CSS file next

const Hero = () => {
  return (
    <div className="hero-container">
      <h1 className="hero-title">
        Power Your WhatsApp Marketing with WANotifier
      </h1>
      <p className="hero-subtitle">
        Effortlessly connect with your customers, send personalized messages,
        and drive engagement directly through the WhatsApp Business API.
      </p>
      <Link to="/register" className="hero-cta-button">
        Get Started for Free
      </Link>
    </div>
  );
};

export default Hero;