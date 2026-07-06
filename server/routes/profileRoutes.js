const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  removeProfilePhoto,
  changePassword,
  deleteAccount,
  getMedicalHistory,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  getReports,
  uploadReport,
  renameReport,
  deleteReport
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');

// Ensure upload directories exist
const profilesDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
const reportsDir = path.join(__dirname, '..', 'public', 'uploads', 'reports');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Multer Config for Profile Photo
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilesDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadProfile = multer({ 
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Images Only!');
    }
  }
});

// Multer Config for Medical Reports
const reportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, reportsDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'report-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadReportFile = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('PDF, JPEG, JPG and PNG only!');
    }
  }
});

// Routes
router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile)
  .delete(protect, deleteAccount);

router.route('/photo')
  .put(protect, uploadProfile.single('image'), updateProfilePhoto)
  .delete(protect, removeProfilePhoto);

router.put('/password', protect, changePassword);

router.route('/history')
  .get(protect, getMedicalHistory)
  .post(protect, addMedicalHistory);
  
router.route('/history/:id')
  .put(protect, updateMedicalHistory)
  .delete(protect, deleteMedicalHistory);

router.route('/reports')
  .get(protect, getReports)
  .post(protect, uploadReportFile.single('file'), uploadReport);

router.route('/reports/:id')
  .put(protect, renameReport) // We'll map PUT /api/profile/reports/:id to renameReport
  .delete(protect, deleteReport);

module.exports = router;
