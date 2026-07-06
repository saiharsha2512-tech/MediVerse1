import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../components/Login.module.css'; // Reusing exactly the same styling as Patient portal
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaUserMd } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    medicalRegistrationNumber: '', specialty: '', qualification: '', experience: '',
    hospital: '', fee: '', city: '', state: '', image: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    if (!formData.name || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        medicalRegistrationNumber: formData.medicalRegistrationNumber,
        specialty: formData.specialty,
        qualification: formData.qualification,
        experience: formData.experience,
        hospital: formData.hospital,
        fee: formData.fee,
        city: formData.city,
        state: formData.state,
        image: formData.image
      };

      const response = await axios.post('http://localhost:5000/api/doctor/register', payload);
      
      if (response.data.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/doctor/login');
      } else {
        setError(response.data.message || 'Registration failed');
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMsg = err.response?.data?.message || 'Server error. Please try again later.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ height: 'auto', minHeight: '100vh', padding: '2rem 1rem' }}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.logoText}>M</span>
        </div>
        <h1 className={styles.title}>MediVerse</h1>
        <p className={styles.subtitle}>AI Powered Healthcare Platform</p>
      </div>

      {/* Register Card */}
      <div className={styles.loginCard}>
        <div className={styles.loginIconContainer}>
          <FaUserMd className={styles.loginIcon} />
        </div>
        <h2 className={styles.loginTitle}>Doctor Registration</h2>
        <p className={styles.loginSubtitle}>Fill in the details to get started</p>

        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <form className={styles.loginForm} onSubmit={handleRegister}>
          
          <div className={styles.inputGroup}>
            <label>Profile Photo Upload</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.inputField}
                style={{ padding: '0.7rem 1rem' }}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="name"
                placeholder="Enter full name" 
                className={styles.inputField}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="email" 
                name="email"
                placeholder="Enter email address" 
                className={styles.inputField}
                value={formData.email}
                onChange={handleChange}
                required
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
                name="phone"
                placeholder="Enter phone number" 
                className={styles.inputField} 
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Medical Registration Number</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="medicalRegistrationNumber"
                placeholder="Enter registration number" 
                className={styles.inputField}
                value={formData.medicalRegistrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Specialization</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="specialty"
                placeholder="e.g., Cardiologist" 
                className={styles.inputField}
                value={formData.specialty}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Qualification</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="qualification"
                placeholder="e.g., MBBS, MD" 
                className={styles.inputField}
                value={formData.qualification}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Experience (Years)</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="number" 
                name="experience"
                placeholder="e.g., 5" 
                className={styles.inputField}
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Hospital / Clinic</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="hospital"
                placeholder="Enter hospital name" 
                className={styles.inputField}
                value={formData.hospital}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Consultation Fee (₹)</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="number" 
                name="fee"
                placeholder="Enter fee amount" 
                className={styles.inputField}
                value={formData.fee}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>City</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="city"
                placeholder="Enter city" 
                className={styles.inputField}
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>State</label>
            <div className={styles.phoneInputWrapper}>
              <input 
                type="text" 
                name="state"
                placeholder="Enter state" 
                className={styles.inputField}
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.passwordInputWrapper}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                placeholder="Enter password" 
                className={styles.inputField} 
                value={formData.password}
                onChange={handleChange}
                required
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
                name="confirmPassword"
                placeholder="Confirm password" 
                className={styles.inputField} 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
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
          Already have an account? <Link to="/doctor/login" className={styles.registerLink}>Login</Link>
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
