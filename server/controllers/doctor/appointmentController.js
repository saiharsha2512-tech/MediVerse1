const DoctorAppointment = require('../../models/DoctorAppointment');
const DoctorChat = require('../../models/DoctorChat');
const DoctorRevenue = require('../../models/DoctorRevenue');

// @desc    Get all appointments for doctor
// @route   GET /api/doctor/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const appointments = await DoctorAppointment.find({ doctorId: req.doctor._id })
      .sort({ date: -1, time: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single appointment details
// @route   GET /api/doctor/appointments/:id
// @access  Private
const getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findOne({ _id: req.params.id, doctorId: req.doctor._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new appointment
// @route   POST /api/doctor/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { patientName, patientPhoto, problem, date, time, consultationType, notes } = req.body;
    const newAppointment = await DoctorAppointment.create({
      doctorId: req.doctor._id,
      patientName,
      patientPhoto: patientPhoto || '',
      problem,
      date,
      time,
      consultationType: consultationType || 'Video Consultation',
      status: 'Upcoming',
      notes: notes || ''
    });
    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update/Reschedule appointment
// @route   PUT /api/doctor/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findOne({ _id: req.params.id, doctorId: req.doctor._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      appointment[key] = updates[key];
    });

    await appointment.save();

    // Auto-create DoctorRevenue when appointment is marked Completed
    if (updates.status === 'Completed') {
      const existingRev = await DoctorRevenue.findOne({ appointmentId: appointment._id });
      if (!existingRev) {
        const fee = req.doctor.fee || 500;
        await DoctorRevenue.create({
          doctorId: req.doctor._id,
          appointmentId: appointment._id,
          patientId: appointment.patientId || null,
          patientName: appointment.patientName || 'Unknown Patient',
          consultationType: appointment.consultationType || 'Video Consultation',
          paymentMethod: updates.paymentMethod || 'Online',
          amount: updates.amount || fee,
          appointmentDate: appointment.date || '',
          appointmentTime: appointment.time || '',
          status: 'Completed',
        });
      }
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/doctor/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findOne({ _id: req.params.id, doctorId: req.doctor._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    await appointment.deleteOne();
    res.json({ success: true, message: 'Appointment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- CHAT ENDPOINTS ---

// @desc    Get chat messages for an appointment
// @route   GET /api/doctor/appointments/:id/chat
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findOne({ _id: req.params.id, doctorId: req.doctor._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    const messages = await DoctorChat.find({ appointmentId: req.params.id }).sort({ timestamp: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send a chat message
// @route   POST /api/doctor/appointments/:id/chat
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findOne({ _id: req.params.id, doctorId: req.doctor._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    const { message, sender } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const newMessage = await DoctorChat.create({
      appointmentId: appointment._id,
      sender: sender || 'Doctor',
      message
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAppointments,
  getAppointmentDetails,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getChatMessages,
  sendChatMessage
};
