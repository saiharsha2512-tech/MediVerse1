import React, { useState } from 'react';
import styles from './Bookings.module.css';
import { FiClock, FiVideo, FiMessageCircle, FiInfo } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');

  const appointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: 'Today',
      time: '2:30 PM',
      type: 'Video',
      status: 'upcoming'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      date: 'Feb 11, 2026',
      time: '10:00 AM',
      type: 'Chat',
      status: 'upcoming'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>My Appointments</h2>
        <p className={styles.headerSubtitle}>Manage your consultations</p>
      </header>

      <div className={styles.content}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <h3>2</h3>
            <p>Upcoming</p>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <h3>1</h3>
            <p>Completed</p>
          </div>
          <div className={`${styles.statCard} ${styles.statPink}`}>
            <h3>1</h3>
            <p>Cancelled</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'Upcoming' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('Upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'Completed' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('Completed')}
          >
            Completed
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'Cancelled' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('Cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* Appointments List */}
        <div className={styles.appointmentList}>
          {appointments.map(apt => (
            <div key={apt.id} className={styles.appointmentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.docInfo}>
                  <div className={styles.docAvatar}>
                    👩‍⚕️
                  </div>
                  <div>
                    <h4 className={styles.docName}>{apt.doctorName}</h4>
                    <p className={styles.docSpecialty}>{apt.specialty}</p>
                    <div className={styles.apptMeta}>
                      <span><FaRegCalendarAlt style={{color: '#0d61e2'}} /> {apt.date}</span>
                      <span><FiClock style={{color: '#10b981'}} /> {apt.time}</span>
                      <span>
                        {apt.type === 'Video' ? <FiVideo style={{color: '#a855f7'}} /> : <FiMessageCircle style={{color: '#a855f7'}} />} {apt.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.statusBadge}>
                  <FiInfo size={12} /> {apt.status}
                </div>
              </div>
              
              <div className={styles.cardActions}>
                <button className={styles.joinBtn}>Join Now</button>
                <button className={styles.rescheduleBtn}>Reschedule</button>
                <button className={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
