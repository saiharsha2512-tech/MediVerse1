import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import styles from './Appointments.module.css'; // Reusing styles where applicable
import { FiArrowLeft, FiClock, FiVideo, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctorToken } = useDoctorAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/doctor/appointments/${id}`, {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        if (res.data.success) {
          setAppointment(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load appointment details');
        navigate('/doctor/appointments');
      } finally {
        setLoading(false);
      }
    };
    if (doctorToken) fetchDetail();
  }, [id, doctorToken, navigate]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!appointment) return <div className={styles.container}>Not found.</div>;

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/doctor/appointments')} className={styles.cancelBtn} style={{marginBottom: 20}}>
        <FiArrowLeft /> Back to Appointments
      </button>

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <h2 style={{marginTop: 0, marginBottom: '24px'}}>{appointment.patientName} - Appointment Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles['badge' + appointment.status]}`}>{appointment.status}</span></p>
            <p><strong><FiClock /> Date & Time:</strong> {appointment.date} at {appointment.time}</p>
            <p><strong><FiVideo /> Type:</strong> {appointment.consultationType}</p>
          </div>
          
          <div>
            <p><strong>Problem:</strong> {appointment.problem}</p>
            <p><strong><FiFileText /> Notes:</strong> {appointment.notes || 'No notes provided.'}</p>
            <p><strong>Created:</strong> {new Date(appointment.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button 
            className={styles.startCallBtn} 
            disabled={appointment.status === 'Completed' || appointment.status === 'Cancelled'}
            onClick={() => navigate(`/doctor/video-call/${appointment._id}`)}
          >
            <FiVideo /> Start Video Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
