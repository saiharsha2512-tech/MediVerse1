import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import styles from './Checkout.module.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryCharges = cart.length > 0 ? 5.00 : 0;
  const discountAmount = 0;
  const grandTotal = cartTotal + deliveryCharges - discountAmount;

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if(cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      setIsSubmitting(true);
      // Construct Order Items
      const items = cart.map(item => ({
        medicineId: item.medicineId._id,
        quantity: item.quantity,
        price: item.medicineId.price
      }));

      const res = await axios.post('http://localhost:5000/api/orders/create', {
        userId: "mock-user-123", // In real app, get from auth context
        items,
        deliveryInfo: formData,
        paymentMethod,
        subTotal: cartTotal,
        deliveryCharges,
        discountAmount,
        totalAmount: grandTotal
      });

      if(res.status === 201) {
        toast.success('Order placed successfully!');
        await clearCart();
        navigate('/dashboard/order-success', { state: { orderId: res.data._id }});
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h2>Checkout</h2>
      </div>

      <div className={styles.content}>
        <form onSubmit={handlePlaceOrder} className={styles.checkoutForm}>
          
          <div className={styles.section}>
            <h3>Delivery Information</h3>
            <div className={styles.inputGroup}>
              <input type="text" name="fullName" placeholder="Full Name" required value={formData.fullName} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <input type="tel" name="mobileNumber" placeholder="Mobile Number" required value={formData.mobileNumber} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <textarea name="address" placeholder="Full Address" required value={formData.address} onChange={handleChange} rows="3"></textarea>
            </div>
            <div className={styles.rowInputs}>
              <div className={styles.inputGroup}>
                <input type="text" name="city" placeholder="City" required value={formData.city} onChange={handleChange} />
              </div>
              <div className={styles.inputGroup}>
                <input type="text" name="state" placeholder="State" required value={formData.state} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <input type="text" name="pincode" placeholder="Pincode" required value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.section}>
            <h3>Payment Method</h3>
            <div className={styles.paymentOptions}>
              {['Cash On Delivery', 'UPI', 'Credit Card', 'Debit Card'].map(method => (
                <label key={method} className={`${styles.paymentOption} ${paymentMethod === method ? styles.activePayment : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.orderSummary}>
            <h3>Order Summary ({cart.length} items)</h3>
            <div className={styles.itemsList}>
              {cart.map(item => (
                <div key={item._id} className={styles.summaryItem}>
                  <span>{item.quantity}x {item.medicineId?.name}</span>
                  <span>${(item.medicineId?.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className={styles.divider}></div>
            <div className={styles.totalRow}>
              <span>Total Amount</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" className={styles.placeOrderBtn} disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
