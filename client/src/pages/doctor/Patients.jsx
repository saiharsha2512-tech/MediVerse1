import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiPhone, FiFileText, FiEye,
  FiX, FiUser, FiCalendar, FiClipboard, FiAlertCircle,
  FiChevronDown
} from 'react-icons/fi';
import { MdOutlinePersonOff } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/doctor/api';
import styles from './Patients.module.css';

/* ─── Helpers ─────────────────────────────────────────────────── */
function getAvatarUrl(patient) {
  if (patient.profileImage) return patient.profileImage;
  const name = encodeURIComponent(patient.name || 'Patient');
  return `https://ui-avatars.com/api/?name=${name}&background=EEF6FF&color=0080FF&size=128`;
}

function formatLastVisit(dateStr) {
  if (!dateStr) return 'No visits yet';
  const date = new Date(dateStr);
  if (isNaN(date)) return 'Unknown';
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  const cls =
    status === 'Critical'   ? styles.statusCritical :
    status === 'Monitoring' ? styles.statusMonitoring :
                              styles.statusStable;
  return <span className={`${styles.statusBadge} ${cls}`}>{status || 'Stable'}</span>;
}

/* ─── Skeleton Card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className={styles.card}
      style={{ gap: 20, minHeight: 100 }}
      aria-hidden="true"
    >
      <div className={styles.skeleton} style={{ width: 68, height: 68, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className={styles.skeleton} style={{ height: 18, width: '40%' }} />
        <div className={styles.skeleton} style={{ height: 13, width: '30%' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className={styles.skeleton} style={{ height: 22, width: 90, borderRadius: 999 }} />
          <div className={styles.skeleton} style={{ height: 22, width: 70, borderRadius: 999 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className={styles.skeleton} style={{ height: 34, width: 110, borderRadius: 8 }} />
        <div className={styles.skeleton} style={{ height: 34, width: 100, borderRadius: 8 }} />
        <div className={styles.skeleton} style={{ height: 34, width: 72, borderRadius: 8 }} />
      </div>
    </div>
  );
}

/* ─── View Records Modal ───────────────────────────────────────── */
function ViewRecordsModal({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/patients/${patient._id}`);
        if (res.data.success) setDetails(res.data.data);
      } catch {
        toast.error('Could not load patient details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patient._id]);

  const tabs = [
    { id: 'overview',      label: 'Overview',      icon: <FiUser /> },
    { id: 'appointments',  label: 'Appointments',  icon: <FiCalendar /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FiClipboard /> },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Patient Records</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><FiX /></button>
        </div>

        {/* Patient mini-header */}
        <div className={styles.modalPatientHeader}>
          <img
            src={getAvatarUrl(patient)}
            alt={patient.name}
            className={styles.modalAvatar}
            onError={e => { e.target.src = getAvatarUrl({ name: patient.name }); }}
          />
          <div>
            <p className={styles.modalPatientName}>{patient.name}</p>
            <p className={styles.modalPatientMeta}>
              {patient.age ? `Age ${patient.age}` : ''}
              {patient.age && patient.gender ? ' · ' : ''}
              {patient.gender || ''}
              {(patient.age || patient.gender) && patient.phone ? ' · ' : ''}
              {patient.phone || ''}
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge status={patient.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.modalBody}>
          <div className={styles.tabRow}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} style={{ height: 48, borderRadius: 10 }} />)}
            </div>
          ) : (
            <>
              {/* Overview tab */}
              {activeTab === 'overview' && (
                <div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Age</span>
                      <span className={styles.infoValue}>{patient.age || '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Gender</span>
                      <span className={styles.infoValue}>{patient.gender || '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Phone</span>
                      <span className={styles.infoValue}>{patient.phone || '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue} style={{ wordBreak: 'break-all' }}>{patient.email || '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Last Visit</span>
                      <span className={styles.infoValue}>{formatLastVisit(patient.lastVisit)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Status</span>
                      <span className={styles.infoValue}><StatusBadge status={patient.status} /></span>
                    </div>
                  </div>

                  {patient.conditions?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p className={styles.infoLabel} style={{ marginBottom: 6 }}>Conditions</p>
                      <div className={styles.badgeRow}>
                        {patient.conditions.map((c, i) => (
                          <span key={i} className={styles.diseaseBadge}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {details?.notes && (
                    <div>
                      <p className={styles.infoLabel} style={{ marginBottom: 6 }}>Doctor Notes</p>
                      <div className={styles.notesBox}>{details.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Appointments tab */}
              {activeTab === 'appointments' && (
                <div>
                  {(!details?.appointments || details.appointments.length === 0) ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>No appointments found</p>
                  ) : (
                    details.appointments.map(a => (
                      <div key={a._id} className={styles.listItem}>
                        <div>
                          <div className={styles.listItemTitle}>
                            {a.appointmentDate || 'Unknown date'} · {a.appointmentTime || ''}
                          </div>
                          <div className={styles.listItemSub}>{a.mode} consultation</div>
                        </div>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: a.status === 'completed' ? '#f0fdf4' : a.status === 'cancelled' ? '#fef2f2' : '#f0f6ff',
                            color: a.status === 'completed' ? '#16a34a' : a.status === 'cancelled' ? '#dc2626' : '#0080FF',
                            border: 'none',
                          }}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Prescriptions tab */}
              {activeTab === 'prescriptions' && (
                <div>
                  {(!details?.prescriptions || details.prescriptions.length === 0) ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>No prescriptions found</p>
                  ) : (
                    details.prescriptions.map(p => (
                      <div key={p._id} className={styles.listItem}>
                        <div>
                          <div className={styles.listItemTitle}>
                            {p.medicines?.map(m => m.name).join(', ') || 'Prescription'}
                          </div>
                          <div className={styles.listItemSub}>
                            {p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </div>
                        </div>
                        {p.notes && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: 160, textAlign: 'right' }}>{p.notes}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Patient Modal ────────────────────────────────────────── */
function AddPatientModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', phone: '', email: '',
    conditions: '', status: 'Stable', notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Patient name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
        conditions: form.conditions
          ? form.conditions.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      const res = await api.post('/patients', payload);
      if (res.data.success) {
        toast.success('Patient added successfully');
        onSaved(res.data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Patient</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.form}>
              {/* Name */}
              <div className={styles.formGroup}>
                <label htmlFor="ap-name">Full Name *</label>
                <input
                  id="ap-name"
                  name="name"
                  className={styles.formControl}
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ap-age">Age</label>
                  <input
                    id="ap-age"
                    name="age"
                    type="number"
                    min="0"
                    max="130"
                    className={styles.formControl}
                    placeholder="e.g. 45"
                    value={form.age}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ap-gender">Gender</label>
                  <select id="ap-gender" name="gender" className={styles.formControl} value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ap-phone">Phone</label>
                  <input
                    id="ap-phone"
                    name="phone"
                    className={styles.formControl}
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ap-email">Email</label>
                  <input
                    id="ap-email"
                    name="email"
                    type="email"
                    className={styles.formControl}
                    placeholder="e.g. patient@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className={styles.formGroup}>
                <label htmlFor="ap-conditions">
                  Conditions / Diseases{' '}
                  <span style={{ color: '#9ca3af', fontWeight: 400 }}>(comma-separated)</span>
                </label>
                <input
                  id="ap-conditions"
                  name="conditions"
                  className={`${styles.formControl} ${styles.conditionsInput}`}
                  placeholder="e.g. Chest Pain, Diabetes Type 2"
                  value={form.conditions}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ap-status">Status</label>
                  <select id="ap-status" name="status" className={styles.formControl} value={form.status} onChange={handleChange}>
                    <option value="Stable">Stable</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className={styles.formGroup}>
                <label htmlFor="ap-notes">Doctor Notes</label>
                <textarea
                  id="ap-notes"
                  name="notes"
                  className={styles.formControl}
                  placeholder="Optional clinical notes…"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Patient Card ─────────────────────────────────────────────── */
function PatientCard({ patient, onViewRecords, onPrescription, index }) {
  const handleCall = () => {
    if (patient.phone) {
      window.location.href = `tel:${patient.phone}`;
    } else {
      toast(`Calling ${patient.name}…`, { icon: '📞' });
    }
  };

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Avatar */}
      <img
        src={getAvatarUrl(patient)}
        alt={patient.name}
        className={styles.avatar}
        onError={e => { e.target.src = getAvatarUrl({ name: patient.name }); }}
      />

      {/* Center body */}
      <div className={styles.cardBody}>
        <button
          className={styles.patientName}
          style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
          onClick={() => onViewRecords(patient)}
        >
          {patient.name}
        </button>

        <p className={styles.patientMeta}>
          {patient.age ? `Age: ${patient.age}` : ''}
          {patient.age && patient.lastVisit ? ' · ' : ''}
          {patient.lastVisit ? `Last Visit: ${formatLastVisit(patient.lastVisit)}` : ''}
        </p>

        <div className={styles.badgeRow}>
          {(patient.conditions || []).map((c, i) => (
            <span key={i} className={styles.diseaseBadge}>{c}</span>
          ))}
          <StatusBadge status={patient.status} />
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.cardActions}>
        <button
          id={`view-records-${patient._id}`}
          className={styles.viewBtn}
          onClick={() => onViewRecords(patient)}
          title="View patient records"
        >
          <FiEye />
          View Records
        </button>

        <button
          id={`prescription-${patient._id}`}
          className={styles.prescriptionBtn}
          onClick={() => onPrescription(patient)}
          title="Write prescription"
        >
          <FiFileText />
          Prescription
        </button>

        <button
          id={`call-${patient._id}`}
          className={styles.callBtn}
          onClick={handleCall}
          title={patient.phone ? `Call ${patient.phone}` : 'Call patient'}
        >
          <FiPhone />
          Call
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page Component ──────────────────────────────────────── */
const Patients = () => {
  const navigate = useNavigate();

  const [patients, setPatients]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);

  const [search, setSearch]               = useState('');
  const [activeFilter, setActiveFilter]   = useState('All');
  const [sortBy, setSortBy]               = useState('lastVisit_desc');

  const [showAddModal, setShowAddModal]   = useState(false);
  const [viewPatient, setViewPatient]     = useState(null);

  const searchTimeout = useRef(null);

  /* Fetch patients from doctor API */
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.includes('_')
        ? sortBy.split('_')
        : [sortBy, 'asc'];

      const res = await api.get('/patients', {
        params: {
          status: activeFilter !== 'All' ? activeFilter : undefined,
          sort:   sortField,
          order:  sortOrder,
        },
      });
      if (res.data.success) {
        setPatients(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (err) {
      console.error('fetchPatients error:', err);
      toast.error('Could not load patients');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, sortBy]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  /* Client-side search */
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(patients);
        return;
      }
      const q = search.toLowerCase();
      setFiltered(
        patients.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          (p.conditions || []).some(c => c.toLowerCase().includes(q)) ||
          String(p.age).includes(q)
        )
      );
    }, 200);
    return () => clearTimeout(searchTimeout.current);
  }, [search, patients]);

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setSearch('');
  };

  const handlePrescription = (patient) => {
    navigate('/doctor/prescriptions', { state: { patientId: patient.patientUserId, patientName: patient.name } });
  };

  const handlePatientAdded = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setFiltered(prev => [newPatient, ...prev]);
  };

  const filterOptions = ['All', 'Critical', 'Stable', 'Monitoring'];
  const sortOptions = [
    { value: 'lastVisit_desc', label: 'Last Visit (Recent first)' },
    { value: 'lastVisit_asc',  label: 'Last Visit (Oldest first)' },
    { value: 'name_asc',       label: 'Name (A – Z)' },
    { value: 'name_desc',      label: 'Name (Z – A)' },
    { value: 'age_asc',        label: 'Age (Youngest first)' },
    { value: 'age_desc',       label: 'Age (Oldest first)' },
  ];

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Patients</h1>
          <p className={styles.subtitle}>View and manage patient records</p>
        </div>
        <button
          id="add-patient-btn"
          className={styles.addBtn}
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus />
          Add Patient
        </button>
      </div>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        {/* Search */}
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            id="patient-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, disease, or age…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className={styles.filterTabs} role="tablist" aria-label="Patient status filter">
          {filterOptions.map(f => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFilter === f}
              className={`${styles.filterTab} ${activeFilter === f ? styles.filterTabActive : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          id="patient-sort"
          className={styles.sortSelect}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort patients"
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Patient Cards ── */}
      <div className={styles.cardList} role="list" aria-label="Patient list">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <MdOutlinePersonOff className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>
              {search ? 'No patients match your search' : 'No patients found'}
            </p>
            <p className={styles.emptySubtitle}>
              {search
                ? 'Try a different name, disease, or age'
                : 'Patients from your appointments will appear here automatically'}
            </p>
          </div>
        ) : (
          filtered.map((patient, index) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              index={index}
              onViewRecords={setViewPatient}
              onPrescription={handlePrescription}
            />
          ))
        )}
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onSaved={handlePatientAdded}
        />
      )}

      {viewPatient && (
        <ViewRecordsModal
          patient={viewPatient}
          onClose={() => setViewPatient(null)}
        />
      )}
    </div>
  );
};

export default Patients;
