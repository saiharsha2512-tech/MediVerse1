import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiUsers, FiDollarSign, FiSettings, FiLogOut } from 'react-icons/fi';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import { useState, useEffect } from 'react';
import api from '../../services/doctor/api';
import styles from '../../pages/doctor/DoctorDashboard.module.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { logoutDoctor, doctor } = useDoctorAuth();
  const [doctorProfile, setDoctorProfile] = useState({
    name: doctor?.name || '...',
    specialization: doctor?.specialty || doctor?.specialization || '...',
    image: doctor?.image || null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success) {
          setDoctorProfile(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load profile in sidebar', error);
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <FiHome className={styles.navIcon} /> },
    { name: 'Appointments', path: '/doctor/appointments', icon: <FiCalendar className={styles.navIcon} /> },
    { name: 'Patients', path: '/doctor/patients', icon: <FiUsers className={styles.navIcon} /> },
    { name: 'Revenue', path: '/doctor/revenue', icon: <FiDollarSign className={styles.navIcon} /> },
    { name: 'Settings', path: '/doctor/settings', icon: <FiSettings className={styles.navIcon} /> },
  ];

  return (
    <>
      <div 
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayOpen : ''}`}
        onClick={() => setSidebarOpen(false)}
        style={{ display: sidebarOpen ? 'block' : 'none' }}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoBox}>
            M
          </div>
          <div className={styles.logoTextContainer}>
            <span className={styles.logoTitle}>MediVerse</span>
            <span className={styles.logoSubtitle}>Doctor Portal</span>
          </div>
        </div>

        {/* Doctor Profile Section */}
        <div className={styles.profileCardContainer}>
          <div className={styles.profileCard}>
            {doctorProfile.image ? (
              <img src={doctorProfile.image} alt={doctorProfile.name} className={styles.profileImg} />
            ) : (
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorProfile.name.replace('Dr. ', ''))}&background=fff&color=0080FF`} alt="Doctor" className={styles.profileImg} />
            )}
            <div className={styles.profileTextContainer}>
              <span className={styles.profileName}>
                Dr. {doctorProfile.name !== '...' ? doctorProfile.name.replace('Dr. ', '') : 'Loading...'}
              </span>
              <span className={styles.profileSpecialty}>{doctorProfile.specialization}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navSection}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`${styles.navLink} ${isActive ? styles.activeNavBtn : ''}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={styles.logoutContainer}>
          <button
            onClick={logoutDoctor}
            className={styles.logoutBtn}
          >
            <FiLogOut className={styles.navIcon} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
