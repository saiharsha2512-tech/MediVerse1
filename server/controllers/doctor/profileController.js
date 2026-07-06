const Doctor = require('../../models/Doctor');

/* ─────────────────────────────────────────────────────────────
   GET /api/doctor/profile
   Returns full doctor profile (password excluded)
   ───────────────────────────────────────────────────────────── */
const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor._id).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/doctor/profile
   Editable: name, phone, qualification, experience, hospital,
             fee, city, state, image, bio, languagesKnown
   Read-only (ignored): email, medicalRegistrationNumber, specialty
   ───────────────────────────────────────────────────────────── */
const updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Only allow safe fields — email, specialty, medicalRegistrationNumber are read-only
    const editableFields = [
      'name', 'phone', 'qualification', 'experience',
      'hospital', 'fee', 'city', 'state', 'image', 'bio', 'languagesKnown',
    ];

    editableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        doctor[field] = req.body[field];
      }
    });

    const updated = await doctor.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        specialty: updated.specialty,
        qualification: updated.qualification,
        experience: updated.experience,
        hospital: updated.hospital,
        fee: updated.fee,
        city: updated.city,
        state: updated.state,
        image: updated.image,
        bio: updated.bio,
        medicalRegistrationNumber: updated.medicalRegistrationNumber,
        languagesKnown: updated.languagesKnown,
        availableDays: updated.availableDays,
        availableTime: updated.availableTime,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };
