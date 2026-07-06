import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // Reusing the same styles for consistency
import { FiUser, FiTruck, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { MdPersonAddAlt1 } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const [accountType, setAccountType] = useState('Patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!name || !phoneNumber || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber, password, role: accountType }),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.logoText}>M</span>
        </div>
        <h1 className={styles.title}>MediVerse</h1>
        <p className={styles.subtitle}>AI Powered Healthcare Platform</p>
      </div>

      {/* Account Type Selector */}
      <div className={styles.accountSelectorWrapper}>
        <p className={styles.selectorLabel}>Select Account Type</p>
        <div className={styles.accountSelector}>
          {/* Patient Card */}
          <div 
            className={`${styles.accountCard} ${accountType === 'Patient' ? styles.activeCard : ''}`}
            onClick={() => setAccountType('Patient')}
          >
            <FiUser className={styles.cardIcon} />
            <span>Patient</span>
          </div>
          
          {/* Doctor Card */}
          <div 
            className={styles.accountCard}
            onClick={() => navigate('/doctor/register')}
          >
            <FaStethoscope className={styles.cardIcon} />
            <span>Doctor</span>
          </div>

          {/* Delivery Card */}
          <div 
            className={`${styles.accountCard} ${accountType === 'Delivery' ? styles.activeCard : ''}`}
            onClick={() => setAccountType('Delivery')}
          >
            <FiTruck className={styles.cardIcon} />
            <span>Delivery</span>
          </div>
        </div>
      </div>

      {/* Register Card */}
      <div className={styles.loginCard}>
        <div className={styles.loginIconContainer}>
          <MdPersonAddAlt1 className={styles.loginIcon} />
        </div>
        <h2 className={styles.loginTitle}>Create Account</h2>
        <p className={styles.loginSubtitle}>Fill in the details to get started</p>

        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <form className={styles.loginForm} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                placeholder="Enter full name" 
                className={styles.inputField}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Phone Number</label>
            <div className={styles.phoneInputWrapper}>
              <div className={styles.countryCode}>
                <span>+91</span>
              </div>
              <input 
                type="tel" 
                placeholder="Enter phone number" 
                className={styles.inputField} 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.passwordInputWrapper}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter password" 
                className={styles.inputField} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <div className={styles.passwordInputWrapper}>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirm password" 
                className={styles.inputField} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Register'} <FiArrowRight className={styles.arrowIcon} />
          </button>
        </form>

        <p className={styles.registerText}>
          Already have an account? <Link to="/" className={styles.registerLink}>Login</Link>
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>By continuing, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
};

export default Register;
