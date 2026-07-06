const DoctorPrescription = require('../../models/DoctorPrescription');
const User = require('../../models/User'); // to fetch patient name if needed

// @desc    Get all prescriptions for doctor
// @route   GET /api/doctor/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await DoctorPrescription.find({ doctorId: req.doctor._id })
      .populate('patientId', 'name email phone')
      .sort({ date: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new prescription
// @route   POST /api/doctor/prescriptions
// @access  Private
const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, notes } = req.body;
    
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const prescription = await DoctorPrescription.create({
      doctorId: req.doctor._id,
      patientId,
      appointmentId,
      patientName: patient.name,
      medicines,
      notes
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single prescription
// @route   GET /api/doctor/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await DoctorPrescription.findOne({ _id: req.params.id, doctorId: req.doctor._id })
      .populate('patientId', 'name age gender phone');
      
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    
    res.json({ success: true, data: prescription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/doctor/prescriptions/:id
// @access  Private
const deletePrescription = async (req, res) => {
  try {
    const prescription = await DoctorPrescription.findOneAndDelete({ _id: req.params.id, doctorId: req.doctor._id });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    
    res.json({ success: true, message: 'Prescription removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPrescriptions,
  createPrescription,
  getPrescriptionById,
  deletePrescription
};
