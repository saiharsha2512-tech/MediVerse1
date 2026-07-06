import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Medicines.module.css';
import { FiShoppingCart, FiSearch, FiUploadCloud } from 'react-icons/fi';
import MedicineCard from './MedicineCard';
import { useCart } from '../../context/CartContext';

const categories = [
  'All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Heart Care', 'Diabetes',
  'Cold & Flu', 'Digestive Care', 'Skin Care', "Children's Care"
];

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { cartItemCount } = useCart();

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/medicines';
      if (activeCategory !== 'All') {
        url = `http://localhost:5000/api/medicines/category/${encodeURIComponent(activeCategory)}`;
      }
      
      const res = await axios.get(url);
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines", error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      fetchMedicines();
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/medicines/search?q=${query}`);
      setMedicines(res.data);
      setActiveCategory('All');
    } catch (error) {
      console.error("Error searching medicines", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.topRow}>
          <div className={styles.titleInfo}>
            <h2>Order Medicines</h2>
            <p className={styles.subtitle}>Fast & reliable delivery</p>
          </div>
          <button className={styles.cartIconBtn} onClick={() => navigate('/dashboard/cart')}>
            <FiShoppingCart />
            {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
          </button>
        </div>

        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search medicines..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className={styles.uploadCard}>
          <div className={styles.uploadIconContainer}>
            <FiUploadCloud />
          </div>
          <div className={styles.uploadText}>
            <h4 className={styles.uploadTitle}>Upload Prescription</h4>
            <p className={styles.uploadSubtitle}>Get medicines delivered quickly</p>
          </div>
          <button className={styles.uploadBtn}>Upload</button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.filtersContainer}>
          {categories.map(category => (
            <button 
              key={category}
              className={`${styles.filterChip} ${activeCategory === category ? styles.filterChipActive : ''}`}
              onClick={() => {
                setActiveCategory(category);
                setSearchQuery('');
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Available Medicines</h3>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading...</div>
        ) : medicines.length > 0 ? (
          <div className={styles.medicinesGrid}>
            {medicines.map(medicine => (
              <MedicineCard key={medicine._id || medicine.id} medicine={medicine} />
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No medicines found.</div>
        )}
      </div>
    </div>
  );
};

export default Medicines;
