import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { StarRating } from './Reviews';
import './Packages.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/recommendations');
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h2>✨ Recommended For You</h2>
        <p>Personalized suggestions based on AI insights and your profile</p>
      </div>

      <div className="packages-container">
        {recommendations.map((pkg) => {
          const isDiscount = pkg.dynamicPrice < pkg.price;
          const isSurge = pkg.dynamicPrice > pkg.price;
          
          return (
            <div key={pkg.id} className="package-card recommended-card">
              <div className="package-image">
                <img src={pkg.image} alt={pkg.name} />
                <div className="package-badge ai-badge">AI Pick</div>
                {isDiscount && <div className="price-badge discount">🔥 Discounted</div>}
                {isSurge && <div className="price-badge surge">📈 High Demand</div>}
              </div>
              <div className="package-content">
                <h3>{pkg.name}</h3>
                
                {pkg.reviewCount > 0 && (
                  <div className="package-rating">
                    <StarRating rating={Math.round(pkg.avgRating || 0)} size="small" />
                    <span className="rating-text">({pkg.reviewCount} reviews)</span>
                  </div>
                )}

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
                  <Link to={`/book/${pkg.id}`} className="book-button recommend-btn">View Offer</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;
