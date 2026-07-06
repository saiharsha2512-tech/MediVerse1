const DoctorRevenue = require('../../models/DoctorRevenue');

/* ─────────────────────────────────────────────────────────────
   Helper: build date-range filter object from query param
   Supported values: today, week, month, year, last7, last30,
                     last90, custom (requires startDate, endDate)
   ───────────────────────────────────────────────────────────── */
function buildDateFilter(filter, startDate, endDate) {
  const now = new Date();

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  switch (filter) {
    case 'today': {
      const s = startOfDay(now);
      const e = new Date(s);
      e.setDate(e.getDate() + 1);
      return { $gte: s, $lt: e };
    }
    case 'week': {
      const s = new Date(now);
      s.setDate(now.getDate() - now.getDay());
      s.setHours(0, 0, 0, 0);
      return { $gte: s };
    }
    case 'month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { $gte: s };
    }
    case 'year': {
      const s = new Date(now.getFullYear(), 0, 1);
      return { $gte: s };
    }
    case 'last7': {
      const s = new Date(now);
      s.setDate(s.getDate() - 7);
      return { $gte: s };
    }
    case 'last30': {
      const s = new Date(now);
      s.setDate(s.getDate() - 30);
      return { $gte: s };
    }
    case 'last90': {
      const s = new Date(now);
      s.setDate(s.getDate() - 90);
      return { $gte: s };
    }
    case 'custom': {
      if (startDate && endDate) {
        return { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      return null;
    }
    default:
      return null; // 'all' → no date filter
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/doctor/revenue
   Returns summary stats + 6-month trend data
   ───────────────────────────────────────────────────────────── */
const getRevenueSummary = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const now = new Date();

    // ── This Month ──
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonthRevs, lastMonthRevs] = await Promise.all([
      DoctorRevenue.find({ doctorId, status: 'Completed', date: { $gte: monthStart } }),
      DoctorRevenue.find({ doctorId, status: 'Completed', date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    const thisMonthTotal = thisMonthRevs.reduce((s, r) => s + r.amount, 0);
    const lastMonthTotal = lastMonthRevs.reduce((s, r) => s + r.amount, 0);
    const monthlyChange = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : 0;

    // ── Today ──
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRevs = await DoctorRevenue.find({
      doctorId,
      status: 'Completed',
      date: { $gte: todayStart, $lt: todayEnd },
    });
    const todayTotal = todayRevs.reduce((s, r) => s + r.amount, 0);

    // ── This Week ──
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekRevs = await DoctorRevenue.find({
      doctorId,
      status: 'Completed',
      date: { $gte: weekStart },
    });
    const weekTotal = weekRevs.reduce((s, r) => s + r.amount, 0);

    // ── Pending ──
    const pendingRevs = await DoctorRevenue.find({ doctorId, status: 'Pending' });
    const pendingTotal = pendingRevs.reduce((s, r) => s + r.amount, 0);

    // ── Refunded ──
    const refundedRevs = await DoctorRevenue.find({ doctorId, status: 'Refunded' });
    const refundedTotal = refundedRevs.reduce((s, r) => s + r.amount, 0);

    // ── All-time total ──
    const allRevs = await DoctorRevenue.find({ doctorId, status: 'Completed' });
    const allTotal = allRevs.reduce((s, r) => s + r.amount, 0);
    const avgPerConsultation = allRevs.length > 0 ? Math.round(allTotal / allRevs.length) : 0;

    // ── 6-Month Trend ──
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthRevs = await DoctorRevenue.find({
        doctorId,
        status: 'Completed',
        date: { $gte: start, $lte: end },
      });
      const monthTotal = monthRevs.reduce((s, r) => s + r.amount, 0);

      trendData.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthTotal,
      });
    }

    res.json({
      success: true,
      data: {
        thisMonth: thisMonthTotal,
        monthlyChange,
        today: todayTotal,
        thisWeek: weekTotal,
        pending: pendingTotal,
        refunded: refundedTotal,
        allTime: allTotal,
        avgPerConsultation,
        trendData,
        hasData: allRevs.length > 0,
      },
    });
  } catch (error) {
    console.error('getRevenueSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/doctor/revenue/transactions
   Paginated, server-side filtered & sorted transactions
   Query params:
     filter: all|today|week|month|year|last7|last30|last90|custom
     startDate, endDate: ISO strings (for filter=custom)
     search: string (matches patientName, consultationType)
     sort: date|amount|name  (default: date)
     order: asc|desc          (default: desc)
     page: number             (default: 1)
     limit: number            (default: 10)
   ───────────────────────────────────────────────────────────── */
const getTransactions = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const {
      filter = 'all',
      startDate,
      endDate,
      search = '',
      sort = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = { doctorId };

    // Date filter
    const dateFilter = buildDateFilter(filter, startDate, endDate);
    if (dateFilter) query.date = dateFilter;

    // Text search (case-insensitive on patientName & consultationType)
    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search.trim(), $options: 'i' } },
        { consultationType: { $regex: search.trim(), $options: 'i' } },
        { transactionId: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sort
    const sortMap = { date: 'date', amount: 'amount', name: 'patientName' };
    const sortField = sortMap[sort] || 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      DoctorRevenue.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DoctorRevenue.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + transactions.length < total,
      },
    });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/doctor/revenue/analytics
   Monthly breakdown by consultation type (last 6 months)
   ───────────────────────────────────────────────────────────── */
const getAnalytics = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const results = await DoctorRevenue.aggregate([
      {
        $match: {
          doctorId,
          status: 'Completed',
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$consultationType',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getRevenueSummary, getTransactions, getAnalytics };
