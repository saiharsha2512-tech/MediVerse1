import React, { useState } from 'react';
import styles from './DeliveryLogin.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiArrowRight, FiTruck } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { useDeliveryAuth } from '../../context/delivery/DeliveryAuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DeliveryLogin = () => {
  const { login } = useDeliveryAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!phone.trim()) {
      setError('Phone number is required');
      toast.error('Phone number is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      toast.error('Password is required');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:5000/api/delivery/login', {
        phone: phone.trim(),
        password,
      });

      if (data.success) {
        login(data.deliveryPartner, data.token);
        toast.success(`Welcome back, ${data.deliveryPartner.fullName}!`);
        navigate('/delivery/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error. Please try again later.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.title}>MediVerse</h1>
        <p className={styles.subtitle}>AI Powered Healthcare Platform</p>
      </div>

      {/* ── Account Type Selector ── */}
      <div className={styles.accountSelectorWrapper}>
        <p className={styles.selectorLabel}>Select Account Type</p>
        <div className={styles.accountSelector}>
          {/* Patient */}
          <div
            className={styles.accountCard}
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
          >
            <FiUser className={styles.cardIcon} />
            <span>Patient</span>
          </div>

          {/* Doctor */}
          <div
            className={styles.accountCard}
            onClick={() => navigate('/doctor/login')}
            role="button"
            tabIndex={0}
          >
            <FaStethoscope className={styles.cardIcon} />
            <span>Doctor</span>
          </div>

          {/* Delivery — active */}
          <div className={`${styles.accountCard} ${styles.activeCard}`}>
            <FiTruck className={styles.cardIcon} />
            <span>Delivery</span>
          </div>
        </div>
      </div>

      {/* ── Login Card ── */}
      <div className={styles.loginCard}>
        {/* Icon */}
        <div className={styles.loginIconContainer}>
          <FiTruck className={styles.loginIcon} />
        </div>

        <h2 className={styles.loginTitle}>Delivery Partner Login</h2>
        <p className={styles.loginSubtitle}>Deliver medicines safely and efficiently</p>

        {/* Error */}
        {error && <p className={styles.errorMsg}>{error}</p>}

        <form className={styles.loginForm} onSubmit={handleLogin} noValidate>
          {/* Phone */}
          <div className={styles.inputGroup}>
            <label htmlFor="delivery-phone">Phone Number</label>
            <div className={styles.phoneInputWrapper}>
              <div className={styles.countryCode}>+91</div>
              <input
                id="delivery-phone"
                type="tel"
                placeholder="Enter phone number"
                className={styles.inputField}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="delivery-password">Password</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="delivery-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className={styles.forgotPassword}>
            <span className={styles.forgotLink} style={{ cursor: 'pointer' }}>
              Forgot Password?
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            id="delivery-login-btn"
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                Logging in...
              </>
            ) : (
              <>
                Login <FiArrowRight className={styles.arrowIcon} />
              </>
            )}
          </button>
        </form>

        {/* Register */}
        <p className={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/delivery/register" className={styles.registerLink}>
            Register
          </Link>
        </p>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <p>By continuing, you agree to our Terms &amp; Privacy Policy</p>
      </div>
    </div>
  );
};

export default DeliveryLogin;
