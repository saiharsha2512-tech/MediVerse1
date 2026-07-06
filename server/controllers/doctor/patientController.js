const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const DoctorPrescription = require('../../models/DoctorPrescription');
const DoctorPatient = require('../../models/DoctorPatient');
const MedicalReport = require('../../models/MedicalReport');

/* ─────────────────────────────────────────────────────────────
   Helper: resolve display data for a DoctorPatient record.
   Identity fields come from the referenced User when available;
   otherwise fall back to the manually-entered fields.
   ───────────────────────────────────────────────────────────── */
function resolvePatient(dp) {
  const user = dp.patientId; // populated User doc or null
  return {
    _id: dp._id,
    patientUserId: user ? user._id : null,
    name: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : dp.name,
    age: user
      ? (user.dob
        ? Math.floor((Date.now() - new Date(user.dob)) / 3.15576e10)
        : dp.age)
      : dp.age,
    gender: user ? (user.gender || dp.gender) : dp.gender,
    phone: user ? (user.phoneNumber || dp.phone) : dp.phone,
    email: user ? (user.email || dp.email) : dp.email,
    profileImage:
      user ? (user.profileImage || dp.profileImage) : dp.profileImage,
    // Doctor-managed metadata
    conditions: dp.conditions,
    status: dp.status,
    lastVisit: dp.lastVisit,
    notes: dp.notes,
    createdAt: dp.createdAt,
    updatedAt: dp.updatedAt,
  };
}

/* ─────────────────────────────────────────────────────────────
   Upsert helper: ensure a DoctorPatient record exists for every
   unique patient found in the doctor's appointment history.
   Called lazily before listing, so records stay in sync.
   ───────────────────────────────────────────────────────────── */
async function syncPatientsFromAppointments(doctorId) {
  const appointments = await Appointment.find({ doctorId })
    .populate('userId', 'name firstName lastName email phoneNumber gender dob profileImage')
    .sort({ createdAt: -1 });

  const seen = new Map();
  for (const appt of appointments) {
    if (!appt.userId) continue;
    const uid = appt.userId._id.toString();
    if (!seen.has(uid)) {
      seen.set(uid, { user: appt.userId, lastVisit: new Date(appt.createdAt) });
    }
  }

  for (const [uid, { user, lastVisit }] of seen) {
    const existing = await DoctorPatient.findOne({
      doctorId,
      patientId: user._id,
    });

    if (!existing) {
      // Create initial record; name from User, no conditions yet
      await DoctorPatient.create({
        doctorId,
        patientId: user._id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        lastVisit,
      });
    } else if (!existing.lastVisit || lastVisit > existing.lastVisit) {
      // Keep lastVisit fresh
      await DoctorPatient.updateOne(
        { _id: existing._id },
        { $set: { lastVisit } }
      );
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/doctor/patients
   Query params: search, status, sort (name|age|lastVisit), order (asc|desc)
   ───────────────────────────────────────────────────────────── */
const getPatients = async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    // Sync from appointment history so new patients appear automatically
    await syncPatientsFromAppointments(doctorId);

    const { search = '', status = 'All', sort = 'lastVisit', order = 'desc' } = req.query;

    const query = { doctorId };
    if (status && status !== 'All') {
      query.status = status;
    }

    let dpList = await DoctorPatient.find(query).populate(
      'patientId',
      'name firstName lastName email phoneNumber gender dob profileImage'
    );

    // Map to display objects
    let patients = dpList.map(resolvePatient);

    // Client-side search (runs after populate merge)
    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.conditions || []).some((c) => c.toLowerCase().includes(q)) ||
          String(p.age).includes(q)
      );
    }

    // Sort
    patients.sort((a, b) => {
      let valA, valB;
      if (sort === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sort === 'age') {
        valA = a.age || 0;
        valB = b.age || 0;
      } else {
        // lastVisit
        valA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
        valB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

    res.json({ success: true, data: patients });
  } catch (error) {
    console.error('getPatients error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/doctor/patients/:id
   id = DoctorPatient._id
   ───────────────────────────────────────────────────────────── */
const getPatientDetails = async (req, res) => {
  try {
    const dp = await DoctorPatient.findOne({
      _id: req.params.id,
      doctorId: req.doctor._id,
    }).populate(
      'patientId',
      'name firstName lastName email phoneNumber gender dob profileImage bloodGroup address city'
    );

    if (!dp) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patient = resolvePatient(dp);

    // Appointments between this doctor and this patient (if linked)
    let appointments = [];
    if (dp.patientId) {
      appointments = await Appointment.find({
        userId: dp.patientId._id,
        doctorId: req.doctor._id,
      }).sort({ createdAt: -1 });
    }

    // Prescriptions written by this doctor for this patient
    let prescriptions = [];
    if (dp.patientId) {
      prescriptions = await DoctorPrescription.find({
        patientId: dp.patientId._id,
        doctorId: req.doctor._id,
      }).sort({ date: -1 });
    }

    // Medical reports (read-only from patient portal; never modified)
    let reports = [];
    try {
      if (dp.patientId && MedicalReport) {
        reports = await MedicalReport.find({ userId: dp.patientId._id }).sort({ createdAt: -1 });
      }
    } catch (_) {
      // MedicalReport model may not exist in all environments
    }

    res.json({
      success: true,
      data: { patient, appointments, prescriptions, reports, notes: dp.notes },
    });
  } catch (error) {
    console.error('getPatientDetails error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/doctor/patients
   Creates a new manually-added patient (no portal account required)
   ───────────────────────────────────────────────────────────── */
const createPatient = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const { name, age, gender, phone, email, conditions, status, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Patient name is required' });
    }

    const dp = await DoctorPatient.create({
      doctorId,
      patientId: null,
      name,
      age: age || null,
      gender: gender || '',
      phone: phone || '',
      email: email || '',
      conditions: conditions || [],
      status: status || 'Stable',
      notes: notes || '',
      lastVisit: new Date(),
    });

    res.status(201).json({ success: true, data: resolvePatient(dp) });
  } catch (error) {
    console.error('createPatient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/doctor/patients/:id
   Updates doctor-managed metadata only (conditions, status, notes, lastVisit)
   Does NOT modify User collection
   ───────────────────────────────────────────────────────────── */
const updatePatient = async (req, res) => {
  try {
    const { conditions, status, notes, lastVisit, age, gender, phone, email } = req.body;

    const updateFields = {};
    if (conditions !== undefined) updateFields.conditions = conditions;
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;
    if (lastVisit !== undefined) updateFields.lastVisit = lastVisit;
    // Allow updating fallback identity fields for manually-added patients
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;

    const dp = await DoctorPatient.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      { $set: updateFields },
      { new: true }
    ).populate(
      'patientId',
      'name firstName lastName email phoneNumber gender dob profileImage'
    );

    if (!dp) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: resolvePatient(dp) });
  } catch (error) {
    console.error('updatePatient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/doctor/patients/:id
   Removes the DoctorPatient metadata record only.
   Never touches the User collection.
   ───────────────────────────────────────────────────────────── */
const deletePatient = async (req, res) => {
  try {
    const dp = await DoctorPatient.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.doctor._id,
    });

    if (!dp) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient removed from your list' });
  } catch (error) {
    console.error('deletePatient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPatients,
  getPatientDetails,
  createPatient,
  updatePatient,
  deletePatient,
};
