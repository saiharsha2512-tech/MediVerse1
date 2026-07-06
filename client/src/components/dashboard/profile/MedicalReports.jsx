import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiTrash2, FiUploadCloud, FiFileText, FiImage, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import profileService from '../../../services/profileService';
import './profile.css';

const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await profileService.getReports();
      if (res.success) setReports(res.reports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportName', file.name);

    try {
      setIsUploading(true);
      await profileService.uploadReport(formData);
      toast.success('Report uploaded successfully');
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await profileService.deleteReport(id);
        toast.success('Report deleted');
        fetchReports();
      } catch (error) {
        toast.error('Failed to delete report');
      }
    }
  };

  const handleRename = async (id, currentName) => {
    const newName = window.prompt('Enter new name for the report:', currentName);
    if (newName && newName.trim() !== '' && newName !== currentName) {
      try {
        await profileService.renameReport(id, newName.trim());
        toast.success('Report renamed');
        fetchReports();
      } catch (error) {
        toast.error('Failed to rename report');
      }
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (url) => {
    if (!url) return <FiFileText size={24} color="#3b82f6" />;
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <FiImage size={24} color="#10b981" />;
    return <FiFileText size={24} color="#3b82f6" />;
  };

  return (
    <div className="info-card">
      <div className="section-title">
        <span>Medical Reports</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          style={{ display: 'none' }} 
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <button 
          className="btn-primary" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          {isUploading ? 'Uploading...' : <><FiUploadCloud /> Upload</>}
        </button>
      </div>

      {loading ? (
        <div><div className="skeleton" style={{ height: '70px', marginBottom: '10px' }}></div></div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '30px 20px' }}>
          <FiUploadCloud size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
          <p>No medical reports uploaded yet.</p>
          <p style={{ fontSize: '0.85rem' }}>Supported formats: PDF, JPG, PNG (Max 10MB)</p>
        </div>
      ) : (
        reports.map(report => (
          <div key={report._id} className="list-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
                {getFileIcon(report.fileUrl)}
              </div>
              <div>
                <div className="list-item-title">{report.reportName}</div>
                <div className="list-item-desc">
                  <span>{new Date(report.uploadDate).toLocaleDateString()}</span>
                  <span>|</span>
                  <span>{formatSize(report.fileSize)}</span>
                  <span>|</span>
                  <span style={{ background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{report.category}</span>
                </div>
              </div>
            </div>
            
            <div className="list-item-actions">
              <a href={`http://localhost:5000${report.fileUrl}`} target="_blank" rel="noreferrer" className="icon-btn" title="View/Download">
                <FiDownload size={18} />
              </a>
              <button className="icon-btn" onClick={() => handleRename(report._id, report.reportName)} title="Rename"><FiEdit2 size={18} /></button>
              <button className="icon-btn danger" onClick={() => handleDelete(report._id)} title="Delete"><FiTrash2 size={18} /></button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MedicalReports;
