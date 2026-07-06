import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart, cartTotal, loading } = useCart();
  const navigate = useNavigate();

  const deliveryCharges = cart.length > 0 ? 5.00 : 0;
  // Calculate discount based on original prices vs actual prices, but right now we just use cartTotal directly.
  // For simplicity, let's assume a fixed discount or calculate from DB if we had original price.
  // We'll just show 0 for now as it's not strictly specified how to aggregate item discounts.
  const discountAmount = 0; 
  const grandTotal = cartTotal + deliveryCharges - discountAmount;

  if (loading) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Loading cart...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h2>Your Cart</h2>
      </div>

      {cart.length === 0 ? (
        <div className={styles.emptyCart}>
          <img src="https://placehold.co/150x150/f1f5f9/94a3b8?text=Empty+Cart" alt="Empty Cart" />
          <h3>Cart is empty</h3>
          <p>Add items to your cart to see them here.</p>
          <button className={styles.continueBtn} onClick={() => navigate('/dashboard/medicines')}>
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <span>{cart.length} Items in Cart</span>
              <button className={styles.clearBtn} onClick={clearCart}>Clear All</button>
            </div>
            
            {cart.map(item => {
              const med = item.medicineId;
              if(!med) return null;
              return (
                <div key={med._id} className={styles.cartItem}>
                  <div className={styles.itemImageContainer}>
                    <img 
                      src={med.image || `https://placehold.co/60x60/f1f5f9/94a3b8?text=${med.name.charAt(0)}`} 
                      alt={med.name} 
                      className={styles.itemImage} 
                    />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitleRow}>
                      <h4>{med.name}</h4>
                      <button className={styles.deleteBtn} onClick={() => removeItem(med._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                    <p className={styles.itemCompany}>{med.manufacturer}</p>
                    
                    <div className={styles.itemBottomRow}>
                      <span className={styles.itemPrice}>${med.price.toFixed(2)}</span>
                      
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.qtyBtn} 
                          onClick={() => updateQuantity(med._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus />
                        </button>
                        <span className={styles.qty}>{item.quantity}</span>
                        <button 
                          className={styles.qtyBtn} 
                          onClick={() => updateQuantity(med._id, item.quantity + 1)}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.orderSummary}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal ({cart.length} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Charges</span>
              <span>${deliveryCharges.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.divider}></div>
            <div className={styles.summaryRowTotal}>
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            
            <button className={styles.checkoutBtn} onClick={() => navigate('/dashboard/checkout')}>
              Proceed To Checkout
            </button>
            <button className={styles.continueShoppingBtn} onClick={() => navigate('/dashboard/medicines')}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
