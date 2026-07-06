require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const healthRoutes = require('./routes/healthRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const profileRoutes = require('./routes/profileRoutes');
// Doctor Portal
const doctorAuthRoutes = require('./routes/doctor/authRoutes');
const doctorApiRoutes = require('./routes/doctor/apiRoutes');
// Delivery Portal
const deliveryRoutes = require('./routes/delivery/deliveryRoutes');
// Connect to database
connectDB().then(() => {
  // Run seed script if collection is empty
  const seedMedicines = require('./seedMedicines');
  seedMedicines();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (like uploaded profile pics and reports)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);

// Doctor Portal Routes
app.use('/api/doctor', doctorAuthRoutes);
app.use('/api/doctor', doctorApiRoutes);

// Delivery Portal Routes
app.use('/api/delivery', deliveryRoutes);
app.get('/', (req, res) => {  res.send('MediVerse API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
