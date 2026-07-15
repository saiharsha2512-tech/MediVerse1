import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiPackage, FiDollarSign, FiMap, FiStar,
  FiLogOut, FiRefreshCw, FiSearch, FiBell
} from 'react-icons/fi';
import styles from './DeliveryDashboard.module.css';

const DeliveryDashboard = () => {
  const [partner, setPartner] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  const [activeTab, setActiveTab] = useState('Available');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('deliveryToken');

  useEffect(() => {
    if (!token) {
      navigate('/delivery/login');
      return;
    }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/delivery/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPartner(res.data.partner);
        setTodayStats(res.data.todayStats);
        setWeeklySummary(res.data.weeklySummary);
        setAvailableOrders(res.data.availableOrders);
        setActiveOrders(res.data.activeOrders);
        setCompletedOrders(res.data.completedOrders);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!partner) return;
    const newStatus = partner.status === 'Online' ? 'Offline' : 'Online';
    try {
      const res = await axios.put('http://localhost:5000/api/delivery/status', { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPartner({ ...partner, status: newStatus });
        toast.success(`You are now ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deliveryToken');
    navigate('/delivery/login');
  };

  const acceptOrder = async (id) => {
    setActionLoading(id);
    try {
      const res = await axios.put(`http://localhost:5000/api/delivery/orders/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Order Accepted!');
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const updateOrderStatus = async (id, action) => {
    setActionLoading(id);
    try {
      const res = await axios.put(`http://localhost:5000/api/delivery/orders/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Order ${action === 'pickup' ? 'Picked Up' : 'Delivered'}!`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !partner) {
    return (
      <div className={styles.dashboardContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.spinner} style={{ width: '40px', height: '40px', borderColor: '#ff6b00', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const getFilteredOrders = (ordersList) => {
    return ordersList.filter(order => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        order._id?.toLowerCase().includes(searchLower) ||
        order.deliveryInfo?.fullName?.toLowerCase().includes(searchLower) ||
        order.deliveryInfo?.city?.toLowerCase().includes(searchLower)
      );
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Delivery Partner</h1>
          <p>Good morning, {partner?.name?.split(' ')[0]}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statusToggle} onClick={handleStatusToggle}>
            <div className={`${styles.statusDot} ${styles[partner?.status?.toLowerCase()] || styles.offline}`}></div>
            <span>{partner?.status}</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={fetchDashboardData} title="Refresh">
              <FiRefreshCw />
            </button>
            <button className={styles.iconBtn} title="Notifications">
              <FiBell />
            </button>
            <button className={styles.iconBtn} onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FiPackage className={styles.statIcon} style={{ color: '#ff6b00' }} />
            <h2 className={styles.statValue}>{todayStats?.deliveries || 0}</h2>
            <p className={styles.statLabel}>Deliveries</p>
          </div>
          <div className={styles.statCard}>
            <FiDollarSign className={styles.statIcon} style={{ color: '#10b981' }} />
            <h2 className={styles.statValue}>₹{todayStats?.earnings || 0}</h2>
            <p className={styles.statLabel}>Earned</p>
          </div>
          <div className={styles.statCard}>
            <FiMap className={styles.statIcon} style={{ color: '#3b82f6' }} />
            <h2 className={styles.statValue}>{todayStats?.distance || 0}</h2>
            <p className={styles.statLabel}>km Today</p>
          </div>
          <div className={styles.statCard}>
            <FiStar className={styles.statIcon} style={{ color: '#fbbf24' }} />
            <h2 className={styles.statValue}>{todayStats?.rating || 0}</h2>
            <p className={styles.statLabel}>Rating</p>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            {['Available', 'Active', 'Completed', 'Weekly', 'Profile'].map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Available' && availableOrders.length > 0 && ` (${availableOrders.length})`}
                {tab === 'Active' && activeOrders.length > 0 && ` (${activeOrders.length})`}
              </button>
            ))}
          </div>

          {(activeTab === 'Available' || activeTab === 'Active' || activeTab === 'Completed') && (
            <div className={styles.searchBar}>
              <FiSearch color="#9ca3af" />
              <input
                type="text"
                placeholder="Search orders, names, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {activeTab === 'Available' && (
          <div className={styles.ordersList}>
            {getFilteredOrders(availableOrders).length === 0 ? (
              <div className={styles.emptyState}>No available orders at the moment.</div>
            ) : (
              getFilteredOrders(availableOrders).map(order => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderNumberGroup}>
                      <span className={styles.orderId}>ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                      <span className={styles.itemBadge}>{order.items?.length || 1} items</span>
                    </div>
                    <div className={styles.orderPriceInfo}>
                      <h3 className={styles.orderPrice}>₹{order.earning || 45}</h3>
                      <p className={styles.orderDistance}>{order.distance || 2.5} km</p>
                    </div>
                  </div>
                  <h4 className={styles.patientName}>{order.deliveryInfo?.fullName}</h4>
                  <div className={styles.locations}>
                    <div className={`${styles.locationItem} ${styles.pickup}`}>
                      <p className={styles.locationLabel}>Pickup</p>
                      <p className={styles.locationAddress}>MediPharm Pharmacy, {order.deliveryInfo?.city}</p>
                    </div>
                    <div className={`${styles.locationItem} ${styles.dropoff}`}>
                      <p className={styles.locationLabel}>Delivery</p>
                      <p className={styles.locationAddress}>{order.deliveryInfo?.address}</p>
                    </div>
                  </div>
                  <button
                    className={styles.actionButton}
                    onClick={() => acceptOrder(order._id)}
                    disabled={actionLoading === order._id}
                  >
                    {actionLoading === order._id ? <div className={styles.spinner} /> : 'Accept Order'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Active' && (
          <div className={styles.ordersList}>
            {getFilteredOrders(activeOrders).length === 0 ? (
              <div className={styles.emptyState}>No active deliveries.</div>
            ) : (
              getFilteredOrders(activeOrders).map(order => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderNumberGroup}>
                      <span className={styles.orderId}>ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                      <span className={styles.itemBadge} style={{ background: '#e0e7ff', color: '#4f46e5' }}>{order.deliveryStatus}</span>
                    </div>
                  </div>
                  <h4 className={styles.patientName}>{order.deliveryInfo?.fullName}</h4>
                  <div className={styles.locations}>
                    <div className={`${styles.locationItem} ${styles.dropoff}`}>
                      <p className={styles.locationLabel}>Deliver To</p>
                      <p className={styles.locationAddress}>{order.deliveryInfo?.address}, {order.deliveryInfo?.city}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {order.deliveryStatus === 'Accepted' && (
                      <button
                        className={styles.actionButton}
                        onClick={() => updateOrderStatus(order._id, 'pickup')}
                        disabled={actionLoading === order._id}
                      >
                         {actionLoading === order._id ? <div className={styles.spinner} /> : 'Mark as Picked Up'}
                      </button>
                    )}
                    {order.deliveryStatus === 'Picked Up' && (
                      <button
                        className={styles.actionButton}
                        style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                        onClick={() => updateOrderStatus(order._id, 'deliver')}
                        disabled={actionLoading === order._id}
                      >
                        {actionLoading === order._id ? <div className={styles.spinner} /> : 'Mark as Delivered'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Completed' && (
          <div className={styles.ordersList}>
            {getFilteredOrders(completedOrders).length === 0 ? (
              <div className={styles.emptyState}>No completed deliveries yet.</div>
            ) : (
              getFilteredOrders(completedOrders).map(order => (
                <div key={order._id} className={styles.orderCard} style={{ opacity: 0.8 }}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderNumberGroup}>
                      <span className={styles.orderId}>ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                      <span className={styles.itemBadge} style={{ background: '#d1fae5', color: '#059669' }}>Delivered</span>
                    </div>
                    <div className={styles.orderPriceInfo}>
                      <h3 className={styles.orderPrice}>₹{order.earning || 45}</h3>
                    </div>
                  </div>
                  <h4 className={styles.patientName}>{order.deliveryInfo?.fullName}</h4>
                  <p className={styles.locationAddress} style={{ margin: '1rem 0 0 0' }}>{order.deliveryInfo?.address}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Weekly' && (
          <div>
            <h2 className={styles.sectionTitle}>This Week's Summary</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard} style={{ background: '#eff6ff' }}>
                <h2 className={styles.statValue} style={{ color: '#1e3a8a' }}>{weeklySummary?.deliveries || 0}</h2>
                <p className={styles.statLabel}>Deliveries</p>
              </div>
              <div className={styles.statCard} style={{ background: '#ecfdf5' }}>
                <h2 className={styles.statValue} style={{ color: '#064e3b' }}>₹{weeklySummary?.earnings || 0}</h2>
                <p className={styles.statLabel}>Earned</p>
              </div>
              <div className={styles.statCard} style={{ background: '#f5f3ff' }}>
                <h2 className={styles.statValue} style={{ color: '#4c1d95' }}>{weeklySummary?.rating || 0}★</h2>
                <p className={styles.statLabel}>Rating</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className={styles.accountSection}>
            <div className={styles.accountHeader}>
              <div className={styles.profileImage}>
                {partner?.name?.charAt(0)}
              </div>
              <div className={styles.accountInfo}>
                <h3>{partner?.name}</h3>
                <p>Delivery Partner</p>
              </div>
            </div>
            <div className={styles.accountStats}>
              <div>
                <span className={styles.accStatLabel}>Total Deliveries</span>
                <span className={styles.accStatValue}>{partner?.totalDeliveries || 0}</span>
              </div>
              <div>
                <span className={styles.accStatLabel}>Member Since</span>
                <span className={styles.accStatValue}>{new Date(partner?.memberSince).toLocaleDateString()}</span>
              </div>
              <div>
                <span className={styles.accStatLabel}>Vehicle</span>
                <span className={styles.accStatValue}>{partner?.vehicleType || 'Bike'}</span>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryDashboard;
