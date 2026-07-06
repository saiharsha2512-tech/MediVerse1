import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FiRefreshCw, FiDownload, FiSearch, FiX,
  FiTrendingUp, FiCalendar, FiDollarSign,
  FiChevronLeft, FiChevronRight, FiFileText,
  FiChevronDown
} from 'react-icons/fi';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { BsCurrencyRupee } from 'react-icons/bs';
import toast from 'react-hot-toast';
import api from '../../services/doctor/api';
import styles from './Revenue.module.css';

/* ─── Helpers ──────────────────────────────────────────────────── */
function fmtAmount(n) {
  if (!n && n !== 0) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return (isToday ? 'Today' : fmtDate(dateStr)) + ' • ' + timeStr;
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'P')}&background=EEF6FF&color=0080FF&size=80`;
}

/* ─── Custom Recharts Tooltip ──────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '10px 16px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      fontSize: '0.85rem',
    }}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#111827' }}>{label}</p>
      <p style={{ margin: 0, color: '#0080FF', fontWeight: 700 }}>
        {fmtAmount(payload[0].value)}
      </p>
    </div>
  );
}

/* ─── Skeleton components ──────────────────────────────────────── */
function SkeletonStatCard() {
  return (
    <div className={`${styles.statCard} ${styles.statCardGreen}`} style={{ gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className={styles.skeleton} style={{ width: 44, height: 44, borderRadius: 12 }} />
        <div className={styles.skeleton} style={{ width: 50, height: 22, borderRadius: 999 }} />
      </div>
      <div>
        <div className={styles.skeleton} style={{ width: 110, height: 32, marginBottom: 8, borderRadius: 6 }} />
        <div className={styles.skeleton} style={{ width: 80, height: 16, borderRadius: 6 }} />
      </div>
    </div>
  );
}

function SkeletonTransactionRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeleton} style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className={styles.skeleton} style={{ width: '45%', height: 14, borderRadius: 6 }} />
        <div className={styles.skeleton} style={{ width: '65%', height: 11, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div className={styles.skeleton} style={{ width: 70, height: 16, borderRadius: 6 }} />
        <div className={styles.skeleton} style={{ width: 60, height: 20, borderRadius: 999 }} />
      </div>
    </div>
  );
}

/* ─── Transaction Detail Modal ─────────────────────────────────── */
function TransactionModal({ tx, onClose }) {
  const statusCls =
    tx.status === 'Completed' ? styles.txCompleted :
    tx.status === 'Refunded'  ? styles.txRefunded  : styles.txPending;

  const handlePrintInvoice = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice – ${tx.transactionId}</title>
      <style>body{font-family:Inter,sans-serif;padding:32px;color:#111827;}
      h1{font-size:1.4rem;margin-bottom:4px}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      td{padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:0.9rem}
      .label{color:#6b7280;width:40%}.amount{font-size:1.4rem;font-weight:700;color:#16a34a}
      </style></head>
      <body>
        <h1>MediVerse Doctor Portal</h1>
        <p style="color:#6b7280;margin:0">Invoice / Receipt</p>
        <table>
          <tr><td class="label">Transaction ID</td><td>${tx.transactionId || '—'}</td></tr>
          <tr><td class="label">Patient</td><td>${tx.patientName || '—'}</td></tr>
          <tr><td class="label">Consultation Type</td><td>${tx.consultationType || '—'}</td></tr>
          <tr><td class="label">Date</td><td>${fmtDate(tx.date)}</td></tr>
          <tr><td class="label">Time</td><td>${tx.appointmentTime || '—'}</td></tr>
          <tr><td class="label">Payment Method</td><td>${tx.paymentMethod || '—'}</td></tr>
          <tr><td class="label">Status</td><td>${tx.status}</td></tr>
          <tr><td class="label">Amount</td><td class="amount">${fmtAmount(tx.amount)}</td></tr>
        </table>
        <p style="margin-top:32px;font-size:0.75rem;color:#9ca3af">
          Generated by MediVerse Doctor Portal · ${new Date().toLocaleString('en-IN')}
        </p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Transaction Details</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><FiX /></button>
        </div>

        <div className={styles.modalBody}>
          {/* Amount Hero */}
          <div style={{
            textAlign: 'center', padding: '20px 0 24px',
            borderBottom: '1px solid #f1f5f9', marginBottom: 20
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>
              Amount Earned
            </p>
            <p className={styles.modalValueGreen} style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700 }}>
              {fmtAmount(tx.amount)}
            </p>
            <span className={`${styles.txStatusBadge} ${statusCls}`}
              style={{ display: 'inline-flex', marginTop: 10 }}>
              {tx.status}
            </span>
          </div>

          {/* Patient Info */}
          <div className={styles.modalSection}>
            <p className={styles.modalSectionTitle}>Patient Information</p>
            <div className={styles.modalGrid}>
              <div className={styles.modalItem}>
                <span className={styles.modalLabel}>Patient Name</span>
                <span className={styles.modalValue}>{tx.patientName || '—'}</span>
              </div>
              <div className={styles.modalItem}>
                <span className={styles.modalLabel}>Consultation Type</span>
                <span className={styles.modalValue}>{tx.consultationType || '—'}</span>
              </div>
            </div>
          </div>

          {/* Appointment Info */}
          <div className={styles.modalSection}>
            <p className={styles.modalSectionTitle}>Appointment Details</p>
            <div className={styles.modalGrid}>
              <div className={styles.modalItem}>
                <span className={styles.modalLabel}>Date</span>
                <span className={styles.modalValue}>{fmtDate(tx.date)}</span>
              </div>
              <div className={styles.modalItem}>
                <span className={styles.modalLabel}>Time</span>
                <span className={styles.modalValue}>{tx.appointmentTime || '—'}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className={styles.modalSection}>
            <p className={styles.modalSectionTitle}>Payment Information</p>
            <div className={styles.modalGrid}>
              <div className={styles.modalItem}>
                <span className={styles.modalLabel}>Transaction ID</span>
                <span className={styles.modalValue} style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {tx.transactionId || '—'}
                </span>
              </div>
              <div className={styles.modalItem}>
                <span className={styles.modalLabel}>Payment Method</span>
                <span className={styles.modalValue}>{tx.paymentMethod || '—'}</span>
              </div>
            </div>
          </div>

          {/* Invoice Button */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <button className={styles.invoiceBtn} onClick={handlePrintInvoice}>
              <FiFileText /> Print Invoice / Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({ value, label, badge, iconColor, cardColor, icon, delay }) {
  return (
    <div
      className={`${styles.statCard} ${cardColor}`}
      style={{ animationDelay: delay }}
    >
      <div className={styles.statCardTop}>
        <div className={`${styles.statIconBox} ${iconColor}`}>{icon}</div>
        <span className={`${styles.statBadge} ${iconColor === styles.iconGreen ? styles.badgeGreen : iconColor === styles.iconBlue ? styles.badgeBlue : styles.badgeTeal}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Export helpers ────────────────────────────────────────────── */
function downloadCSV(transactions) {
  const headers = ['Transaction ID', 'Patient Name', 'Consultation Type', 'Date', 'Time', 'Payment Method', 'Amount (₹)', 'Status'];
  const rows = transactions.map(t => [
    t.transactionId || '',
    t.patientName || '',
    t.consultationType || '',
    fmtDate(t.date),
    t.appointmentTime || '',
    t.paymentMethod || '',
    t.amount,
    t.status,
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported successfully');
}

function downloadJSON(transactions) {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('JSON exported successfully');
}

/* ─── Main Revenue Page ────────────────────────────────────────── */
const Revenue = () => {
  // ── Summary state ──
  const [summary, setSummary]           = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // ── Transactions state ──
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading]       = useState(true);
  const [txMeta, setTxMeta]             = useState({ total: 0, page: 1, totalPages: 1 });

  // ── Controls ──
  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort]                 = useState('date');
  const [order, setOrder]               = useState('desc');
  const [page, setPage]                 = useState(1);

  // ── UI state ──
  const [refreshing, setRefreshing]     = useState(false);
  const [selectedTx, setSelectedTx]     = useState(null);
  const [showExport, setShowExport]     = useState(false);
  const exportRef                       = useRef(null);
  const searchTimeout                   = useRef(null);

  const LIMIT = 10;

  const filterOptions = [
    { value: 'all',     label: 'All' },
    { value: 'today',   label: 'Today' },
    { value: 'last7',   label: 'Last 7 Days' },
    { value: 'week',    label: 'This Week' },
    { value: 'last30',  label: 'Last 30 Days' },
    { value: 'month',   label: 'This Month' },
    { value: 'last90',  label: 'Last 90 Days' },
    { value: 'year',    label: 'This Year' },
  ];

  /* ── Fetch summary ── */
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get('/revenue');
      if (res.data.success) setSummary(res.data.data);
    } catch (err) {
      console.error('fetchSummary error:', err);
      toast.error('Could not load revenue summary');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  /* ── Fetch transactions (server-side filter + sort + pagination) ── */
  const fetchTransactions = useCallback(async (p = 1) => {
    setTxLoading(true);
    try {
      const res = await api.get('/revenue/transactions', {
        params: {
          filter: activeFilter,
          search: search.trim(),
          sort,
          order,
          page: p,
          limit: LIMIT,
        },
      });
      if (res.data.success) {
        setTransactions(res.data.data.transactions);
        setTxMeta({
          total: res.data.data.total,
          page: res.data.data.page,
          totalPages: res.data.data.totalPages,
        });
      }
    } catch (err) {
      console.error('fetchTransactions error:', err);
      toast.error('Could not load transactions');
    } finally {
      setTxLoading(false);
    }
  }, [activeFilter, search, sort, order]);

  /* ── Initial load ── */
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  /* ── Transactions: re-fetch on filter/sort change, reset to page 1 ── */
  useEffect(() => {
    setPage(1);
    fetchTransactions(1);
  }, [activeFilter, sort, order]); // eslint-disable-line

  /* ── Search debounce ── */
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchTransactions(1);
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search]); // eslint-disable-line

  /* ── Pagination ── */
  const goToPage = (p) => {
    setPage(p);
    fetchTransactions(p);
  };

  /* ── Refresh ── */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSummary(), fetchTransactions(page)]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  /* ── Export dropdown: close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Render helpers ── */
  const trendData = summary?.trendData || [];
  const hasRevenue = summary?.hasData;

  const getStatusClass = (s) =>
    s === 'Completed' ? styles.txCompleted :
    s === 'Refunded'  ? styles.txRefunded  : styles.txPending;

  /* ── Pagination page numbers (show up to 5) ── */
  const buildPageNumbers = () => {
    const { totalPages } = txMeta;
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Revenue Analytics</h1>
          <p className={styles.subtitle}>Track your earnings and financial performance</p>
        </div>

        <div className={styles.headerActions}>
          {/* Refresh */}
          <button
            id="revenue-refresh-btn"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>

          {/* Export with dropdown */}
          <div className={styles.exportWrapper} ref={exportRef}>
            <button
              id="revenue-export-btn"
              className={styles.exportBtn}
              onClick={() => setShowExport(v => !v)}
            >
              <FiDownload />
              Export Report
              <FiChevronDown style={{ marginLeft: 2 }} />
            </button>

            {showExport && (
              <div className={styles.exportDropdown}>
                <button
                  className={styles.exportItem}
                  onClick={() => { downloadCSV(transactions); setShowExport(false); }}
                >
                  <FiFileText /> Export as CSV
                </button>
                <button
                  className={styles.exportItem}
                  onClick={() => { downloadJSON(transactions); setShowExport(false); }}
                >
                  <FiDownload /> Export as JSON
                </button>
                <button
                  className={styles.exportItem}
                  onClick={() => { window.print(); setShowExport(false); }}
                >
                  <MdOutlineReceiptLong /> Print / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsGrid}>
        {summaryLoading ? (
          [1, 2, 3].map(i => <SkeletonStatCard key={i} />)
        ) : (
          <>
            {/* This Month */}
            <div
              className={`${styles.statCard} ${styles.statCardGreen}`}
              style={{ animationDelay: '0s' }}
            >
              <div className={styles.statCardTop}>
                <div className={`${styles.statIconBox} ${styles.iconGreen}`}>
                  <BsCurrencyRupee />
                </div>
                <span className={`${styles.statBadge} ${styles.badgeGreen}`}>
                  {summary?.monthlyChange >= 0 ? '+' : ''}{summary?.monthlyChange ?? 0}%
                </span>
              </div>
              <div>
                <p className={styles.statValue}>{fmtAmount(summary?.thisMonth ?? 0)}</p>
                <p className={styles.statLabel}>This Month</p>
              </div>
            </div>

            {/* Today */}
            <div
              className={`${styles.statCard} ${styles.statCardBlue}`}
              style={{ animationDelay: '0.06s' }}
            >
              <div className={styles.statCardTop}>
                <div className={`${styles.statIconBox} ${styles.iconBlue}`}>
                  <FiTrendingUp />
                </div>
                <span className={`${styles.statBadge} ${styles.badgeBlue}`}>Today</span>
              </div>
              <div>
                <p className={styles.statValue}>{fmtAmount(summary?.today ?? 0)}</p>
                <p className={styles.statLabel}>Today's Earnings</p>
              </div>
            </div>

            {/* This Week */}
            <div
              className={`${styles.statCard} ${styles.statCardTeal}`}
              style={{ animationDelay: '0.12s' }}
            >
              <div className={styles.statCardTop}>
                <div className={`${styles.statIconBox} ${styles.iconTeal}`}>
                  <FiCalendar />
                </div>
                <span className={`${styles.statBadge} ${styles.badgeTeal}`}>This Week</span>
              </div>
              <div>
                <p className={styles.statValue}>{fmtAmount(summary?.thisWeek ?? 0)}</p>
                <p className={styles.statLabel}>Weekly Earnings</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Revenue Trend Chart ── */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Revenue Trend (Last 6 Months)</h3>
        </div>

        {summaryLoading ? (
          <div className={styles.skeleton} style={{ height: 260, borderRadius: 10 }} />
        ) : !hasRevenue || trendData.every(d => d.revenue === 0) ? (
          <div className={styles.chartEmpty}>
            <FiTrendingUp className={styles.chartEmptyIcon} />
            <p className={styles.chartEmptyText}>No revenue data yet</p>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem', margin: 0 }}>
              Revenue will appear once consultations are marked completed
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0080FF" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0080FF"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#0080FF', strokeWidth: 0 }}
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Transactions Section ── */}
      <div className={styles.transactionsCard}>

        {/* Section header */}
        <div className={styles.transactionsHeader}>
          <h3 className={styles.transactionsTitle}>Recent Transactions</h3>
          <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
            {txMeta.total} record{txMeta.total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search + Sort */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <FiSearch className={styles.searchIcon} />
            <input
              id="revenue-search"
              type="text"
              className={styles.searchInput}
              placeholder="Search patient, type, or transaction ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            id="revenue-sort"
            className={styles.sortSelect}
            value={`${sort}_${order}`}
            onChange={e => {
              const [s, o] = e.target.value.split('_');
              setSort(s);
              setOrder(o);
            }}
          >
            <option value="date_desc">Date (Newest first)</option>
            <option value="date_asc">Date (Oldest first)</option>
            <option value="amount_desc">Amount (High → Low)</option>
            <option value="amount_asc">Amount (Low → High)</option>
            <option value="name_asc">Patient Name (A – Z)</option>
            <option value="name_desc">Patient Name (Z – A)</option>
          </select>
        </div>

        {/* Filter chips */}
        <div className={styles.filterChips}>
          {filterOptions.map(f => (
            <button
              key={f.value}
              className={`${styles.chip} ${activeFilter === f.value ? styles.chipActive : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        <div className={styles.transactionList}>
          {txLoading ? (
            [1, 2, 3, 4, 5].map(i => <SkeletonTransactionRow key={i} />)
          ) : transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <MdOutlineReceiptLong className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>
                {search ? 'No matching transactions' : 'No revenue yet'}
              </p>
              <p className={styles.emptySubtitle}>
                {search
                  ? 'Try a different search term or filter'
                  : 'Revenue records will appear here once consultations are completed.'}
              </p>
            </div>
          ) : (
            transactions.map(tx => (
              <div
                key={tx._id}
                id={`tx-row-${tx._id}`}
                className={styles.transactionRow}
                onClick={() => setSelectedTx(tx)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedTx(tx)}
              >
                {/* Avatar */}
                <img
                  src={getAvatarUrl(tx.patientName)}
                  alt={tx.patientName}
                  className={styles.txAvatar}
                  onError={e => { e.target.src = getAvatarUrl('P'); }}
                />

                {/* Info */}
                <div className={styles.txInfo}>
                  <p className={styles.txName}>{tx.patientName || 'Unknown Patient'}</p>
                  <p className={styles.txMeta}>
                    {tx.consultationType || 'Consultation'} · {fmtDateTime(tx.date)}
                  </p>
                </div>

                {/* Right side */}
                <div className={styles.txRight}>
                  <span className={`${styles.txAmount} ${tx.status === 'Refunded' ? styles.txAmountNegative : ''}`}>
                    {tx.status === 'Refunded' ? '-' : '+'}{fmtAmount(tx.amount)}
                  </span>
                  <span className={`${styles.txStatusBadge} ${getStatusClass(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!txLoading && txMeta.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(txMeta.page - 1) * LIMIT + 1}–{Math.min(txMeta.page * LIMIT, txMeta.total)} of {txMeta.total}
            </span>
            <div className={styles.pageControls}>
              <button
                className={styles.pageBtn}
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <FiChevronLeft />
              </button>

              {buildPageNumbers().map(n => (
                <button
                  key={n}
                  className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
                  onClick={() => goToPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => goToPage(page + 1)}
                disabled={page >= txMeta.totalPages}
                aria-label="Next page"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Transaction Detail Modal ── */}
      {selectedTx && (
        <TransactionModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

export default Revenue;
