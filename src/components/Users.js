import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Users.css';

const Users = () => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    } else {
      setError('Please login to view users');
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="users-page">
        <div className="users-container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>Please login to view the list of users.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="users-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchUsers} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-container">
        <div className="users-header">
          <h1>Registered Users</h1>
          <p>List of all users who have registered on the website</p>
          <div className="users-count">
            Total Users: <strong>{users.length}</strong>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <h2>No Users Found</h2>
            <p>No users have registered yet.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Bookings</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td className="user-name">{user.name}</td>
                    <td className="user-email">{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className="bookings-count">
                        {user.bookings?.length || 0}
                      </span>
                    </td>
                    <td className="user-date">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="users-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>
                {users.filter(
                  (user) =>
                    new Date(user.createdAt).toDateString() ===
                    new Date().toDateString()
                ).length}
              </h3>
              <p>Registered Today</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>
                {users.reduce(
                  (total, user) => total + (user.bookings?.length || 0),
                  0
                )}
              </h3>
              <p>Total Bookings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;

