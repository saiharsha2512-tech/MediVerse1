import React from 'react';
import styles from './Doctors.module.css';
import { FiSearch, FiFilter, FiMapPin, FiClock } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const Doctors = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>Find Your Doctor</h2>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input type="text" placeholder="Search by name, specialty..." />
          <div className={styles.filterBtn}>
            <FiFilter />
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Specialty Filters */}
        <div className={styles.filtersScroll}>
          <button className={`${styles.filterPill} ${styles.activePill}`}>All</button>
          <button className={styles.filterPill}>Cardiologist</button>
          <button className={styles.filterPill}>Dermatologist</button>
          <button className={styles.filterPill}>Pediatrician</button>
          <button className={styles.filterPill}>Orthopedic</button>
          <button className={styles.filterPill}>Neurologist</button>
        </div>

        {/* Stats Section */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ backgroundColor: '#eef2ff' }}>
            <h3>150+</h3>
            <p>Doctors</p>
          </div>
          <div className={styles.statCard} style={{ backgroundColor: '#eafff5' }}>
            <h3>4.8 <FaStar size={12} /></h3>
            <p>Avg Rating</p>
          </div>
          <div className={styles.statCard} style={{ backgroundColor: '#f0fdf4' }}>
            <h3>24/7</h3>
            <p>Available</p>
          </div>
        </div>

        {/* Available Doctors */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Available Doctors</h3>
          
          <div className={styles.doctorList}>
            {/* Doctor Card 1 */}
            <div className={styles.doctorCard}>
              <div className={styles.docImageContainer}>
                <div className={styles.docImagePlaceholder}>
                  👩‍⚕️
                </div>
                <div className={styles.verifiedBadge}>✓</div>
              </div>
              <div className={styles.docDetails}>
                <div className={styles.docHeader}>
                  <h4>Dr. Priya Sharma</h4>
                  <div className={styles.ratingBadge}>
                    <FaStar size={10} /> 4.9
                  </div>
                </div>
                <p className={styles.docSpecialty}>Cardiologist</p>
                <div className={styles.docMeta}>
                  <span>💼 15y exp</span>
                  <span><FiMapPin /> Mumbai, Maharashtra</span>
                  <span>324 reviews</span>
                </div>
                <div className={styles.docFooter}>
                  <div className={styles.docTime}>
                    <FiClock style={{ color: '#10b981' }} /> <span style={{ color: '#10b981' }}>Today, 2:30 PM</span>
                  </div>
                  <div className={styles.docAction}>
                    <span className={styles.fee}>₹500</span>
                    <button className={styles.bookBtn}>Book Now</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Card 2 */}
            <div className={styles.doctorCard}>
              <div className={styles.docImageContainer}>
                <div className={styles.docImagePlaceholder} style={{ backgroundColor: '#f0fdf4' }}>
                  👨‍⚕️
                </div>
                <div className={styles.verifiedBadge}>✓</div>
              </div>
              <div className={styles.docDetails}>
                <div className={styles.docHeader}>
                  <h4>Dr. Anil Kumar</h4>
                  <div className={styles.ratingBadge}>
                    <FaStar size={10} /> 4.8
                  </div>
                </div>
                <p className={styles.docSpecialty}>Neurologist</p>
                <div className={styles.docMeta}>
                  <span>💼 10y exp</span>
                  <span><FiMapPin /> Delhi, NCR</span>
                  <span>215 reviews</span>
                </div>
                <div className={styles.docFooter}>
                  <div className={styles.docTime}>
                    <FiClock style={{ color: '#10b981' }} /> <span style={{ color: '#10b981' }}>Today, 4:00 PM</span>
                  </div>
                  <div className={styles.docAction}>
                    <span className={styles.fee}>₹800</span>
                    <button className={styles.bookBtn}>Book Now</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Doctors;
