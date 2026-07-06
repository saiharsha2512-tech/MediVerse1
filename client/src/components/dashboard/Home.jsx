import React from 'react';
import styles from './Home.module.css';
import { FiBell, FiSearch, FiVideo, FiActivity, FiHeart, FiDroplet } from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdOutlineScience } from 'react-icons/md';
import { FaRobot, FaRunning } from 'react-icons/fa';
import { LuSalad } from 'react-icons/lu';
import { BsShieldCheck } from 'react-icons/bs';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.topRow}>
          <div className={styles.userInfo}>
            <div className={styles.logoCircle}>M</div>
            <div>
              <h1 className={styles.appName}>MediVerse</h1>
              <p className={styles.subtitle}>AI Powered Healthcare</p>
            </div>
          </div>
          <button className={styles.iconBtn}>
            <FiBell />
            <span className={styles.notificationDot}></span>
          </button>
        </div>
        
        <div className={styles.welcomeText}>
          <p>Welcome back,</p>
          <h2>Harsha</h2>
        </div>

        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input type="text" placeholder="Search doctors, medicines, tests..." />
          <button className={styles.videoSearchBtn}>
            <FiVideo />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Quick Actions */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.quickActionsGrid}>
            <div className={styles.actionCard} style={{ backgroundColor: '#eef2ff' }}>
              <div className={styles.actionIconContainer} style={{ backgroundColor: '#0d61e2', color: 'white' }}>
                <FiVideo />
              </div>
              <h4>Consult Doctor</h4>
              <p>Video/Chat</p>
            </div>
            
            <div className={styles.actionCard} style={{ backgroundColor: '#eafff5' }}>
              <div className={styles.actionIconContainer} style={{ backgroundColor: '#18b584', color: 'white' }}>
                <MdOutlineLocalPharmacy />
              </div>
              <h4>Order Medicine</h4>
              <p>Fast Delivery</p>
            </div>
            
            <div className={styles.actionCard} style={{ backgroundColor: '#f0fdf4' }}>
              <div className={styles.actionIconContainer} style={{ backgroundColor: '#22c55e', color: 'white' }}>
                <MdOutlineScience />
              </div>
              <h4>Book Lab Test</h4>
              <p>At Home</p>
            </div>
            
            <div className={styles.actionCard} style={{ backgroundColor: '#faf5ff' }}>
              <div className={styles.actionIconContainer} style={{ backgroundColor: '#a855f7', color: 'white' }}>
                <FaRobot />
              </div>
              <h4>AI Health Check</h4>
              <p>Instant</p>
            </div>
          </div>
        </section>

        {/* Upcoming Appointment */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Upcoming Appointment</h3>
            <span className={styles.viewAll}>View All &gt;</span>
          </div>
          <div className={styles.appointmentCard}>
            <div className={styles.appointmentLeft}>
              <div className={styles.docAvatar}>
                <FiVideo />
              </div>
              <div className={styles.docInfo}>
                <h4>Dr. Priya Sharma</h4>
                <p>Cardiologist</p>
                <div className={styles.apptTime}>
                  <span>📅 Today</span>
                  <span>🕒 2:30 PM</span>
                  <span>⭐ 4.9</span>
                </div>
              </div>
            </div>
            <button className={styles.joinBtn}>Join Now</button>
          </div>
        </section>

        {/* Health Tips */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Health Tips</h3>
          <div className={styles.tipsScroll}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} style={{ color: '#3b82f6' }}>
                <FiDroplet size={24} />
              </div>
              <div className={styles.tipText}>
                <h4>Stay Hydrated</h4>
                <p>Drink at least 8 glasses of water daily</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} style={{ color: '#f59e0b' }}>
                <FaRunning size={24} />
              </div>
              <div className={styles.tipText}>
                <h4>Regular Exercise</h4>
                <p>30 minutes of activity keeps you healthy</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} style={{ color: '#10b981' }}>
                <LuSalad size={24} />
              </div>
              <div className={styles.tipText}>
                <h4>Balanced Diet</h4>
                <p>Include fruits and vegetables in every meal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Health */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Health</h3>
          <div className={styles.healthGrid}>
            <div className={`${styles.healthCard} ${styles.borderRed}`}>
              <div className={styles.healthHeader}>
                <span className={styles.healthLabel}>Heart Rate</span>
                <FiHeart style={{ color: '#ef4444' }} />
              </div>
              <div className={styles.healthValue}>
                72 <span>bpm</span>
              </div>
              <div className={styles.healthStatus} style={{ color: '#10b981' }}>~ Normal</div>
            </div>

            <div className={`${styles.healthCard} ${styles.borderBlue}`}>
              <div className={styles.healthHeader}>
                <span className={styles.healthLabel}>Blood Pressure</span>
                <FiActivity style={{ color: '#3b82f6' }} />
              </div>
              <div className={styles.healthValue}>
                120<span>/80</span>
              </div>
              <div className={styles.healthStatus} style={{ color: '#10b981' }}>~ Optimal</div>
            </div>

            <div className={`${styles.healthCard} ${styles.borderPurple}`}>
              <div className={styles.healthHeader}>
                <span className={styles.healthLabel}>Steps Today</span>
                <FiActivity style={{ color: '#a855f7' }} />
              </div>
              <div className={styles.healthValue}>
                8,432
              </div>
              <div className={styles.healthStatus} style={{ color: '#10b981' }}>~ 84% of goal</div>
            </div>

            <div className={`${styles.healthCard} ${styles.borderTeal}`}>
              <div className={styles.healthHeader}>
                <span className={styles.healthLabel}>Insurance</span>
                <BsShieldCheck style={{ color: '#14b8a6', fontSize: '20px' }} />
              </div>
              <div className={styles.healthValue} style={{ fontSize: '16px', margin: '8px 0' }}>
                Active Plan
              </div>
              <span className={styles.insuranceBadge}>Premium</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
