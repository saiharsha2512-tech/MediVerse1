import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import profileService from '../../../services/profileService';
import './profile.css';

const MedicalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '', specialization: '', hospital: '', diagnosis: '', notes: '', prescription: '', visitDate: ''
  });
  const [editId, setEditId] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileService.getMedicalHistory();
      if (res.success) setHistory(res.history);
    } catch (error) {
      toast.error('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await profileService.updateMedicalHistory(editId, formData);
        toast.success('Record updated');
      } else {
        await profileService.addMedicalHistory(formData);
        toast.success('Record added');
      }
      setIsModalOpen(false);
      setFormData({ doctorName: '', specialization: '', hospital: '', diagnosis: '', notes: '', prescription: '', visitDate: '' });
      setEditId(null);
      fetchHistory();
    } catch (error) {
      toast.error('Failed to save record');
    }
  };

  const handleEdit = (record) => {
    setFormData({
      doctorName: record.doctorName,
      specialization: record.specialization || '',
      hospital: record.hospital || '',
      diagnosis: record.diagnosis,
      notes: record.notes || '',
      prescription: record.prescription || '',
      visitDate: new Date(record.visitDate).toISOString().split('T')[0]
    });
    setEditId(record._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await profileService.deleteMedicalHistory(id);
        toast.success('Record deleted');
        fetchHistory();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const filteredHistory = history
    .filter(h => 
      h.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.specialization && h.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.visitDate) - new Date(a.visitDate);
      return new Date(a.visitDate) - new Date(b.visitDate);
    });

  return (
    <div className="info-card">
      <div className="section-title">
        <span>Medical History</span>
        <button className="btn-primary" onClick={() => { setEditId(null); setIsModalOpen(true); }} style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiPlus /> Add Record
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch style={{ position: 'absolute', top: '12px', left: '10px', color: '#6b7280' }} />
          <input type="text" placeholder="Search by doctor, diagnosis, specialization..." className="form-input" style={{ paddingLeft: '35px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: '150px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div><div className="skeleton" style={{ height: '80px', marginBottom: '10px' }}></div><div className="skeleton" style={{ height: '80px' }}></div></div>
      ) : filteredHistory.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No medical history records found.</p>
      ) : (
        filteredHistory.map(record => (
          <div key={record._id} className="list-item">
            <div className="list-item-content">
              <div className="list-item-title">{record.diagnosis}</div>
              <div className="list-item-desc">
                <span><strong>Dr.</strong> {record.doctorName} {record.specialization && `(${record.specialization})`}</span>
                <span>|</span>
                <span>{new Date(record.visitDate).toLocaleDateString()}</span>
                {record.hospital && <><span>|</span><span>{record.hospital}</span></>}
              </div>
            </div>
            <div className="list-item-actions">
              <button className="icon-btn" onClick={() => handleEdit(record)}><FiEdit2 size={18} /></button>
              <button className="icon-btn danger" onClick={() => handleDelete(record._id)}><FiTrash2 size={18} /></button>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editId ? 'Edit Record' : 'Add Medical Record'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label className="info-label">Doctor Name *</label><input required name="doctorName" value={formData.doctorName} onChange={handleChange} className="form-input" /></div>
              <div><label className="info-label">Specialization</label><input name="specialization" value={formData.specialization} onChange={handleChange} className="form-input" /></div>
              <div><label className="info-label">Hospital/Clinic</label><input name="hospital" value={formData.hospital} onChange={handleChange} className="form-input" /></div>
              <div><label className="info-label">Diagnosis *</label><input required name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="form-input" /></div>
              <div><label className="info-label">Visit Date *</label><input type="date" required name="visitDate" value={formData.visitDate} onChange={handleChange} className="form-input" /></div>
              <div><label className="info-label">Prescription</label><textarea name="prescription" value={formData.prescription} onChange={handleChange} className="form-input" rows="2"></textarea></div>
              <div><label className="info-label">Doctor Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} className="form-input" rows="2"></textarea></div>
              
              <div className="action-bar">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
