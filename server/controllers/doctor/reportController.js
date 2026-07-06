const MedicalReport = require('../../models/MedicalReport'); // Assuming this exists

// @desc    Get reports for a patient
// @route   GET /api/doctor/patients/:id/reports
// @access  Private
const getPatientReports = async (req, res) => {
  try {
    if (!MedicalReport) {
      return res.status(501).json({ success: false, message: 'MedicalReport model not implemented' });
    }
    const reports = await MedicalReport.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add note to a report
// @route   PUT /api/doctor/reports/:id/note
// @access  Private
const addReportNote = async (req, res) => {
  try {
    if (!MedicalReport) {
      return res.status(501).json({ success: false, message: 'MedicalReport model not implemented' });
    }
    
    const { note, approved } = req.body;
    const update = {};
    if (note !== undefined) update.doctorNote = note;
    if (approved !== undefined) update.approved = approved;

    const report = await MedicalReport.findByIdAndUpdate(req.params.id, update, { new: true });
    
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPatientReports,
  addReportNote
};
