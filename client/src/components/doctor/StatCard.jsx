import styles from '../../pages/doctor/DoctorDashboard.module.css';

const StatCard = ({ title, value, icon, bgClass, iconClass, badgeClass, trend }) => {
  return (
    <div className={`${styles.statCard} ${styles[bgClass]}`}>
      <div className={styles.statHeader}>
        <div className={`${styles.iconWrapper} ${styles[iconClass]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`${styles.statBadge} ${styles[badgeClass]}`}>
            {trend}
          </div>
        )}
      </div>
      <h3 className={styles.statValue}>{value}</h3>
      <p className={styles.statLabel}>{title}</p>
    </div>
  );
};

export default StatCard;
