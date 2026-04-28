import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, socket } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  
  // Package form state
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '', duration: '', price: '', description: '', highlights: '', image: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (socket) {
      socket.on('booking-created', () => fetchData());
      socket.on('booking-cancelled', () => fetchData());
      socket.on('booking-updated', () => fetchData());
      return () => {
        socket.off('booking-created');
        socket.off('booking-cancelled');
        socket.off('booking-updated');
      };
    }
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'bookings') {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/bookings')
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      }
      if (activeTab === 'users') {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
      }
      if (activeTab === 'packages') {
        const packagesRes = await api.get('/admin/packages');
        setPackages(packagesRes.data);
      }
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      setActionMsg(`Booking ${status} successfully`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (error) {
      setActionMsg('Failed to update booking');
    }
  };

  const handlePackageFormChange = (e) => {
    setPackageFormData({ ...packageFormData, [e.target.name]: e.target.value });
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...packageFormData,
        highlights: packageFormData.highlights.split(',').map(h => h.trim()).filter(h => h)
      };
      
      if (editingPackageId) {
        await api.put(`/admin/packages/${editingPackageId}`, payload);
        setActionMsg('Package updated successfully');
      } else {
        await api.post('/admin/packages', payload);
        setActionMsg('Package created successfully');
      }
      
      setShowPackageForm(false);
      setEditingPackageId(null);
      setPackageFormData({ name: '', duration: '', price: '', description: '', highlights: '', image: '' });
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (error) {
      setActionMsg(error.response?.data?.message || 'Failed to save package');
    }
  };

  const editPackage = (pkg) => {
    setEditingPackageId(pkg._id);
    setPackageFormData({
      name: pkg.name,
      duration: pkg.duration,
      price: pkg.price,
      description: pkg.description,
      highlights: pkg.highlights.join(', '),
      image: pkg.image
    });
    setShowPackageForm(true);
  };

  const togglePackageStatus = async (pkg) => {
    try {
      await api.put(`/admin/packages/${pkg._id}`, { isActive: !pkg.isActive });
      setActionMsg(`Package ${!pkg.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (error) {
      setActionMsg('Failed to update package status');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const formatCurrency = (n) => `₹${(n || 0).toLocaleString()}`;

  if (!user?.isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-access-denied">
          <div className="denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You do not have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your Char Dham Yatra platform</p>
          </div>
          <div className="admin-badge">👑 Admin</div>
        </div>

        {actionMsg && <div className="admin-action-msg">{actionMsg}</div>}

        <div className="admin-tabs">
          {['overview', 'bookings', 'users', 'packages'].map(tab => (
            <button key={tab} className={`admin-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'overview' ? '📊 Overview' : tab === 'bookings' ? '📦 Bookings' : tab === 'users' ? '👥 Users' : '🏔️ Packages'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading"><div className="spinner"></div><p>Loading...</p></div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="admin-overview">
                <div className="stats-grid">
                  <div className="admin-stat-card stat-users">
                    <div className="stat-icon-admin">👥</div>
                    <div className="stat-number">{stats.totalUsers}</div>
                    <div className="stat-label-admin">Total Users</div>
                  </div>
                  <div className="admin-stat-card stat-bookings">
                    <div className="stat-icon-admin">📦</div>
                    <div className="stat-number">{stats.totalBookings}</div>
                    <div className="stat-label-admin">Total Bookings</div>
                  </div>
                  <div className="admin-stat-card stat-revenue">
                    <div className="stat-icon-admin">💰</div>
                    <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="stat-label-admin">Total Revenue</div>
                  </div>
                  <div className="admin-stat-card stat-today">
                    <div className="stat-icon-admin">📅</div>
                    <div className="stat-number">{stats.todayBookings}</div>
                    <div className="stat-label-admin">Today's Bookings</div>
                  </div>
                  <div className="admin-stat-card stat-confirmed">
                    <div className="stat-icon-admin">✅</div>
                    <div className="stat-number">{stats.confirmedBookings}</div>
                    <div className="stat-label-admin">Confirmed</div>
                  </div>
                  <div className="admin-stat-card stat-cancelled">
                    <div className="stat-icon-admin">❌</div>
                    <div className="stat-number">{stats.cancelledBookings}</div>
                    <div className="stat-label-admin">Cancelled</div>
                  </div>
                </div>

                <div className="recent-bookings-admin">
                  <h3>Recent Bookings</h3>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr><th>User</th><th>Package</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map(b => (
                          <tr key={b._id}>
                            <td>{b.userId?.name || 'N/A'}</td>
                            <td>{b.packageName}</td>
                            <td>{formatDate(b.travelDate)}</td>
                            <td className="amount-cell">{formatCurrency(b.totalPrice)}</td>
                            <td><span className={`admin-status ${b.status}`}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="admin-bookings">
                <h3>All Bookings ({bookings.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr><th>ID</th><th>User</th><th>Package</th><th>Travelers</th><th>Travel Date</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b._id}>
                          <td className="booking-id-cell">{b._id.slice(-6).toUpperCase()}</td>
                          <td>
                            <div className="user-cell">
                              <span className="user-cell-name">{b.userId?.name || 'N/A'}</span>
                              <span className="user-cell-email">{b.userId?.email || ''}</span>
                            </div>
                          </td>
                          <td>{b.packageName}</td>
                          <td>{b.travelers}</td>
                          <td>{formatDate(b.travelDate)}</td>
                          <td className="amount-cell">{formatCurrency(b.totalPrice)}</td>
                          <td><span className={`admin-payment-status ${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                          <td><span className={`admin-status ${b.status}`}>{b.status}</span></td>
                          <td className="actions-cell">
                            {b.status === 'confirmed' && (
                              <button className="admin-action-btn cancel" onClick={() => updateBookingStatus(b._id, 'cancelled')}>Cancel</button>
                            )}
                            {b.status === 'cancelled' && (
                              <button className="admin-action-btn confirm" onClick={() => updateBookingStatus(b._id, 'confirmed')}>Restore</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-users">
                <h3>All Users ({users.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Bookings</th><th>Registered</th></tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id}>
                          <td>{i + 1}</td>
                          <td className="user-cell-name">{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || 'N/A'}</td>
                          <td>{u.isAdmin ? <span className="admin-role-badge">Admin</span> : <span className="user-role-badge">User</span>}</td>
                          <td><span className="bookings-count-badge">{u.bookings?.length || 0}</span></td>
                          <td>{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="admin-packages">
                <div className="admin-section-header">
                  <h3>Manage Packages ({packages.length})</h3>
                  <button 
                    className="admin-action-btn confirm" 
                    onClick={() => {
                      setEditingPackageId(null);
                      setPackageFormData({ name: '', duration: '', price: '', description: '', highlights: '', image: '' });
                      setShowPackageForm(!showPackageForm);
                    }}
                  >
                    {showPackageForm ? 'Cancel' : '+ Add New Package'}
                  </button>
                </div>

                {showPackageForm && (
                  <div className="admin-form-container">
                    <h4>{editingPackageId ? 'Edit Package' : 'Create New Package'}</h4>
                    <form onSubmit={handlePackageSubmit} className="admin-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Package Name</label>
                          <input type="text" name="name" value={packageFormData.name} onChange={handlePackageFormChange} required />
                        </div>
                        <div className="form-group">
                          <label>Duration (e.g. 5 Days)</label>
                          <input type="text" name="duration" value={packageFormData.duration} onChange={handlePackageFormChange} required />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Price (₹)</label>
                          <input type="number" name="price" value={packageFormData.price} onChange={handlePackageFormChange} required />
                        </div>
                        <div className="form-group">
                          <label>Image URL (Optional)</label>
                          <input type="text" name="image" value={packageFormData.image} onChange={handlePackageFormChange} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={packageFormData.description} onChange={handlePackageFormChange} rows="3" required></textarea>
                      </div>
                      <div className="form-group">
                        <label>Highlights (Comma separated)</label>
                        <input type="text" name="highlights" value={packageFormData.highlights} onChange={handlePackageFormChange} placeholder="Temple Visit, Scenic Views, etc." />
                      </div>
                      <button type="submit" className="admin-submit-btn">
                        {editingPackageId ? 'Update Package' : 'Create Package'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {packages.map(pkg => (
                        <tr key={pkg._id} className={!pkg.isActive ? 'inactive-row' : ''}>
                          <td className="user-cell-name">{pkg.name}</td>
                          <td>{pkg.duration}</td>
                          <td className="amount-cell">{formatCurrency(pkg.price)}</td>
                          <td>
                            <span className={`admin-status ${pkg.isActive ? 'confirmed' : 'cancelled'}`}>
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button className="admin-action-btn edit" onClick={() => editPackage(pkg)}>Edit</button>
                            <button 
                              className={`admin-action-btn ${pkg.isActive ? 'cancel' : 'confirm'}`} 
                              onClick={() => togglePackageStatus(pkg)}
                            >
                              {pkg.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
