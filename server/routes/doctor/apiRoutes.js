const express = require('express');
const router = express.Router();

const { doctorProtect } = require('../../middleware/doctorAuth');
const { getDashboardStats } = require('../../controllers/doctor/dashboardController');
const { getAppointments, getAppointmentDetails, createAppointment, updateAppointment, deleteAppointment, getChatMessages, sendChatMessage } = require('../../controllers/doctor/appointmentController');
const { getPatients, getPatientDetails, createPatient, updatePatient, deletePatient } = require('../../controllers/doctor/patientController');
const { getPrescriptions, createPrescription, getPrescriptionById, deletePrescription } = require('../../controllers/doctor/prescriptionController');
const { getProfile, updateProfile } = require('../../controllers/doctor/profileController');
const { getNotifications, markAsRead } = require('../../controllers/doctor/notificationController');
const { updateSettings, changePassword } = require('../../controllers/doctor/settingsController');
const { getPatientReports, addReportNote } = require('../../controllers/doctor/reportController');
const { getRevenueSummary, getTransactions, getAnalytics } = require('../../controllers/doctor/revenueController');

// All routes here are protected
router.use(doctorProtect);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Appointments
router.route('/appointments')
  .get(getAppointments)
  .post(createAppointment);

router.route('/appointments/:id')
  .get(getAppointmentDetails)
  .put(updateAppointment)
  .delete(deleteAppointment);

// Chat
router.route('/appointments/:id/chat')
  .get(getChatMessages)
  .post(sendChatMessage);


// Patients – Doctor Portal only (never touches Patient Portal)
router.route('/patients')
  .get(getPatients)
  .post(createPatient);

router.route('/patients/:id')
  .get(getPatientDetails)
  .put(updatePatient)
  .delete(deletePatient);

// Prescriptions
router.route('/prescriptions')
  .get(getPrescriptions)
  .post(createPrescription);
router.route('/prescriptions/:id')
  .get(getPrescriptionById)
  .delete(deletePrescription);

// Reports
router.get('/patients/:id/reports', getPatientReports);
router.put('/reports/:id/note', addReportNote);

// Profile
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markAsRead);

// Settings & Password
router.put('/settings', updateSettings);
router.put('/password', changePassword);

// Revenue – Doctor Portal only
router.get('/revenue', getRevenueSummary);
router.get('/revenue/transactions', getTransactions);
router.get('/revenue/analytics', getAnalytics);

module.exports = router;
