import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/dashboard/Layout';
import Home from './components/dashboard/Home';
import Doctors from './components/dashboard/Doctors';
import Bookings from './components/dashboard/Bookings';
import Medicines from './components/dashboard/Medicines';
import Cart from './components/dashboard/Cart';
import Checkout from './components/dashboard/Checkout';
import OrderSuccess from './components/dashboard/OrderSuccess';
import AICheck from './components/dashboard/AICheck';
import Profile from './components/dashboard/Profile';
import PrivateRoute from './components/PrivateRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Doctor Portal Imports
import { DoctorAuthProvider } from './context/doctor/DoctorAuthContext';
import DoctorLogin from './pages/doctor/Login';
import DoctorRegister from './pages/doctor/Register';
import DoctorLayout from './components/doctor/DoctorLayout';
import DoctorProtectedRoute from './components/doctor/DoctorProtectedRoute';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import DoctorProfile from './pages/doctor/Profile';
import DoctorSettings from './pages/doctor/Settings';
import DoctorRevenue from './pages/doctor/Revenue';
import DoctorVideoCall from './pages/doctor/VideoCall';
import AppointmentDetail from './pages/doctor/AppointmentDetail';

// Delivery Portal Imports
import { DeliveryAuthProvider } from './context/delivery/DeliveryAuthContext';
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryRegister from './pages/delivery/DeliveryRegister';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryProtectedRoute from './components/delivery/DeliveryProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DoctorAuthProvider>
        <DeliveryAuthProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <Toaster position="bottom-center" />
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Dashboard Routes with Bottom Navigation */}
                  <Route path="/dashboard" element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="doctors" element={<Doctors />} />
                      <Route path="bookings" element={<Bookings />} />
                      <Route path="medicines" element={<Medicines />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="order-success" element={<OrderSuccess />} />
                      <Route path="ai-check" element={<AICheck />} />
                      <Route path="profile" element={<Profile />} />
                    </Route>
                  </Route>
                  {/* Doctor Portal Routes */}
                  <Route path="/doctor/login" element={<DoctorLogin />} />
                  <Route path="/doctor/register" element={<DoctorRegister />} />
                  
                  <Route path="/doctor" element={<DoctorProtectedRoute />}>
                    <Route element={<DoctorLayout />}>
                      <Route path="dashboard" element={<DoctorDashboard />} />
                      <Route path="appointments" element={<DoctorAppointments />} />
                      <Route path="patients" element={<DoctorPatients />} />
                      <Route path="prescriptions" element={<DoctorPrescriptions />} />
                      <Route path="profile" element={<DoctorProfile />} />
                      <Route path="settings" element={<DoctorSettings />} />
                      <Route path="revenue" element={<DoctorRevenue />} />
                    </Route>
                    <Route path="video-call/:id" element={<DoctorVideoCall />} />
                    <Route path="appointments/:id/detail" element={<AppointmentDetail />} />
                  </Route>

                  {/* Delivery Portal Routes */}
                  <Route path="/delivery/login" element={<DeliveryLogin />} />
                  <Route path="/delivery/register" element={<DeliveryRegister />} />
                  <Route path="/delivery" element={<DeliveryProtectedRoute />}>
                    <Route path="dashboard" element={<DeliveryDashboard />} />
                  </Route>

                </Routes> 
              </div>
            </Router>
          </CartProvider>
        </DeliveryAuthProvider>
      </DoctorAuthProvider>
    </AuthProvider>
  );
}

export default App;
