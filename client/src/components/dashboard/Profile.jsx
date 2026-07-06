import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import toast from 'react-hot-toast';
import { FiCamera, FiEdit3, FiSave, FiX, FiActivity, FiCalendar, FiFileText, FiMessageCircle, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import './profile/profile.css';

import MedicalHistory from './profile/MedicalHistory';
import MedicalReports from './profile/MedicalReports';
import Settings from './profile/Settings';
import ProfileImageCrop from './profile/ProfileImageCrop';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Edit Modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Image Crop
  const [upImg, setUpImg] = useState();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      if (res.success) {
        setProfileData(res.user);
        setFormData(res.user);
        setStats(res.stats);
        setRecentActivity(res.recentActivity);
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto calculate BMI if height/weight change
    if (name === 'height' || name === 'weight') {
      const h = name === 'height' ? value : formData.height;
      const w = name === 'weight' ? value : formData.weight;
      if (h && w) {
        const heightInMeters = h / 100;
        const bmi = (w / (heightInMeters * heightInMeters)).toFixed(2);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await profileService.updateProfile(formData);
      if (res.success) {
        toast.success('Profile updated successfully');
        setProfileData(res.user);
        updateUser(res.user); // Sync with context
        setIsEditMode(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData(profileData);
    setIsEditMode(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Image Upload Logic
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setUpImg(reader.result);
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onSaveCrop = async (blob) => {
    setIsCropModalOpen(false);
    const form = new FormData();
    form.append('image', blob, 'profile.jpg');
    
    try {
      const res = await profileService.updateProfilePhoto(form);
      if (res.success) {
        toast.success('Profile photo updated');
        setProfileData({ ...profileData, profileImage: res.profileImage });
        updateUser({ ...user, profileImage: res.profileImage });
      }
    } catch (error) {
      toast.error('Failed to upload photo');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateCompleteness = () => {
    if (!profileData) return 0;
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'dob', 'gender', 'bloodGroup', 'height', 'weight', 'address', 'emergencyContactName', 'insuranceProvider'];
    const filledFields = requiredFields.filter(field => profileData[field] && profileData[field].toString().trim() !== '');
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const getBmiCategory = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return <span style={{ color: '#3b82f6', fontWeight: 600 }}>(Underweight)</span>;
    if (bmi >= 18.5 && bmi < 25) return <span style={{ color: '#10b981', fontWeight: 600 }}>(Normal)</span>;
    if (bmi >= 25 && bmi < 30) return <span style={{ color: '#f59e0b', fontWeight: 600 }}>(Overweight)</span>;
    return <span style={{ color: '#ef4444', fontWeight: 600 }}>(Obese)</span>;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="skeleton profile-header" style={{ height: '250px' }}></div>
        <div className="stats-grid">
          <div className="skeleton stat-card" style={{ height: '100px' }}></div>
          <div className="skeleton stat-card" style={{ height: '100px' }}></div>
          <div className="skeleton stat-card" style={{ height: '100px' }}></div>
        </div>
        <div className="skeleton info-card" style={{ height: '300px' }}></div>
      </div>
    );
  }

  if (!profileData) return <div>Failed to load profile.</div>;

  const completeness = calculateCompleteness();

  return (
    <div className="profile-container">
      
      {/* Header */}
      <div className="profile-header">
        {isEditMode ? (
          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={cancelEdit} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: 'rgba(255,255,255,0.9)', color: '#333' }}>
              <FiX /> Cancel
            </button>
            <button className="btn-primary" onClick={saveProfile} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none' }}>
              {isSaving ? <span className="profile-spinner"></span> : <FiSave />} 
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <button className="global-edit-btn" onClick={() => setIsEditMode(true)}>
            <FiEdit3 /> Edit Profile
          </button>
        )}
        
        <div className="profile-avatar-wrapper">
          {profileData.profileImage ? (
            <img src={`http://localhost:5000${profileData.profileImage}`} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="avatar-placeholder">{profileData.firstName?.charAt(0) || profileData.name?.charAt(0) || 'U'}</div>
          )}
          
          <input type="file" accept="image/*" onChange={onSelectFile} ref={fileInputRef} style={{ display: 'none' }} />
          <button className="edit-avatar-btn" onClick={() => fileInputRef.current.click()} title="Change Photo">
            <FiCamera size={18} />
          </button>
        </div>
        
        <h2 className="profile-name">{profileData.firstName} {profileData.lastName}</h2>
        <p className="profile-email">{profileData.email || profileData.phoneNumber}</p>
        <div className="patient-badge">Patient ID: #{profileData._id.slice(-6).toUpperCase()} • {profileData.bloodGroup || 'N/A'}</div>
      </div>

      {isCropModalOpen && (
        <ProfileImageCrop imageSrc={upImg} onCancel={() => setIsCropModalOpen(false)} onSave={onSaveCrop} />
      )}

      {/* Completeness Bar */}
      {completeness < 100 && (
        <div className="info-card" style={{ padding: '15px 20px', background: '#f8fafc', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>Profile Completeness</span>
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>{completeness}%</span>
          </div>
          <div className="progress-container"><div className="progress-bar" style={{ width: `${completeness}%`, background: '#f59e0b' }}></div></div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '5px 0 0 0' }}>Complete your profile to get the most out of MediVerse AI.</p>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <FiActivity size={24} color="#3b82f6" />
          <div className="stat-value">{stats.consultations || 0}</div>
          <div className="stat-label">Consultations</div>
        </div>
        <div className="stat-card cyan">
          <FiCalendar size={24} color="#06b6d4" />
          <div className="stat-value">{stats.appointments || 0}</div>
          <div className="stat-label">Appointments</div>
        </div>
        <div className="stat-card green">
          <FiShoppingBag size={24} color="#10b981" />
          <div className="stat-value">{stats.orders || 0}</div>
          <div className="stat-label">Medicine Orders</div>
        </div>
        <div className="stat-card purple">
          <FiFileText size={24} color="#8b5cf6" />
          <div className="stat-value">{stats.reports || 0}</div>
          <div className="stat-label">Reports</div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="info-card">
        <div className="section-title">Personal Information</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">First Name</span>
            {isEditMode ? <input name="firstName" className="form-input" value={formData.firstName || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.firstName || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Last Name</span>
            {isEditMode ? <input name="lastName" className="form-input" value={formData.lastName || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.lastName || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            {isEditMode ? <input type="email" name="email" className="form-input" value={formData.email || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.email || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Phone Number</span>
            {isEditMode ? <input name="phoneNumber" className="form-input" value={formData.phoneNumber || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.phoneNumber}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Date of Birth</span>
            {isEditMode ? <input type="date" name="dob" className="form-input" value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Gender</span>
            {isEditMode ? (
              <select name="gender" className="form-select" value={formData.gender || ''} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : <span className="info-value">{profileData.gender || '-'}</span>}
          </div>
          <div className="info-item full-width">
            <span className="info-label">Address</span>
            {isEditMode ? <input name="address" className="form-input" value={formData.address || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.address || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">City</span>
            {isEditMode ? <input name="city" className="form-input" value={formData.city || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.city || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">State</span>
            {isEditMode ? <input name="state" className="form-input" value={formData.state || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.state || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Country</span>
            {isEditMode ? <input name="country" className="form-input" value={formData.country || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.country || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Pincode</span>
            {isEditMode ? <input name="pincode" className="form-input" value={formData.pincode || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.pincode || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Occupation</span>
            {isEditMode ? <input name="occupation" className="form-input" value={formData.occupation || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.occupation || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Marital Status</span>
            {isEditMode ? (
              <select name="maritalStatus" className="form-select" value={formData.maritalStatus || ''} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            ) : <span className="info-value">{profileData.maritalStatus || '-'}</span>}
          </div>
        </div>
      </div>

      {/* Health Info */}
      <div className="info-card">
        <div className="section-title">Health Information</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Blood Group</span>
            {isEditMode ? (
              <select name="bloodGroup" className="form-select" value={formData.bloodGroup || ''} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            ) : <span className="info-value">{profileData.bloodGroup || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Height (cm)</span>
            {isEditMode ? <input type="number" name="height" className="form-input" value={formData.height || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.height ? `${profileData.height} cm` : '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Weight (kg)</span>
            {isEditMode ? <input type="number" name="weight" className="form-input" value={formData.weight || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.weight ? `${profileData.weight} kg` : '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">BMI</span>
            {isEditMode ? (
              <input disabled className="form-input" value={formData.bmi || ''} style={{ background: '#f3f4f6' }} />
            ) : (
              <span className="info-value">{profileData.bmi || '-'} {getBmiCategory(profileData.bmi)}</span>
            )}
          </div>
          <div className="info-item">
            <span className="info-label">Emergency Contact Name</span>
            {isEditMode ? <input name="emergencyContactName" className="form-input" value={formData.emergencyContactName || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.emergencyContactName || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Emergency Phone</span>
            {isEditMode ? <input name="emergencyContactPhone" className="form-input" value={formData.emergencyContactPhone || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.emergencyContactPhone || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Insurance Provider</span>
            {isEditMode ? <input name="insuranceProvider" className="form-input" value={formData.insuranceProvider || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.insuranceProvider || '-'}</span>}
          </div>
          <div className="info-item">
            <span className="info-label">Insurance Number</span>
            {isEditMode ? <input name="insuranceNumber" className="form-input" value={formData.insuranceNumber || ''} onChange={handleInputChange} /> : <span className="info-value">{profileData.insuranceNumber || '-'}</span>}
          </div>
        </div>

      </div>

      <MedicalHistory />
      
      <MedicalReports />
      
      <Settings userProfile={profileData} refreshProfile={fetchProfileData} />

      <button 
        onClick={handleLogout} 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '15px',
          marginTop: '30px',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          border: '1px solid #f87171',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <FiLogOut size={20} /> Logout
      </button>
      
    </div>
  );
};

export default Profile;
