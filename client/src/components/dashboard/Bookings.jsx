import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import styles from './Bookings.module.css';
import { FiClock, FiVideo, FiMessageCircle, FiInfo } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock patient userId
  const userId = "64c8c7d3f8e5c8a1e4a3b8d1";

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000); // 30-second polling
    
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/appointments/${userId}`);
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.error('Meeting link not available yet.');
    }
  };

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === 'cancel' 
        ? `http://localhost:5000/api/appointments/cancel/${id}`
        : `http://localhost:5000/api/appointments/reschedule/${id}`; // Simplified reschedule for demo
      
      const payload = action === 'reschedule' 
        ? { appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: '04:00 PM' } 
        : {};

      await axios.put(endpoint, payload);
      toast.success(`Appointment ${action}led successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error(`Failed to ${action} appointment`);
    }
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => {
      const isUpcoming = ['pending', 'upcoming', 'confirmed'].includes(apt.status);
      if (activeTab === 'Upcoming') return isUpcoming;
      if (activeTab === 'Completed') return apt.status === 'completed';
      if (activeTab === 'Cancelled') return apt.status === 'cancelled' || apt.status === 'rejected';
      return true;
    });
  };

  const filteredAppointments = getFilteredAppointments();
  const upcomingCount = appointments.filter(a => ['pending', 'upcoming', 'confirmed'].includes(a.status)).length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length;

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
            <h3>{upcomingCount}</h3>
            <p>Upcoming</p>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
          <div className={`${styles.statCard} ${styles.statPink}`}>
            <h3>{cancelledCount}</h3>
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
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading appointments...</p>
          ) : filteredAppointments.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>No {activeTab.toLowerCase()} appointments.</p>
          ) : (
            filteredAppointments.map(apt => (
              <div key={apt._id} className={styles.appointmentCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.docInfo}>
                    <div className={styles.docAvatar} style={{ backgroundImage: 'url(https://cdn-icons-png.flaticon.com/512/3774/3774299.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#eef2ff' }}>
                    </div>
                    <div>
                      <h4 className={styles.docName}>{apt.doctorName}</h4>
                      <p className={styles.docSpecialty}>{apt.specialty}</p>
                      <div className={styles.apptMeta}>
                        <span><FaRegCalendarAlt style={{color: '#0d61e2'}} /> {apt.appointmentDate}</span>
                        <span><FiClock style={{color: '#10b981'}} /> {apt.appointmentTime}</span>
                        <span>
                          {apt.mode === 'Video' ? <FiVideo style={{color: '#a855f7'}} /> : <FiMessageCircle style={{color: '#a855f7'}} />} {apt.mode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statusBadge} style={{ textTransform: 'capitalize' }}>
                    <FiInfo size={12} /> {apt.status}
                  </div>
                </div>
                
                {['pending', 'upcoming', 'confirmed'].includes(apt.status) && (
                  <div className={styles.cardActions}>
                    <button 
                      className={styles.joinBtn} 
                      onClick={() => handleJoinMeeting(apt.meetingLink)}
                      style={{ opacity: (apt.status === 'confirmed' && apt.meetingLink) ? 1 : 0.6, cursor: (apt.status === 'confirmed' && apt.meetingLink) ? 'pointer' : 'not-allowed' }}
                    >
                      {(apt.status === 'confirmed' && apt.meetingLink) ? 'Join Now' : 'Waiting for Doctor'}
                    </button>
                    <button className={styles.rescheduleBtn} onClick={() => handleAction(apt._id, 'reschedule')}>Reschedule</button>
                    <button className={styles.cancelBtn} onClick={() => handleAction(apt._id, 'cancel')}>Cancel</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
