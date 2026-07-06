const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Doctor = require('../../models/Doctor');

// Generate JWT
const generateToken = (id) => {
  const secret = process.env.DOCTOR_JWT_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id, role: 'doctor' }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Register new doctor
// @route   POST /api/doctor/register
// @access  Public
const registerDoctor = async (req, res) => {
  try {
    const {
      name, email, phone, password, medicalRegistrationNumber, specialty,
      qualification, experience, hospital, fee, languagesKnown, city, state,
      availableDays, availableTime, bio, image, location
    } = req.body;

    // Check if doctor exists (by email or phone)
    const doctorExists = await Doctor.findOne({ $or: [{ email }, { phone }] });
    if (doctorExists) {
      return res.status(400).json({ success: false, message: 'Doctor already exists with this email or phone' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      password: hashedPassword,
      medicalRegistrationNumber,
      specialty,
      qualification,
      experience,
      hospital,
      location: location || `${city}, ${state}`, // Fallback for Patient portal compatibility
      fee,
      languagesKnown: languagesKnown || [],
      city,
      state,
      availableDays: availableDays || [],
      availableTime: availableTime || {},
      bio: bio || '',
      image: image || ''
    });

    if (doctor) {
      res.status(201).json({
        success: true,
        doctor: {
          _id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
        },
        token: generateToken(doctor._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid doctor data' });
    }
  } catch (error) {
    console.error('Doctor Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Authenticate a doctor
// @route   POST /api/doctor/login
// @access  Public
const loginDoctor = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check for doctor phone, including password field which is select: false
    const doctor = await Doctor.findOne({ phone }).select('+password');

    if (doctor && (await bcrypt.compare(password, doctor.password))) {
      res.json({
        success: true,
        doctor: {
          _id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
        },
        token: generateToken(doctor._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }
  } catch (error) {
    console.error('Doctor Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Logout doctor
// @route   POST /api/doctor/logout
// @access  Private
const logoutDoctor = async (req, res) => {
  // Since JWT is stateless, logout is typically handled on the client by removing the token.
  // We can just send a success response.
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  registerDoctor,
  loginDoctor,
  logoutDoctor
};
