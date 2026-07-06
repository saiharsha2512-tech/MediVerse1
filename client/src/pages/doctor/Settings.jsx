import { useState, useEffect, useRef } from 'react';
import {
  FiSettings, FiBell, FiClock, FiLock, FiLogOut,
  FiChevronRight, FiEye, FiEyeOff, FiRefreshCw, FiUser,
  FiSave, FiX, FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/doctor/api';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import styles from './DoctorSettings.module.css';

/* ─── Days of week ─────────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ─── Toggle component ─────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
  return (
    <label className={styles.toggle} htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={styles.toggleSlider} />
    </label>
  );
}

/* ─── Change Password Modal ────────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/password', form);
      if (res.data.success) {
        toast.success('Password changed successfully');
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'currentPassword', label: 'Current Password', key: 'current' },
    { name: 'newPassword',     label: 'New Password',     key: 'new' },
    { name: 'confirmPassword', label: 'Confirm Password', key: 'confirm' },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Change Password</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><FiX /></button>
        </div>
        <form onSubmit={submit}>
          <div className={styles.modalBody}>
            {fields.map(f => (
              <div key={f.name} className={styles.formGroup}>
                <label htmlFor={`pw-${f.name}`}>{f.label}</label>
                <div className={styles.pwWrapper}>
                  <input
                    id={`pw-${f.name}`}
                    name={f.name}
                    type={show[f.key] ? 'text' : 'password'}
                    className={`${styles.formControl} ${styles.formControlPw}`}
                    placeholder="••••••••"
                    value={form[f.name]}
                    onChange={handle}
                    required
                  />
                  <button
                    type="button"
                    className={styles.pwToggle}
                    onClick={() => setShow(s => ({ ...s, [f.key]: !s[f.key] }))}
                    aria-label={show[f.key] ? 'Hide password' : 'Show password'}
                  >
                    {show[f.key] ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? <FiRefreshCw className={styles.spinning} /> : <FiLock />}
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Notification Panel ───────────────────────────────────────── */
function NotificationPanel({ initialPrefs, onSave }) {
  const [prefs, setPrefs] = useState({
    appointments: true,
    chat: true,
    email: true,
    sms: false,
    ...initialPrefs,
  });
  const [saving, setSaving] = useState(false);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.put('/settings', { notifications: updated });
      toast.success('Preferences saved');
      onSave?.(updated);
    } catch {
      toast.error('Failed to save');
      setPrefs(prefs); // revert
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: 'appointments', label: 'Appointment Notifications', sub: 'Get notified when appointments are scheduled' },
    { key: 'chat',         label: 'Chat Notifications',        sub: 'Receive alerts for new patient messages' },
    { key: 'email',        label: 'Email Notifications',       sub: 'Send summaries to your registered email' },
    { key: 'sms',          label: 'SMS Notifications',         sub: 'Receive SMS for critical updates' },
  ];

  return (
    <div>
      {items.map(item => (
        <div key={item.key} className={styles.notifRow}>
          <div>
            <p className={styles.notifLabel}>{item.label}</p>
            <p className={styles.notifSub}>{item.sub}</p>
          </div>
          <Toggle
            id={`notif-${item.key}`}
            checked={prefs[item.key]}
            onChange={() => toggle(item.key)}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Availability Panel ───────────────────────────────────────── */
function AvailabilityPanel({ initialDays = [], initialTime = {}, onSave }) {
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [startTime, setStartTime] = useState(initialTime.start || '09:00');
  const [endTime, setEndTime]     = useState(initialTime.end   || '18:00');
  const [saving, setSaving]       = useState(false);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        availability: {
          availableDays: selectedDays,
          availableTime: { start: startTime, end: endTime },
        },
      });
      toast.success('Availability updated');
      onSave?.({ availableDays: selectedDays, availableTime: { start: startTime, end: endTime } });
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.formGroup} style={{ marginBottom: 14 }}>
        <label>Available Days</label>
        <div className={styles.dayChips}>
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              className={`${styles.dayChip} ${selectedDays.includes(day) ? styles.dayChipActive : ''}`}
              onClick={() => toggleDay(day)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.availTimeRow}>
        <div className={styles.formGroup}>
          <label htmlFor="avail-start">Start Time</label>
          <input
            id="avail-start"
            type="time"
            className={styles.formControl}
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="avail-end">End Time</label>
          <input
            id="avail-end"
            type="time"
            className={styles.formControl}
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        className={styles.panelSaveBtn}
        onClick={save}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Availability'}
      </button>
    </div>
  );
}

/* ─── Main Settings Page ───────────────────────────────────────── */
const Settings = () => {
  const { doctor, setDoctor, logoutDoctor } = useDoctorAuth();

  /* Profile form state */
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '',
    medicalRegistrationNumber: '', specialty: '', qualification: '',
    experience: '', hospital: '', fee: '', city: '', state: '',
    image: '', bio: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving]                 = useState(false);

  /* Expanded panel */
  const [openPanel, setOpenPanel] = useState(null); // 'notifications' | 'availability' | null

  /* Modals */
  const [showPwModal, setShowPwModal] = useState(false);

  const fileInputRef = useRef(null);

  /* ── Load profile ── */
  useEffect(() => {
    const fetch = async () => {
      setProfileLoading(true);
      try {
        const res = await api.get('/profile');
        if (res.data.success) {
          const d = res.data.data;
          setProfile({
            name:                     d.name || '',
            email:                    d.email || '',
            phone:                    d.phone || '',
            medicalRegistrationNumber: d.medicalRegistrationNumber || '',
            specialty:                d.specialty || '',
            qualification:            d.qualification || '',
            experience:               d.experience || '',
            hospital:                 d.hospital || '',
            fee:                      d.fee || '',
            city:                     d.city || '',
            state:                    d.state || '',
            image:                    d.image || '',
            bio:                      d.bio || '',
            availableDays:            d.availableDays || [],
            availableTime:            d.availableTime || {},
            notifications:            d.notifications || {},
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        toast.error('Could not load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    fetch();
  }, []);

  /* ── Handle field change ── */
  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  /* ── Avatar upload (base64 preview) ── */
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setProfile(p => ({ ...p, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  /* ── Save profile ── */
  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', {
        name:          profile.name,
        phone:         profile.phone,
        qualification: profile.qualification,
        experience:    profile.experience,
        hospital:      profile.hospital,
        fee:           Number(profile.fee),
        city:          profile.city,
        state:         profile.state,
        image:         profile.image,
        bio:           profile.bio,
      });
      if (res.data.success) {
        // Update global auth context so sidebar/header reflect changes immediately
        setDoctor(prev => ({ ...prev, ...res.data.data }));
        localStorage.setItem('doctorUser', JSON.stringify({ ...doctor, ...res.data.data }));
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle action panel ── */
  const togglePanel = (panel) => setOpenPanel(prev => prev === panel ? null : panel);

  /* ── Avatar URL ── */
  const avatarSrc = profile.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Dr')}&background=EEF6FF&color=0080FF&size=128`;

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className={styles.container}>

      {/* ── Page Header ── */}
      <div>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Configure your account and preferences</p>
      </div>

      {/* ── Profile Information Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderIcon}><FiUser /></div>
          <div>
            <p className={styles.cardTitle}>Profile Information</p>
            <p className={styles.cardSubtitle}>Your registered doctor details</p>
          </div>
        </div>

        <div className={styles.cardBody}>
          {profileLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Avatar skeleton */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <div className={styles.skeleton} style={{ width: 76, height: 76, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className={styles.skeleton} style={{ height: 16, width: '40%', marginBottom: 8 }} />
                  <div className={styles.skeleton} style={{ height: 12, width: '60%' }} />
                </div>
              </div>
              {/* Field skeletons */}
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className={styles.skeleton} style={{ height: 42, borderRadius: 9 }} />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* Avatar */}
              <div className={styles.avatarRow}>
                <img
                  src={avatarSrc}
                  alt={profile.name}
                  className={styles.avatar}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=Dr&background=EEF6FF&color=0080FF`; }}
                />
                <div className={styles.avatarInfo}>
                  <p className={styles.avatarName}>
                    {profile.name ? `Dr. ${profile.name.replace(/^Dr\.?\s*/i, '')}` : 'Doctor'}
                  </p>
                  <p className={styles.avatarRole}>{profile.specialty || 'Specialist'}</p>
                  <button
                    type="button"
                    className={styles.avatarUploadBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Fields grid */}
              <div className={styles.formGrid}>

                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-name">Full Name</label>
                  <input
                    id="s-name"
                    name="name"
                    className={styles.formControl}
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Dr. Name"
                  />
                </div>

                {/* Email – read-only */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-email">
                    Email <span className={styles.readOnlyBadge}>Read-only</span>
                  </label>
                  <input
                    id="s-email"
                    name="email"
                    className={`${styles.formControl} ${styles.formControlReadOnly}`}
                    value={profile.email}
                    readOnly
                    tabIndex={-1}
                  />
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-phone">Phone Number</label>
                  <input
                    id="s-phone"
                    name="phone"
                    className={styles.formControl}
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                  />
                </div>

                {/* Reg Number – read-only */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-reg">
                    Registration No. <span className={styles.readOnlyBadge}>Read-only</span>
                  </label>
                  <input
                    id="s-reg"
                    className={`${styles.formControl} ${styles.formControlReadOnly}`}
                    value={profile.medicalRegistrationNumber}
                    readOnly
                    tabIndex={-1}
                  />
                </div>

                {/* Specialization – read-only */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-spec">
                    Specialization <span className={styles.readOnlyBadge}>Read-only</span>
                  </label>
                  <input
                    id="s-spec"
                    className={`${styles.formControl} ${styles.formControlReadOnly}`}
                    value={profile.specialty}
                    readOnly
                    tabIndex={-1}
                  />
                </div>

                {/* Qualification */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-qual">Qualification</label>
                  <input
                    id="s-qual"
                    name="qualification"
                    className={styles.formControl}
                    value={profile.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD"
                  />
                </div>

                {/* Experience */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-exp">Experience</label>
                  <input
                    id="s-exp"
                    name="experience"
                    className={styles.formControl}
                    value={profile.experience}
                    onChange={handleChange}
                    placeholder="e.g. 10 years"
                  />
                </div>

                {/* Hospital */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-hospital">Hospital / Clinic</label>
                  <input
                    id="s-hospital"
                    name="hospital"
                    className={styles.formControl}
                    value={profile.hospital}
                    onChange={handleChange}
                    placeholder="Hospital or clinic name"
                  />
                </div>

                {/* Consultation Fee */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-fee">Consultation Fee</label>
                  <div className={styles.feeWrapper}>
                    <span className={styles.feePrefix}>₹</span>
                    <input
                      id="s-fee"
                      name="fee"
                      type="number"
                      min="0"
                      className={`${styles.formControl} ${styles.feeControl}`}
                      value={profile.fee}
                      onChange={handleChange}
                      placeholder="500"
                    />
                  </div>
                </div>

                {/* City */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-city">City</label>
                  <input
                    id="s-city"
                    name="city"
                    className={styles.formControl}
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                  />
                </div>

                {/* State */}
                <div className={styles.formGroup}>
                  <label htmlFor="s-state">State</label>
                  <input
                    id="s-state"
                    name="state"
                    className={styles.formControl}
                    value={profile.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                {/* Bio – full width */}
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label htmlFor="s-bio">Bio / About</label>
                  <textarea
                    id="s-bio"
                    name="bio"
                    className={styles.formControl}
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Brief description about your practice…"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                id="settings-save-btn"
                type="submit"
                className={styles.saveBtn}
                disabled={saving}
              >
                {saving ? <FiRefreshCw className={styles.spinning} /> : <FiSave />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Account Actions Card ── */}
      <div className={styles.card} style={{ animationDelay: '0.08s' }}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardHeaderIcon}`} style={{ background: 'linear-gradient(135deg, #ebfcf5, #a7f3d0)', color: '#00C896' }}>
            <FiSettings />
          </div>
          <div>
            <p className={styles.cardTitle}>Account Actions</p>
            <p className={styles.cardSubtitle}>Manage notifications, availability, and security</p>
          </div>
        </div>

        <div className={styles.actionList}>

          {/* ── Notification Preferences ── */}
          <div
            className={styles.actionItem}
            onClick={() => togglePanel('notifications')}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && togglePanel('notifications')}
            id="settings-notifications-btn"
            aria-expanded={openPanel === 'notifications'}
          >
            <div className={styles.actionLeft}>
              <div className={`${styles.actionIcon} ${styles.actionIconBlue}`}><FiBell /></div>
              <div>
                <p className={styles.actionLabel}>Notification Preferences</p>
                <p className={styles.actionSub}>Manage alerts and notification channels</p>
              </div>
            </div>
            <FiChevronRight
              className={styles.actionArrow}
              style={{ transform: openPanel === 'notifications' ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s ease' }}
            />
          </div>
          <div className={`${styles.expandPanel} ${openPanel === 'notifications' ? styles.expandPanelOpen : ''}`}>
            <div className={styles.expandPanelInner}>
              <NotificationPanel
                initialPrefs={profile.notifications}
                onSave={updated => setProfile(p => ({ ...p, notifications: updated }))}
              />
            </div>
          </div>

          {/* ── Availability Settings ── */}
          <div
            className={styles.actionItem}
            onClick={() => togglePanel('availability')}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && togglePanel('availability')}
            id="settings-availability-btn"
            aria-expanded={openPanel === 'availability'}
          >
            <div className={styles.actionLeft}>
              <div className={`${styles.actionIcon} ${styles.actionIconGreen}`}><FiClock /></div>
              <div>
                <p className={styles.actionLabel}>Availability Settings</p>
                <p className={styles.actionSub}>Set your working days and consultation hours</p>
              </div>
            </div>
            <FiChevronRight
              className={styles.actionArrow}
              style={{ transform: openPanel === 'availability' ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s ease' }}
            />
          </div>
          <div className={`${styles.expandPanel} ${openPanel === 'availability' ? styles.expandPanelOpen : ''}`}>
            <div className={styles.expandPanelInner}>
              <AvailabilityPanel
                initialDays={profile.availableDays}
                initialTime={profile.availableTime}
                onSave={updated => setProfile(p => ({ ...p, ...updated }))}
              />
            </div>
          </div>

          {/* ── Change Password ── */}
          <div
            className={styles.actionItem}
            onClick={() => setShowPwModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setShowPwModal(true)}
            id="settings-password-btn"
          >
            <div className={styles.actionLeft}>
              <div className={`${styles.actionIcon} ${styles.actionIconPurple}`}><FiLock /></div>
              <div>
                <p className={styles.actionLabel}>Change Password</p>
                <p className={styles.actionSub}>Update your login credentials</p>
              </div>
            </div>
            <FiChevronRight className={styles.actionArrow} />
          </div>

          {/* ── Logout ── */}
          <div
            className={`${styles.actionItem} ${styles.actionItemDanger}`}
            onClick={logoutDoctor}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && logoutDoctor()}
            id="settings-logout-btn"
          >
            <div className={styles.actionLeft}>
              <div className={`${styles.actionIcon} ${styles.actionIconRed}`}><FiLogOut /></div>
              <div>
                <p className={styles.actionLabel}>Logout</p>
                <p className={styles.actionSub}>Sign out of your Doctor Portal account</p>
              </div>
            </div>
            <FiChevronRight className={styles.actionArrow} />
          </div>

        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {showPwModal && (
        <ChangePasswordModal onClose={() => setShowPwModal(false)} />
      )}
    </div>
  );
};

export default Settings;
