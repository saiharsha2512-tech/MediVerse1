import React, { useState } from 'react';
import styles from './DeliveryLogin.module.css';
import regStyles from './DeliveryRegister.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiTruck, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useDeliveryAuth } from '../../context/delivery/DeliveryAuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const VEHICLE_TYPES = ['Bike', 'Scooter', 'Cycle', 'Car', 'Van'];

const DeliveryRegister = () => {
  const { login } = useDeliveryAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    drivingLicense: '',
    city: '',
    state: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber,
        drivingLicense: form.drivingLicense,
        city: form.city,
        state: form.state,
      };

      const { data } = await axios.post('http://localhost:5000/api/delivery/register', payload);

      if (data.success) {
        login(data.deliveryPartner, data.token);
        toast.success('Registration successful! Welcome aboard 🚀');
        navigate('/delivery/dashboard');
      } else {
        setError(data.message || 'Registration failed');
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>MediVerse</h1>
        <p className={styles.subtitle}>AI Powered Healthcare Platform</p>
      </div>

      {/* Register Card */}
      <div className={`${styles.loginCard} ${regStyles.registerCard}`}>
        <div className={styles.loginIconContainer}>
          <FiTruck className={styles.loginIcon} />
        </div>
        <h2 className={styles.loginTitle}>Delivery Partner Registration</h2>
        <p className={styles.loginSubtitle}>Join the MediVerse delivery network</p>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-fullName">Full Name *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="reg-fullName"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className={styles.inputField}
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-email">Email Address *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                className={styles.inputField}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-phone">Phone Number *</label>
            <div className={styles.phoneInputWrapper}>
              <div className={styles.countryCode}>+91</div>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                className={styles.inputField}
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Vehicle Type */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-vehicleType">Vehicle Type</label>
            <div className={styles.passwordInputWrapper}>
              <select
                id="reg-vehicleType"
                name="vehicleType"
                className={`${styles.inputField} ${regStyles.selectField}`}
                value={form.vehicleType}
                onChange={handleChange}
              >
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Number */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-vehicleNumber">Vehicle Number</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="reg-vehicleNumber"
                type="text"
                name="vehicleNumber"
                placeholder="e.g. MH12AB1234"
                className={styles.inputField}
                value={form.vehicleNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Driving License */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-drivingLicense">Driving License</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="reg-drivingLicense"
                type="text"
                name="drivingLicense"
                placeholder="Enter license number"
                className={styles.inputField}
                value={form.drivingLicense}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* City & State in a row */}
          <div className={regStyles.twoCol}>
            <div className={styles.inputGroup}>
              <label htmlFor="reg-city">City</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="reg-city"
                  type="text"
                  name="city"
                  placeholder="City"
                  className={styles.inputField}
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="reg-state">State</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="reg-state"
                  type="text"
                  name="state"
                  placeholder="State"
                  className={styles.inputField}
                  value={form.state}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-password">Password *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password (min 6 chars)"
                className={styles.inputField}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="reg-confirmPassword">Confirm Password *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="reg-confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter password"
                className={styles.inputField}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            id="delivery-register-btn"
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                Registering...
              </>
            ) : (
              <>
                Create Account <FiArrowRight className={styles.arrowIcon} />
              </>
            )}
          </button>
        </form>

        <p className={styles.registerText}>
          Already have an account?{' '}
          <Link to="/delivery/login" className={styles.registerLink}>
            Login
          </Link>
        </p>
      </div>

      <div className={styles.footer}>
        <p>By continuing, you agree to our Terms &amp; Privacy Policy</p>
      </div>
    </div>
  );
};

export default DeliveryRegister;
