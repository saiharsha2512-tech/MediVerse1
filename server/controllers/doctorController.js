const Doctor = require('../models/Doctor');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

// @desc    Get a specific doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching doctor' });
  }
};

// @desc    Search doctors by name or specialty
// @route   GET /api/doctors/search
// @access  Public
const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { specialty: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error during search' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  searchDoctors
};
