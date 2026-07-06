import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './OrderSuccess.module.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (location.state && location.state.orderId) {
      setOrderId(location.state.orderId);
    } else {
      // Mock order ID if accessed directly for demo
      setOrderId('ORD-' + Math.floor(100000 + Math.random() * 900000));
    }
  }, [location]);

  // Calculate estimated delivery (e.g., 2 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.successCard}>
        <div className={styles.iconContainer}>
          <FiCheckCircle className={styles.successIcon} />
        </div>
        <h2>Order Placed Successfully!</h2>
        <p className={styles.subtitle}>Thank you for ordering with MediVerse.</p>
        
        <div className={styles.orderDetails}>
          <div className={styles.detailRow}>
            <span>Order ID</span>
            <span className={styles.boldText}>{orderId}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Estimated Delivery</span>
            <span className={styles.boldText}>
              {deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <button className={styles.continueBtn} onClick={() => navigate('/dashboard/medicines')}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
