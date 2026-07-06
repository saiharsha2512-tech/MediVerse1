import { useState, useEffect } from 'react';
import { FiCalendar, FiUsers, FiDollarSign, FiStar } from 'react-icons/fi';
import api from '../../services/doctor/api';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import styles from './DoctorDashboard.module.css';

import StatCard from '../../components/doctor/StatCard';
import AppointmentCard from '../../components/doctor/AppointmentCard';
import QuickActions from '../../components/doctor/QuickActions';
import WeeklyChart from '../../components/doctor/WeeklyChart';
import RevenueChart from '../../components/doctor/RevenueChart';

const DoctorDashboard = () => {
  const { doctor } = useDoctorAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy Appointments to match exactly
  const dummyAppointments = [
    { id: 1, name: 'Rahul Sharma', time: '9:00 AM', type: 'Video', status: 'pending' },
    { id: 2, name: 'Priya Patel', time: '10:30 AM', type: 'Chat', status: 'pending' },
    { id: 3, name: 'Amit Kumar', time: '2:00 PM', type: 'Video', status: 'completed' },
    { id: 4, name: 'Sneha Reddy', time: '3:30 PM', type: 'Video', status: 'pending' },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchDashboard();
  }, []);

  const doctorName = doctor?.name ? doctor.name.replace('Dr. ', '') : '...';

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.headerSection}>
          <div className={`${styles.skeleton} ${styles.skeletonHeader1}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonHeader2}`}></div>
        </div>
        <div className={styles.topStatsGrid}>
          {[1,2,3,4].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
        </div>
        <div className={styles.mainContentGrid}>
          <div className={`${styles.skeleton} ${styles.skeletonLarge}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonLarge}`}></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    todaysAppointments: 12,
    totalPatients: 248,
    monthlyRevenue: 68000,
    averageRating: 4.9
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Main Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.welcomeTitle}>Welcome back, Dr. {doctorName}</h1>
        <p className={styles.welcomeSubtitle}>Here's what's happening with your practice today</p>
      </div>

      {/* Top Statistics */}
      <div className={styles.topStatsGrid}>
        <StatCard 
          title="Appointments" 
          value={stats.todaysAppointments} 
          icon={<FiCalendar />} 
          bgClass="bgBlueLight"
          iconClass="iconBlue"
          badgeClass="badgeBlue"
          trend="Today"
        />
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients} 
          icon={<FiUsers />} 
          bgClass="bgTealLight"
          iconClass="iconTeal"
          badgeClass="badgeTeal"
          trend="+15%"
        />
        <StatCard 
          title="This Month" 
          value={`₹${stats.monthlyRevenue.toLocaleString()}`} 
          icon={<FiDollarSign />} 
          bgClass="bgGreenLight"
          iconClass="iconGreen"
          badgeClass="badgeGreen"
          trend="+22%"
        />
        <StatCard 
          title="Average Rating" 
          value={stats.averageRating} 
          icon={<FiStar style={{fill: 'currentColor'}} />} 
          bgClass="bgYellowLight"
          iconClass="iconYellow"
          badgeClass="badgeYellow"
          trend="Excellent"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainContentGrid}>
        
        {/* Today's Appointments */}
        <div className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Today's Appointments</h3>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.appointmentList}>
            {dummyAppointments.map(app => (
              <AppointmentCard 
                key={app.id}
                patientName={app.name}
                time={app.time}
                type={app.type}
                status={app.status}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Quick Actions */}
        <QuickActions />

      </div>

      {/* Bottom Section - Charts */}
      <div className={styles.chartsGrid}>
        <WeeklyChart apiData={data?.weeklyData} />
        <RevenueChart apiData={data?.revenueData} />
      </div>

    </div>
  );
};

export default DoctorDashboard;
