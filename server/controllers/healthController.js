const HealthRecord = require('../models/HealthRecord');

// @desc    Get health records for a user
// @route   GET /api/health/:userId
// @access  Public
const getHealthRecords = async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ userId: req.params.userId });
    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ message: 'Health records not found for this user' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching health records' });
  }
};

module.exports = {
  getHealthRecords
};
