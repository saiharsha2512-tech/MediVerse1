import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiCalendar, FiShoppingCart, FiUser } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { BsActivity } from 'react-icons/bs';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  return (
    <nav className={styles.bottomNav}>
      <NavLink 
        to="/dashboard" 
        end
        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
      >
        <FiHome className={styles.icon} />
        <span>Home</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard/doctors" 
        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
      >
        <FaStethoscope className={styles.icon} />
        <span>Doctors</span>
      </NavLink>

      <NavLink 
        to="/dashboard/bookings" 
        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
      >
        <FiCalendar className={styles.icon} />
        <span>Bookings</span>
      </NavLink>

      <NavLink 
        to="/dashboard/medicines" 
        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
      >
        <FiShoppingCart className={styles.icon} />
        <span>Medicines</span>
      </NavLink>

      <NavLink 
        to="/dashboard/ai-check" 
        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
      >
        <BsActivity className={styles.icon} />
        <span>AI Check</span>
      </NavLink>

      <NavLink 
        to="/dashboard/profile" 
        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
      >
        <FiUser className={styles.icon} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
