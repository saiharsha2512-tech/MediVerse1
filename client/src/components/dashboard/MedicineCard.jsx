import React from 'react';
import styles from './MedicineCard.module.css';
import { FiPlus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const MedicineCard = ({ medicine }) => {
  const { addToCart } = useCart();
  
  const handleAdd = () => {
    addToCart(medicine, 1);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={medicine.image || `https://placehold.co/80x80/e2e8f0/94a3b8?text=${medicine.name.charAt(0)}`} 
          alt={medicine.name} 
          className={styles.image} 
        />
      </div>
      
      <div className={styles.detailsContainer}>
        <div className={styles.topSection}>
          <div className={styles.info}>
            <h4 className={styles.name}>{medicine.name}</h4>
            <p className={styles.genericName}>{medicine.genericName}</p>
            <p className={styles.company}>{medicine.manufacturer}</p>
            {medicine.prescriptionRequired && (
              <span className={styles.prescriptionTag}>Prescription Required</span>
            )}
          </div>
          <div className={styles.badgeContainer}>
            {medicine.discount && (
              <span className={styles.discountBadge}>{medicine.discount}</span>
            )}
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <div className={styles.priceStock}>
            <div className={styles.priceRow}>
              <span className={styles.price}>₹{medicine.price.toFixed(2)}</span>
              {medicine.oldPrice && (
                <span className={styles.oldPrice}>₹{medicine.oldPrice.toFixed(2)}</span>
              )}
            </div>
            <div className={styles.stock}>In Stock</div>
          </div>
          <button className={styles.addButton} onClick={handleAdd}>
            <FiPlus /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
