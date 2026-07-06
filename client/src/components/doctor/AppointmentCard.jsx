import { FiVideo, FiMessageCircle, FiCheck, FiClock } from 'react-icons/fi';
import styles from '../../pages/doctor/DoctorDashboard.module.css';

const AppointmentCard = ({ patientName, patientImage, time, type, status }) => {
  return (
    <div className={styles.appointmentCard}>
      <div className={styles.patientInfo}>
        <img 
          src={patientImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=f1f5f9&color=475569`} 
          alt={patientName} 
          className={styles.patientPhoto} 
        />
        <div className={styles.patientDetails}>
          <h4 className={styles.patientName}>{patientName}</h4>
          <div className={styles.appointmentMeta}>
            <span className={styles.appointmentTime}><FiClock /> {time}</span>
            <span className={styles.appointmentType}>
              {type === 'Video' ? <FiVideo /> : <FiMessageCircle />}
              {type}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.actionArea}>
        {status === 'pending' ? (
          <button className={styles.startBtn}>
            Start
          </button>
        ) : (
          <div className={styles.doneBadge}>
            <FiCheck />
            Done
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
