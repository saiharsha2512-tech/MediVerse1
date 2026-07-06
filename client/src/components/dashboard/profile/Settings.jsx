import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import profileService from '../../../services/profileService';
import './profile.css';

const Settings = ({ userProfile, refreshProfile }) => {
  const { logout } = useAuth();
  
  // Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  
  // Delete account state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Notifications
  const handleToggle = async (key, value) => {
    try {
      const updatedNotifications = { ...userProfile.notifications, [key]: value };
      await profileService.updateProfile({ notifications: updatedNotifications });
      refreshProfile();
      toast.success('Preference updated');
    } catch (error) {
      toast.error('Failed to update preference');
    }
  };

  // Password Logic
  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) setPasswordStrength({ score, label: 'Weak', color: '#ef4444' });
    else if (score <= 4) setPasswordStrength({ score, label: 'Medium', color: '#f59e0b' });
    else setPasswordStrength({ score, label: 'Strong', color: '#10b981' });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (e.target.name === 'newPassword') {
      checkPasswordStrength(e.target.value);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordStrength.score < 3) {
      return toast.error('Please choose a stronger password');
    }

    try {
      await profileService.changePassword({ 
        currentPassword: passwords.currentPassword, 
        newPassword: passwords.newPassword 
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength({ score: 0, label: '', color: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    try {
      await profileService.deleteAccount(deletePassword);
      toast.success('Account deleted permanently');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  if (!userProfile) return null;

  return (
    <div className="settings-wrapper">
      
      {/* Notifications */}
      <div className="info-card">
        <div className="section-title">Notification Preferences</div>
        
        <div className="setting-row">
          <div>
            <div style={{ fontWeight: 500 }}>Appointment Reminders</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Get notified about upcoming appointments</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={userProfile.notifications?.appointments} onChange={(e) => handleToggle('appointments', e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div>
            <div style={{ fontWeight: 500 }}>Medicine Reminders</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Daily alerts to take your medicines</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={userProfile.notifications?.medicines} onChange={(e) => handleToggle('medicines', e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-row">
          <div>
            <div style={{ fontWeight: 500 }}>AI Health Alerts</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Personalized health insights from MediVerse AI</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={userProfile.notifications?.aiAlerts} onChange={(e) => handleToggle('aiAlerts', e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

      </div>

      {/* Security */}
      <div className="info-card">
        <div className="section-title">Security & Password</div>
        <form onSubmit={submitPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <div>
            <label className="info-label">Current Password</label>
            <input type="password" required name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="form-input" />
          </div>
          <div>
            <label className="info-label">New Password</label>
            <input type="password" required name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="form-input" />
            {passwords.newPassword && (
              <div>
                <div className="password-strength-bar" style={{ width: `${(passwordStrength.score / 5) * 100}%`, background: passwordStrength.color }}></div>
                <div style={{ fontSize: '0.75rem', color: passwordStrength.color, marginTop: '3px' }}>{passwordStrength.label} Password</div>
              </div>
            )}
          </div>
          <div>
            <label className="info-label">Confirm New Password</label>
            <input type="password" required name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className="form-input" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="info-card" style={{ border: '1px solid #fee2e2', background: '#fff5f5' }}>
        <div className="section-title" style={{ color: '#ef4444', borderColor: '#fecaca' }}>Danger Zone</div>
        <p style={{ color: '#4b5563', marginBottom: '15px' }}>
          Permanently delete your account and all associated data, including medical history, reports, and appointments. This action cannot be undone.
        </p>
        <button className="btn-danger" onClick={() => setDeleteModalOpen(true)}>Delete Account</button>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Confirm Account Deletion</h3>
            <p style={{ marginBottom: '20px', color: '#4b5563' }}>Please enter your password to confirm you want to permanently delete your account.</p>
            <form onSubmit={handleDeleteAccount}>
              <input 
                type="password" 
                placeholder="Enter password" 
                className="form-input" 
                required 
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ marginBottom: '20px' }}
              />
              <div className="action-bar">
                <button type="button" className="btn-secondary" onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); }}>Cancel</button>
                <button type="submit" className="btn-danger">Yes, Delete Everything</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
