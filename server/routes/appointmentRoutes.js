const express = require('express');
const { 
  getUserAppointments, 
  bookAppointment, 
  rescheduleAppointment, 
  cancelAppointment, 
  completeAppointment 
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/:userId', getUserAppointments);
router.post('/book', bookAppointment);
router.put('/reschedule/:id', rescheduleAppointment);
router.put('/cancel/:id', cancelAppointment);
router.put('/complete/:id', completeAppointment);

module.exports = router;
