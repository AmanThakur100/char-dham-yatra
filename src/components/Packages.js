import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Packages.css';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages');
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="packages-loading">
        <div className="spinner"></div>
        <p>Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="packages-page">
      <div className="packages-header">
        <h1>Tour Packages</h1>
        <p>Choose from our carefully curated Char Dham Yatra packages</p>
      </div>

      <div className="packages-container">
        {packages.map((pkg) => (
          <div key={pkg.id} className="package-card">
            <div className="package-image">
              <img src={pkg.image} alt={pkg.name} />
              <div className="package-badge">{pkg.duration}</div>
            </div>
            <div className="package-content">
              <h3>{pkg.name}</h3>
              <p className="package-description">{pkg.description}</p>
              
              <div className="package-highlights">
                <h4>Highlights:</h4>
                <ul>
                  {pkg.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="package-footer">
                <div className="package-price">
                  <span className="price-label">Starting from</span>
                  <span className="price-amount">₹{pkg.price.toLocaleString()}</span>
                </div>
                {isAuthenticated ? (
                  <Link to={`/book/${pkg.id}`} className="book-button">
                    Book Now
                  </Link>
                ) : (
                  <Link to="/login" className="book-button">
                    Login to Book
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Packages;

