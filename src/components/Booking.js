import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Booking.css';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    travelers: 1,
    travelDate: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPackage();
  }, [id, isAuthenticated, navigate]);

  const fetchPackage = async () => {
    try {
      const response = await api.get(`/packages/${id}`);
      setPackageData(response.data);
    } catch (error) {
      console.error('Error fetching package:', error);
      setError('Package not found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const calculateTotal = () => {
    if (!packageData) return 0;
    return packageData.price * booking.travelers;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!booking.travelDate) {
      setError('Please select a travel date');
      setSubmitting(false);
      return;
    }

    const travelDate = new Date(booking.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (travelDate < today) {
      setError('Travel date must be in the future');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/bookings', {
        packageId: packageData.id,
        packageName: packageData.name,
        travelers: parseInt(booking.travelers),
        totalPrice: calculateTotal(),
        travelDate: booking.travelDate,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="spinner"></div>
        <p>Loading package details...</p>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="booking-error">
        <p>Package not found</p>
        <button onClick={() => navigate('/packages')}>Back to Packages</button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book Your Yatra</h1>
          <p>Complete your booking for {packageData.name}</p>
        </div>

        {success && (
          <div className="success-message">
            <h3>✓ Booking Confirmed!</h3>
            <p>Your booking has been confirmed. Redirecting to dashboard...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="booking-content">
          <div className="package-summary">
            {packageData.image && (
              <div className="package-image-summary">
                <img src={packageData.image} alt={packageData.name} />
              </div>
            )}
            <h3>Package Details</h3>
            <div className="summary-item">
              <span className="summary-label">Package:</span>
              <span className="summary-value">{packageData.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{packageData.duration}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Price per person:</span>
              <span className="summary-value">₹{packageData.price.toLocaleString()}</span>
            </div>
            <div className="summary-highlights">
              <h4>Highlights:</h4>
              <ul>
                {packageData.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            <h3>Booking Information</h3>

            <div className="form-group">
              <label htmlFor="travelers">Number of Travelers</label>
              <input
                type="number"
                id="travelers"
                name="travelers"
                min="1"
                max="10"
                value={booking.travelers}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="travelDate">Travel Date</label>
              <input
                type="date"
                id="travelDate"
                name="travelDate"
                value={booking.travelDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>Price per person:</span>
                <span>₹{packageData.price.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Number of travelers:</span>
                <span>{booking.travelers}</span>
              </div>
              <div className="price-row total">
                <span>Total Amount:</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className="submit-booking" disabled={submitting || success}>
              {submitting ? 'Processing...' : success ? 'Confirmed!' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;

