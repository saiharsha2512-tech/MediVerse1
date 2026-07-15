import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import styles from './Doctors.module.css';
import { FiSearch, FiFilter, FiMapPin, FiClock } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Use a mocked patient user ID for booking as per Patient Portal standard
  const userId = "64c8c7d3f8e5c8a1e4a3b8d1"; // Example MongoDB ObjectId format or pull from context

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/doctors');
      // Only show active/approved doctors
      const activeDoctors = res.data.filter(doc => doc.isApproved !== false);
      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = doctors;
    if (searchQuery) {
      result = result.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilter !== 'All') {
      result = result.filter(doc => doc.specialty.toLowerCase().includes(activeFilter.toLowerCase()));
    }
    setFilteredDoctors(result);
  }, [searchQuery, activeFilter, doctors]);

  const handleBookNow = async (doctor) => {
    try {
      // First check if user already has an active appointment with this doctor
      const existingRes = await axios.get(`http://localhost:5000/api/appointments/${userId}`);
      const activeAppointments = existingRes.data.filter(apt => 
        apt.doctorId === doctor._id && 
        (apt.status === 'pending' || apt.status === 'upcoming' || apt.status === 'confirmed')
      );

      if (activeAppointments.length > 0) {
        toast.error('Appointment already exists.');
        return;
      }

      const now = new Date();
      // Example default booking logic: Booking for tomorrow at 10 AM
      const appointmentDate = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];
      const appointmentTime = "10:00 AM";

      const payload = {
        userId,
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        appointmentDate,
        appointmentTime,
        mode: 'Video'
      };

      const res = await axios.post('http://localhost:5000/api/appointments/book', payload);
      if (res.data) {
        toast.success(`Appointment booked with ${doctor.name}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const filters = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist'];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>Find Your Doctor</h2>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, specialty, location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.filterBtn}>
            <FiFilter />
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Specialty Filters */}
        <div className={styles.filtersScroll}>
          {filters.map(filter => (
            <button 
              key={filter} 
              className={`${styles.filterPill} ${activeFilter === filter ? styles.activePill : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Stats Section */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ backgroundColor: '#eef2ff' }}>
            <h3>{doctors.length}+</h3>
            <p>Doctors</p>
          </div>
          <div className={styles.statCard} style={{ backgroundColor: '#eafff5' }}>
            <h3>4.8 <FaStar size={12} /></h3>
            <p>Avg Rating</p>
          </div>
          <div className={styles.statCard} style={{ backgroundColor: '#f0fdf4' }}>
            <h3>24/7</h3>
            <p>Available</p>
          </div>
        </div>

        {/* Available Doctors */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Available Doctors</h3>
          
          <div className={styles.doctorList}>
            {loading ? (
              <p>Loading doctors...</p>
            ) : filteredDoctors.length === 0 ? (
              <p>No doctors found matching your criteria.</p>
            ) : (
              filteredDoctors.map(doctor => (
                <div key={doctor._id} className={styles.doctorCard}>
                  <div className={styles.docImageContainer}>
                    <div className={styles.docImagePlaceholder} style={{ backgroundColor: doctor.image ? 'transparent' : '#f0fdf4' }}>
                      {doctor.image ? <img src={doctor.image} alt={doctor.name} style={{width:'100%', height:'100%', borderRadius:'12px', objectFit:'cover'}} /> : '👨‍⚕️'}
                    </div>
                    <div className={styles.verifiedBadge}>✓</div>
                  </div>
                  <div className={styles.docDetails}>
                    <div className={styles.docHeader}>
                      <h4>{doctor.name}</h4>
                      <div className={styles.ratingBadge}>
                        <FaStar size={10} /> {doctor.rating || 4.5}
                      </div>
                    </div>
                    <p className={styles.docSpecialty}>{doctor.specialty}</p>
                    <div className={styles.docMeta}>
                      <span>💼 {doctor.experience} exp</span>
                      <span><FiMapPin /> {doctor.location || `${doctor.city}, ${doctor.state}`}</span>
                      <span>{Math.floor(Math.random() * 500) + 50} reviews</span>
                    </div>
                    <div className={styles.docFooter}>
                      <div className={styles.docTime}>
                        <FiClock style={{ color: '#10b981' }} /> <span style={{ color: '#10b981' }}>{doctor.availableDays?.[0] || 'Today'}, {doctor.availableTime?.start || '2:30 PM'}</span>
                      </div>
                      <div className={styles.docAction}>
                        <span className={styles.fee}>₹{doctor.fee}</span>
                        <button className={styles.bookBtn} onClick={() => handleBookNow(doctor)}>Book Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Doctors;
