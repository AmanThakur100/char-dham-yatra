import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Reviews.css';

const StarRating = ({ rating, onRate, interactive = false, size = 'medium' }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`star-rating ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >★</span>
      ))}
    </div>
  );
};

const Reviews = ({ packageId, packageName }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 0, title: '', comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [packageId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${packageId}`);
      setReviews(response.data.reviews);
      setAvgRating(response.data.avgRating);
      setTotalReviews(response.data.totalReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.rating === 0) { setError('Please select a rating'); return; }
    if (!formData.title.trim()) { setError('Please enter a title'); return; }
    if (!formData.comment.trim()) { setError('Please enter a comment'); return; }

    setSubmitting(true);
    try {
      await api.post('/reviews', { packageId, ...formData });
      setSuccess('Review submitted successfully!');
      setFormData({ rating: 0, title: '', comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const hasReviewed = reviews.some(r => r.userId?._id === user?.id);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <div className="reviews-summary">
          <h3>Reviews & Ratings</h3>
          {totalReviews > 0 && (
            <div className="rating-overview">
              <span className="avg-rating-number">{(Math.round(avgRating * 10) / 10).toFixed(1)}</span>
              <StarRating rating={Math.round(avgRating)} size="medium" />
              <span className="review-count">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        {isAuthenticated && !hasReviewed && !showForm && (
          <button className="write-review-btn" onClick={() => setShowForm(true)}>✍️ Write a Review</button>
        )}
      </div>

      {success && <div className="review-success">{success}</div>}
      {error && <div className="review-error">{error}</div>}

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Write Your Review for {packageName}</h4>
          <div className="form-group">
            <label>Your Rating</label>
            <StarRating rating={formData.rating} onRate={(r) => setFormData({...formData, rating: r})} interactive={true} size="large" />
          </div>
          <div className="form-group">
            <label htmlFor="review-title">Title</label>
            <input type="text" id="review-title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Summarize your experience" />
          </div>
          <div className="form-group">
            <label htmlFor="review-comment">Your Review</label>
            <textarea id="review-comment" value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} placeholder="Tell others about your experience..." rows="4" />
          </div>
          <div className="review-form-actions">
            <button type="button" className="cancel-review-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="submit-review-btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="reviews-loading"><div className="spinner"></div><p>Loading reviews...</p></div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{review.userId?.name?.[0]?.toUpperCase() || '?'}</div>
                  <div>
                    <span className="reviewer-name">{review.userId?.name || 'Anonymous'}</span>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} size="small" />
              </div>
              <h4 className="review-title">{review.title}</h4>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { StarRating };
export default Reviews;
