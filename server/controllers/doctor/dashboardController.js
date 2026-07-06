const Appointment = require('../../models/Appointment');
const DoctorRevenue = require('../../models/DoctorRevenue');

// @desc    Get dashboard statistics
// @route   GET /api/doctor/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    // Get today's start and end dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format date string for Appointment model which uses String dates (e.g. "2023-10-25")
    const todayStr = today.toISOString().split('T')[0];

    // Today's appointments
    const todaysAppointments = await Appointment.find({
      doctorId,
      appointmentDate: todayStr
    }).populate('userId', 'name image');

    // Total patients (distinct users from appointments)
    const allAppointments = await Appointment.find({ doctorId });
    const patientIds = new Set(allAppointments.map(app => app.userId.toString()));
    const totalPatients = patientIds.size;

    // Monthly revenue
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenues = await DoctorRevenue.find({
      doctorId,
      date: { $gte: currentMonthStart }
    });
    const monthlyRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);

    // Average rating (from Doctor model)
    const averageRating = req.doctor.rating || 0;

    // Weekly Consultation Chart Data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = await Appointment.countDocuments({ doctorId, appointmentDate: dStr });
      weeklyData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        consultations: count
      });
    }

    // Revenue Trend Chart Data (last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const monthRevs = await DoctorRevenue.find({
        doctorId,
        date: { $gte: start, $lte: end }
      });
      const monthTotal = monthRevs.reduce((sum, rev) => sum + rev.amount, 0);
      
      revenueData.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthTotal
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          todaysAppointments: todaysAppointments.length,
          totalPatients,
          monthlyRevenue,
          averageRating
        },
        todaysAppointmentsList: todaysAppointments, // Send detailed list for dashboard
        weeklyData,
        revenueData
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats
};
