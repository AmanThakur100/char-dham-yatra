import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { StarRating } from './Reviews';
import Recommendations from './Recommendations';
import './Packages.css';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => { fetchPackages(); }, []);

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
    return (<div className="packages-loading"><div className="spinner"></div><p>Loading packages...</p></div>);
  }

  return (
    <div className="packages-page">
      {isAuthenticated && <Recommendations />}

      <div className="packages-header" style={{ marginTop: isAuthenticated ? '40px' : '0' }}>
        <h1>All Tour Packages</h1>
        <p>Choose from our carefully curated Char Dham Yatra packages</p>
      </div>

      <div className="packages-container">
        {packages.map((pkg) => {
          const isDiscount = pkg.dynamicPrice < pkg.price;
          const isSurge = pkg.dynamicPrice > pkg.price;
          
          return (
          <div key={pkg.id} className="package-card">
            <div className="package-image">
              <img src={pkg.image} alt={pkg.name} />
              <div className="package-badge">{pkg.duration}</div>
              {isDiscount && <div className="price-badge discount">🔥 Discounted</div>}
              {isSurge && <div className="price-badge surge">📈 High Demand</div>}
            </div>
            <div className="package-content">
              <h3>{pkg.name}</h3>
              
              {pkg.avgRating > 0 && (
                <div className="package-rating">
                  <StarRating rating={Math.round(pkg.avgRating)} size="small" />
                  <span className="rating-text">{pkg.avgRating.toFixed(1)} ({pkg.reviewCount} review{pkg.reviewCount !== 1 ? 's' : ''})</span>
                </div>
              )}

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
                  <span className="price-label">Dynamic Price</span>
                  <div className="price-row">
                    {pkg.dynamicPrice !== pkg.price && (
                      <span className="price-original">₹{pkg.price.toLocaleString()}</span>
                    )}
                    <span className="price-amount dynamic">₹{pkg.dynamicPrice.toLocaleString()}</span>
                  </div>
                </div>
                {isAuthenticated ? (
                  <Link to={`/book/${pkg.id}`} className="book-button">Book Now</Link>
                ) : (
                  <Link to="/login" className="book-button">Login to Book</Link>
                )}
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Packages;
