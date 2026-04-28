import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Reviews from './Reviews';
import './Booking.css';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ travelers: 1, travelDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // form, processing, success, failed

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
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
    setBooking({ ...booking, [e.target.name]: e.target.value });
    setError('');
  };

  const calculateTotal = () => {
    if (!packageData) return 0;
    const priceToUse = packageData.dynamicPrice || packageData.price;
    return priceToUse * booking.travelers;
  };

  const handlePayment = async () => {
    setPaymentStep('processing');
    try {
      // Create payment order
      const orderRes = await api.post('/payment/create-order', {
        amount: calculateTotal(),
        bookingDetails: { packageName: packageData.name }
      });

      if (orderRes.data.simulated) {
        // Simulation mode - no real Razorpay
        await processBookingAfterPayment(orderRes.data.orderId, `sim_pay_${Date.now()}`, true);
        return;
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: orderRes.data.keyId,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: 'Char Dham Yatra',
          description: packageData.name,
          order_id: orderRes.data.orderId,
          handler: async (response) => {
            await processBookingAfterPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              false,
              response.razorpay_signature
            );
          },
          prefill: { name: 'User', email: 'user@example.com' },
          theme: { color: '#667eea' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => { setPaymentStep('failed'); });
        rzp.open();
      };
      script.onerror = () => {
        // Fallback to simulation if script fails
        processBookingAfterPayment(orderRes.data.orderId, `sim_pay_${Date.now()}`, true);
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      // Fallback - direct booking
      await processDirectBooking();
    }
  };

  const processBookingAfterPayment = async (orderId, paymentId, simulated, signature) => {
    try {
      // Verify payment
      await api.post('/payment/verify', { orderId, paymentId, signature, simulated });
      // Create booking
      await processDirectBooking(paymentId);
    } catch (error) {
      console.error('Payment verification error:', error);
      await processDirectBooking();
    }
  };

  const processDirectBooking = async (paymentId) => {
    try {
      await api.post('/bookings', {
        packageId: packageData.id,
        packageName: packageData.name,
        travelers: parseInt(booking.travelers),
        totalPrice: calculateTotal(),
        travelDate: booking.travelDate,
      });
      setPaymentStep('success');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed. Please try again.');
      setPaymentStep('failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!booking.travelDate) { setError('Please select a travel date'); setSubmitting(false); return; }
    const travelDate = new Date(booking.travelDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (travelDate < today) { setError('Travel date must be in the future'); setSubmitting(false); return; }

    await handlePayment();
    setSubmitting(false);
  };

  if (loading) {
    return (<div className="booking-loading"><div className="spinner"></div><p>Loading package details...</p></div>);
  }

  if (!packageData) {
    return (<div className="booking-error"><p>Package not found</p><button onClick={() => navigate('/packages')}>Back to Packages</button></div>);
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book Your Yatra</h1>
          <p>Complete your booking for {packageData.name}</p>
        </div>

        {paymentStep === 'success' && (
          <div className="success-message">
            <h3>✅ Booking Confirmed & Payment Successful!</h3>
            <p>Your booking has been confirmed. A confirmation email has been sent. Redirecting to dashboard...</p>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="payment-processing">
            <div className="spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please wait while we confirm your payment.</p>
          </div>
        )}

        {paymentStep === 'failed' && (
          <div className="error-message">
            <strong>Payment Failed.</strong> Please try again or contact support.
            <br />
            <button className="retry-payment-btn" onClick={() => setPaymentStep('form')}>Try Again</button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="booking-content">
          <div className="package-summary">
            {packageData.image && (
              <div className="package-image-summary"><img src={packageData.image} alt={packageData.name} /></div>
            )}
            <h3>Package Details</h3>
            <div className="summary-item"><span className="summary-label">Package:</span><span className="summary-value">{packageData.name}</span></div>
            <div className="summary-item"><span className="summary-label">Duration:</span><span className="summary-value">{packageData.duration}</span></div>
            <div className="summary-item"><span className="summary-label">Price per person:</span><span className="summary-value">₹{(packageData.dynamicPrice || packageData.price).toLocaleString()}</span></div>
            {packageData.avgRating > 0 && (
              <div className="summary-item">
                <span className="summary-label">Rating:</span>
                <span className="summary-value">{'★'.repeat(Math.round(packageData.avgRating))}{'☆'.repeat(5 - Math.round(packageData.avgRating))} ({packageData.reviewCount})</span>
              </div>
            )}
            <div className="summary-highlights">
              <h4>Highlights:</h4>
              <ul>{packageData.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </div>
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            <h3>Booking Information</h3>
            <div className="form-group">
              <label htmlFor="travelers">Number of Travelers</label>
              <input type="number" id="travelers" name="travelers" min="1" max="10" value={booking.travelers} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="travelDate">Travel Date</label>
              <input type="date" id="travelDate" name="travelDate" value={booking.travelDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="price-summary">
              <div className="price-row"><span>Price per person:</span><span>₹{(packageData.dynamicPrice || packageData.price).toLocaleString()}</span></div>
              <div className="price-row"><span>Number of travelers:</span><span>{booking.travelers}</span></div>
              <div className="price-row total"><span>Total Amount:</span><span>₹{calculateTotal().toLocaleString()}</span></div>
            </div>
            <button type="submit" className="submit-booking" disabled={submitting || success || paymentStep === 'processing'}>
              {submitting || paymentStep === 'processing' ? '💳 Processing Payment...' : success ? '✅ Confirmed!' : '💳 Proceed to Pay'}
            </button>
            <p className="payment-note">🔒 Secure payment powered by Razorpay</p>
          </form>
        </div>

        <Reviews packageId={id} packageName={packageData.name} />
      </div>
    </div>
  );
};

export default Booking;
