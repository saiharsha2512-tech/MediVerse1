import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import styles from './Appointments.module.css';
import { 
  FiSearch, FiCalendar, FiClock, FiVideo, FiMessageCircle, 
  FiMoreVertical, FiX, FiSend, FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

// Add default image for fallback
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Patient&background=0080FF&color=fff";

const Appointments = () => {
  const { doctorToken, doctor } = useDoctorAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest');

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  
  // Chat state
  const [chatAppointment, setChatAppointment] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Dropdown state
  const [activeMenu, setActiveMenu] = useState(null);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('/api/doctor/appointments', {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    if (doctorToken) fetchAppointments();
  }, [doctorToken]);

  // Derived state (filtering and sorting)
  const filteredAppointments = useMemo(() => {
    let result = appointments;
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.patientName?.toLowerCase().includes(q) || 
        a.problem?.toLowerCase().includes(q) ||
        a.time?.toLowerCase().includes(q) ||
        a.consultationType?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter !== 'All') {
      if (['Upcoming', 'Completed', 'Cancelled'].includes(filter)) {
        result = result.filter(a => a.status === filter);
      } else if (filter === 'Today' || filter === 'Tomorrow') {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        result = result.filter(a => a.date === (filter === 'Today' ? todayStr : tomorrowStr));
      }
    }

    // Sort
    result = [...result].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      if (sort === 'Newest') return dateB - dateA;
      if (sort === 'Oldest') return dateA - dateB;
      if (sort === 'Time') return a.time.localeCompare(b.time);
      if (sort === 'Patient Name') return a.patientName.localeCompare(b.patientName);
      return 0;
    });

    return result;
  }, [appointments, searchQuery, filter, sort]);

  // Handlers
  const handleScheduleNew = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await axios.post('/api/doctor/appointments', data, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (res.data.success) {
        toast.success('Appointment scheduled');
        setAppointments([res.data.data, ...appointments]);
        setShowScheduleModal(false);
      }
    } catch (error) {
      toast.error('Error scheduling appointment');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = { date: formData.get('date'), time: formData.get('time') };
    
    try {
      const res = await axios.put(`/api/doctor/appointments/${showRescheduleModal._id}`, data, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (res.data.success) {
        toast.success('Appointment rescheduled');
        setAppointments(appointments.map(a => a._id === res.data.data._id ? res.data.data : a));
        setShowRescheduleModal(null);
      }
    } catch (error) {
      toast.error('Error rescheduling appointment');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`/api/doctor/appointments/${id}`, { status }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (res.data.success) {
        toast.success(`Marked as ${status}`);
        setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
    setActiveMenu(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await axios.delete(`/api/doctor/appointments/${id}`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (res.data.success) {
        toast.success('Appointment deleted');
        setAppointments(appointments.filter(a => a._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
    setActiveMenu(null);
  };

  const openChat = async (appointment) => {
    setChatAppointment(appointment);
    try {
      const res = await axios.get(`/api/doctor/appointments/${appointment._id}/chat`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (res.data.success) {
        setChatMessages(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  const sendChat = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`/api/doctor/appointments/${chatAppointment._id}/chat`, {
        message: newMessage,
        sender: 'Doctor'
      }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (res.data.success) {
        setChatMessages([...chatMessages, res.data.data]);
        setNewMessage('');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>Manage your consultation schedule</p>
        </div>
        <button className={styles.scheduleBtn} onClick={() => setShowScheduleModal(true)}>
          <FiCalendar /> Schedule New
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search patients, disease, time..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Upcoming</option>
          <option>Completed</option>
          <option>Cancelled</option>
          <option>Today</option>
          <option>Tomorrow</option>
        </select>
        <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Newest</option>
          <option>Oldest</option>
          <option>Time</option>
          <option>Patient Name</option>
        </select>
      </div>

      <div className={styles.cardList}>
        {loading ? <p>Loading appointments...</p> : filteredAppointments.length === 0 ? <p>No appointments found.</p> : null}
        
        {filteredAppointments.map(app => (
          <div key={app._id} className={styles.card}>
            <div className={styles.cardLeft}>
              <img src={app.patientPhoto || DEFAULT_AVATAR} alt="Patient" className={styles.avatar} />
              <div className={styles.info}>
                <h3 className={styles.patientName} onClick={() => navigate(`/doctor/appointments/${app._id}/detail`)}>
                  {app.patientName}
                </h3>
                <p className={styles.problem}>{app.problem}</p>
                <div className={styles.meta}>
                  <span className={styles.metaItem}><FiClock /> {app.time}</span>
                  <span className={styles.metaItem}><FiVideo /> {app.consultationType}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.cardRight}>
              <span className={`${styles.statusBadge} ${styles['badge' + app.status]}`}>
                {app.status}
              </span>
              
              <div className={styles.actions}>
                <button 
                  className={styles.startCallBtn} 
                  disabled={app.status === 'Completed' || app.status === 'Cancelled'}
                  onClick={() => navigate(`/doctor/video-call/${app._id}`)}
                >
                  <FiVideo /> Start Call
                </button>
                <button className={styles.actionBtn} onClick={() => openChat(app)}>
                  <FiMessageCircle /> Message
                </button>
                <button className={styles.actionBtn} onClick={() => setShowRescheduleModal(app)}>
                  Reschedule
                </button>
                
                <div style={{ position: 'relative' }}>
                  <button className={styles.menuBtn} onClick={() => setActiveMenu(activeMenu === app._id ? null : app._id)}>
                    <FiMoreVertical />
                  </button>
                  {activeMenu === app._id && (
                    <div className={styles.menuDropdown}>
                      {app.status !== 'Completed' && (
                        <button className={styles.menuItem} onClick={() => updateStatus(app._id, 'Completed')}>Mark Completed</button>
                      )}
                      {app.status !== 'Cancelled' && (
                        <button className={styles.menuItem} onClick={() => updateStatus(app._id, 'Cancelled')}>Cancel Appointment</button>
                      )}
                      <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => handleDelete(app._id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showScheduleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Schedule New</h3>
              <button className={styles.closeBtn} onClick={() => setShowScheduleModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleScheduleNew}>
              <div className={styles.formGroup}>
                <label>Patient Name</label>
                <input type="text" name="patientName" required className={styles.formControl} />
              </div>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" required className={styles.formControl} />
              </div>
              <div className={styles.formGroup}>
                <label>Time</label>
                <input type="time" name="time" required className={styles.formControl} />
              </div>
              <div className={styles.formGroup}>
                <label>Consultation Type</label>
                <select name="consultationType" className={styles.formControl}>
                  <option>Video Consultation</option>
                  <option>Chat Consultation</option>
                  <option>Hospital Visit</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Problem</label>
                <input type="text" name="problem" required className={styles.formControl} />
              </div>
              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea name="notes" rows="3" className={styles.formControl}></textarea>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reschedule Appointment</h3>
              <button className={styles.closeBtn} onClick={() => setShowRescheduleModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" defaultValue={showRescheduleModal.date} required className={styles.formControl} />
              </div>
              <div className={styles.formGroup}>
                <label>Time</label>
                <input type="time" name="time" defaultValue={showRescheduleModal.time} required className={styles.formControl} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowRescheduleModal(null)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <div className={`${styles.chatDrawer} ${chatAppointment ? styles.chatDrawerOpen : ''}`}>
        {chatAppointment && (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatUserInfo}>
                <img src={chatAppointment.patientPhoto || DEFAULT_AVATAR} alt="Avatar" className={styles.chatAvatar} />
                <h4 style={{margin: 0}}>{chatAppointment.patientName}</h4>
              </div>
              <button className={styles.closeBtn} onClick={() => setChatAppointment(null)}><FiX /></button>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map(msg => (
                <div key={msg._id} className={`${styles.messageRow} ${msg.sender === 'Doctor' ? styles.messageSelf : styles.messageOther}`}>
                  <div className={styles.messageBubble}>{msg.message}</div>
                  <span className={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button className={styles.sendBtn} onClick={sendChat}><FiSend /></button>
            </div>
          </>
        )}
      </div>
      {/* Dim overlay for chat drawer on mobile */}
      {chatAppointment && (
        <div className={styles.modalOverlay} onClick={() => setChatAppointment(null)} style={{zIndex: 999, background: 'rgba(0,0,0,0.2)'}}></div>
      )}
    </div>
  );
};

export default Appointments;
