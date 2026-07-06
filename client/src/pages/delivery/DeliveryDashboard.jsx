import React, { useState } from 'react';
import { useDeliveryAuth } from '../../context/delivery/DeliveryAuthContext';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiPackage, FiMapPin, FiLogOut, FiUser, FiCheck, FiClock, FiStar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import styles from './DeliveryDashboard.module.css';

const STATS = [
  { label: 'Total Deliveries', value: '0', icon: <FiPackage />, color: '#0080FF' },
  { label: 'Completed Today', value: '0', icon: <FiCheck />, color: '#00C896' },
  { label: 'Pending Orders', value: '0', icon: <FiClock />, color: '#f59e0b' },
  { label: 'Rating', value: '5.0', icon: <FiStar />, color: '#8b5cf6' },
];

const DeliveryDashboard = () => {
  const { deliveryUser, logout } = useDeliveryAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(deliveryUser?.status || 'Offline');

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/delivery/login');
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    toast.success(`Status changed to ${newStatus}`);
  };

  const statusColors = {
    Available: '#00C896',
    Busy: '#f59e0b',
    Offline: '#6b7280',
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <FiTruck className={styles.sidebarLogoIcon} />
          <span>MediVerse</span>
        </div>

        <div className={styles.partnerInfo}>
          <div className={styles.avatar}>
            {deliveryUser?.fullName?.[0]?.toUpperCase() || 'D'}
          </div>
          <p className={styles.partnerName}>{deliveryUser?.fullName || 'Delivery Partner'}</p>
          <p className={styles.partnerRole}>Delivery Partner</p>
          <span
            className={styles.statusBadge}
            style={{ background: `${statusColors[status]}22`, color: statusColors[status] }}
          >
            ● {status}
          </span>
        </div>

        <nav className={styles.nav}>
          <div className={`${styles.navItem} ${styles.navItemActive}`}>
            <FiPackage /> Dashboard
          </div>
          <div className={styles.navItem}>
            <FiMapPin /> Orders
          </div>
          <div className={styles.navItem} onClick={() => navigate('/delivery/profile')}>
            <FiUser /> Profile
          </div>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Welcome back, {deliveryUser?.fullName?.split(' ')[0] || 'Partner'}!</p>
          </div>
          <div className={styles.statusSelector}>
            <span className={styles.statusLabel}>Status:</span>
            {['Available', 'Busy', 'Offline'].map((s) => (
              <button
                key={s}
                className={`${styles.statusBtn} ${status === s ? styles.statusBtnActive : ''}`}
                style={status === s ? { background: statusColors[s], color: '#fff', borderColor: statusColors[s] } : {}}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {STATS.map((stat, idx) => (
            <div className={styles.statCard} key={idx}>
              <div className={styles.statIcon} style={{ background: `${stat.color}18`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Info */}
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Your Profile</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Employee ID</span>
              <span className={styles.infoValue}>{deliveryUser?.employeeId || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{deliveryUser?.phone || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{deliveryUser?.email || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vehicle Type</span>
              <span className={styles.infoValue}>{deliveryUser?.vehicleType || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vehicle Number</span>
              <span className={styles.infoValue}>{deliveryUser?.vehicleNumber || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>City / State</span>
              <span className={styles.infoValue}>
                {deliveryUser?.city && deliveryUser?.state
                  ? `${deliveryUser.city}, ${deliveryUser.state}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders Placeholder */}
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Recent Orders</h2>
          <div className={styles.emptyState}>
            <FiPackage className={styles.emptyIcon} />
            <p>No orders assigned yet</p>
            <span>New delivery orders will appear here</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryDashboard;
