import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileMsg({ type: '', text: '' });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMsg({ type: '', text: '' });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(profileData);
    if (result.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setProfileMsg({ type: 'error', text: result.message });
    }
    setSaving(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setSaving(true);
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMsg({ type: 'error', text: result.message });
    }
    setSaving(false);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">{getInitials(user?.name)}</div>
            <h2>{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            {user?.isAdmin && <span className="admin-badge-profile">Admin</span>}
          </div>
          <div className="profile-info-card">
            <div className="info-item">
              <span className="info-icon">📅</span>
              <div>
                <p className="info-label">Member Since</p>
                <p className="info-value">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <p className="info-label">Phone</p>
                <p className="info-value">{user?.phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              ✏️ Edit Profile
            </button>
            <button className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
              🔒 Change Password
            </button>
          </div>

          {activeTab === 'profile' && (
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <h3>Edit Profile</h3>
              {profileMsg.text && (
                <div className={`profile-message ${profileMsg.type}`}>{profileMsg.text}</div>
              )}
              <div className="form-group">
                <label htmlFor="profile-name">Full Name</label>
                <input type="text" id="profile-name" name="name" value={profileData.name} onChange={handleProfileChange} required placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label htmlFor="profile-phone">Phone Number</label>
                <input type="tel" id="profile-phone" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="Enter your phone number" />
              </div>
              <div className="form-group">
                <label htmlFor="profile-address">Address</label>
                <input type="text" id="profile-address" name="address" value={profileData.address} onChange={handleProfileChange} placeholder="Enter your address" />
              </div>
              <div className="form-group">
                <label htmlFor="profile-bio">Bio</label>
                <textarea id="profile-bio" name="bio" value={profileData.bio} onChange={handleProfileChange} placeholder="Tell us about yourself..." rows="4" />
              </div>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <h3>Change Password</h3>
              {passwordMsg.text && (
                <div className={`profile-message ${passwordMsg.type}`}>{passwordMsg.text}</div>
              )}
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="Enter new password (min 6 chars)" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Confirm new password" />
              </div>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
