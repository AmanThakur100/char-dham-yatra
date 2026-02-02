import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage your Char Dham Yatra bookings</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{bookings.length}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{bookings.filter(b => b.status === 'confirmed').length}</h3>
              <p>Confirmed</p>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h2>No Bookings Yet</h2>
            <p>Start your spiritual journey by booking a Char Dham Yatra package</p>
            <Link to="/packages" className="explore-button">
              Explore Packages
            </Link>
          </div>
        ) : (
          <div className="bookings-section">
            <h2>Your Bookings</h2>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header-card">
                    <div>
                      <h3>{booking.packageName}</h3>
                      <p className="booking-id">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-item">
                      <span className="detail-label">Travelers:</span>
                      <span className="detail-value">{booking.travelers}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Travel Date:</span>
                      <span className="detail-value">{formatDate(booking.travelDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Booking Date:</span>
                      <span className="detail-value">{formatDate(booking.bookingDate)}</span>
                    </div>
                    <div className="detail-item total">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">₹{booking.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-actions">
          <Link to="/packages" className="action-button">
            Book New Package
          </Link>
          <Link to="/users" className="action-button secondary">
            View All Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

