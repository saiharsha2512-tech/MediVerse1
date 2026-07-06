import { FiVideo, FiEdit3, FiCalendar, FiUsers, FiAlertCircle } from 'react-icons/fi';
import styles from '../../pages/doctor/DoctorDashboard.module.css';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  return (
    <div className={styles.cardSection}>
      <h3 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>Quick Actions</h3>
      
      <div className={styles.quickActionsList}>
        <button className={styles.actionBtnPrimary}>
          <FiVideo style={{ fontSize: '16px' }} />
          Start Video Call
        </button>
        
        <Link to="/doctor/prescriptions" className={styles.actionBtnSecondary}>
          <FiEdit3 style={{ fontSize: '16px', color: '#64748b' }} />
          Write Prescription
        </Link>
        
        <Link to="/doctor/appointments" className={styles.actionBtnSecondary}>
          <FiCalendar style={{ fontSize: '16px', color: '#64748b' }} />
          Manage Schedule
        </Link>
        
        <Link to="/doctor/patients" className={styles.actionBtnSecondary}>
          <FiUsers style={{ fontSize: '16px', color: '#64748b' }} />
          View Patients
        </Link>
      </div>

      <div className={styles.pendingCard}>
        <FiAlertCircle className={styles.pendingIcon} />
        <div className={styles.pendingTextContainer}>
          <p className={styles.pendingTextTitle}>Pending Actions</p>
          <p className={styles.pendingTextSub}>3 prescriptions awaiting review</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
