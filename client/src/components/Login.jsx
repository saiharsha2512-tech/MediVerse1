import React, { useState } from 'react';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiTruck, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { MdPhoneInTalk } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const [accountType, setAccountType] = useState('Patient');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      setError('Please enter both phone number and password');
      toast.error('Please enter both phone number and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const payload = { phoneNumber, password, role: accountType };
      console.log('Login request payload:', payload);

      const response = await axios.post('http://localhost:5000/api/auth/login', payload);
      
      console.log('Backend response:', response.data);

      if (response.data.success) {
        login(response.data.user, response.data.token);
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Invalid credentials');
        toast.error(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Server error. Please try again later.';
      setError(errorMsg);
      toast.error(errorMsg);
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
            onClick={() => navigate('/doctor/login')}
          >
            <FaStethoscope className={styles.cardIcon} />
            <span>Doctor</span>
          </div>

          {/* Delivery Card */}
          <div 
            className={styles.accountCard}
            onClick={() => navigate('/delivery/login')}
          >
            <FiTruck className={styles.cardIcon} />
            <span>Delivery</span>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className={styles.loginCard}>
        <div className={styles.loginIconContainer}>
          <MdPhoneInTalk className={styles.loginIcon} />
        </div>
        <h2 className={styles.loginTitle}>Login</h2>
        <p className={styles.loginSubtitle}>Enter your credentials to continue</p>

        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <form className={styles.loginForm} onSubmit={handleLogin}>
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

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'} <FiArrowRight className={styles.arrowIcon} />
          </button>
        </form>

        <p className={styles.registerText}>
          Don't have an account? <Link to="/register" className={styles.registerLink}>Register</Link>
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>By continuing, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
};

export default Login;
