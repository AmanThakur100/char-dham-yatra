import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, socket } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (socket) {
      socket.on('booking-updated', () => fetchBookings());
      return () => socket.off('booking-updated');
    }
  }, [socket]);

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

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${cancelModal}/cancel`, { reason: cancelReason });
      setActionMsg('Booking cancelled successfully. A confirmation email has been sent.');
      setCancelModal(null);
      setCancelReason('');
      fetchBookings();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (error) {
      setActionMsg(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const canCancel = (booking) => {
    return booking.status === 'confirmed' && new Date(booking.travelDate) > new Date();
  };

  if (loading) {
    return (<div className="dashboard-loading"><div className="spinner"></div><p>Loading your dashboard...</p></div>);
  }

  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage your Char Dham Yatra bookings</p>
        </div>

        {actionMsg && <div className="dashboard-action-msg">{actionMsg}</div>}

        <div className="dashboard-stats">
          <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-info"><h3>{bookings.length}</h3><p>Total Bookings</p></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><h3>{confirmed}</h3><p>Confirmed</p></div></div>
          <div className="stat-card"><div className="stat-icon">❌</div><div className="stat-info"><h3>{cancelled}</h3><p>Cancelled</p></div></div>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h2>No Bookings Yet</h2>
            <p>Start your spiritual journey by booking a Char Dham Yatra package</p>
            <Link to="/packages" className="explore-button">Explore Packages</Link>
          </div>
        ) : (
          <div className="bookings-section">
            <h2>Your Bookings</h2>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className={`booking-card ${booking.status === 'cancelled' ? 'cancelled-card' : ''}`}>
                  <div className="booking-header-card">
                    <div>
                      <h3>{booking.packageName}</h3>
                      <p className="booking-id">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="booking-badges">
                      <div className={`status-badge ${booking.status}`}>{booking.status}</div>
                      <div className={`payment-badge ${booking.paymentStatus}`}>
                        {booking.paymentStatus === 'paid' ? '💳 Paid' : booking.paymentStatus === 'refunded' ? '↩️ Refunded' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-item"><span className="detail-label">Travelers:</span><span className="detail-value">{booking.travelers}</span></div>
                    <div className="detail-item"><span className="detail-label">Travel Date:</span><span className="detail-value">{formatDate(booking.travelDate)}</span></div>
                    <div className="detail-item"><span className="detail-label">Booking Date:</span><span className="detail-value">{formatDate(booking.bookingDate)}</span></div>
                    <div className="detail-item total"><span className="detail-label">Total Amount:</span><span className="detail-value">₹{booking.totalPrice.toLocaleString()}</span></div>
                  </div>

                  {booking.status === 'cancelled' && booking.cancellationReason && (
                    <div className="cancellation-info">
                      <span className="cancel-label">Cancellation Reason:</span> {booking.cancellationReason}
                      {booking.cancelledAt && <span className="cancel-date"> • Cancelled on {formatDate(booking.cancelledAt)}</span>}
                    </div>
                  )}

                  {canCancel(booking) && (
                    <div className="booking-actions">
                      <button className="cancel-booking-btn" onClick={() => setCancelModal(booking._id)}>❌ Cancel Booking</button>
                      <Link to={`/book/${booking.packageId}`} className="review-link-btn">✍️ Write Review</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-actions">
          <Link to="/packages" className="action-button">Book New Package</Link>
          <Link to="/profile" className="action-button secondary">Edit Profile</Link>
          {user?.isAdmin && <Link to="/admin" className="action-button admin-link">👑 Admin Dashboard</Link>}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking? If payment was made, a refund will be processed.</p>
            <div className="form-group">
              <label htmlFor="cancel-reason">Reason for cancellation *</label>
              <textarea id="cancel-reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Please provide a reason for cancellation..." rows="3" required />
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => { setCancelModal(null); setCancelReason(''); }}>Keep Booking</button>
              <button className="modal-confirm-btn" onClick={handleCancel} disabled={!cancelReason.trim() || cancelling}>
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
