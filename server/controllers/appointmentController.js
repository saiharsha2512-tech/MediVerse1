const Appointment = require('../models/Appointment');

// @desc    Get appointments by user ID
// @route   GET /api/appointments/:userId
// @access  Public
const getUserAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.params.userId };
    
    // Optional filter by status
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Public
const bookAppointment = async (req, res) => {
  try {
    const { 
      userId, 
      doctorId, 
      doctorName, 
      specialty, 
      appointmentDate, 
      appointmentTime, 
      mode 
    } = req.body;

    if (!userId || !doctorId || !doctorName || !specialty || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const appointment = await Appointment.create({
      userId,
      doctorId,
      doctorName,
      specialty,
      appointmentDate,
      appointmentTime,
      mode: mode || 'Video',
      status: 'upcoming'
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error booking appointment' });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/reschedule/:id
// @access  Public
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Please provide new date and time' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        appointmentDate, 
        appointmentTime,
        status: 'upcoming' // If it was cancelled, rescheduling makes it upcoming again
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error rescheduling appointment' });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/cancel/:id
// @access  Public
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/complete/:id
// @access  Public
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error completing appointment' });
  }
};

module.exports = {
  getUserAppointments,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment
};
