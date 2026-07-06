import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';

const DoctorProtectedRoute = () => {
  const { doctor, token, loading, isAuthenticated } = useDoctorAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const storedToken = localStorage.getItem('doctorToken');
  const storedUser = localStorage.getItem('doctorUser');

  console.log('DoctorProtectedRoute State:', {
    contextDoctor: !!doctor,
    contextToken: !!token,
    storedToken: !!storedToken,
    storedUser: !!storedUser,
    isAuthenticated,
    path: location.pathname
  });

  if (!storedToken || !storedUser || !isAuthenticated) {
    console.log('DoctorProtectedRoute: Redirecting to login due to missing auth state');
    return <Navigate to="/doctor/login" replace />;
  }

  return <Outlet />;
};

export default DoctorProtectedRoute;
