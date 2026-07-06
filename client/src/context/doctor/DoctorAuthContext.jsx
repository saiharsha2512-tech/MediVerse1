import { createContext, useState, useEffect, useContext } from 'react';

const DoctorAuthContext = createContext();

export const DoctorAuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(() => {
    const saved = localStorage.getItem('doctorUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('doctorToken'));
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!token && !!doctor;

  useEffect(() => {
    const fetchDoctor = async () => {
      if (token) {
        try {
          const response = await fetch('/api/doctor/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setDoctor(data.data);
            localStorage.setItem('doctorUser', JSON.stringify(data.data));
          } else {
            setDoctor(null);
            setToken(null);
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorUser');
          }
        } catch (error) {
          console.error("Error fetching doctor profile", error);
          // Don't log out completely on network error, but keep doctor from localStorage
        }
      }
      setLoading(false);
    };

    fetchDoctor();
  }, [token]);

  const loginDoctor = (userData, authToken) => {
    console.log('DoctorAuthContext: Setting doctor and token in state and localStorage', userData, authToken);
    setDoctor(userData);
    setToken(authToken);
    localStorage.setItem('doctorUser', JSON.stringify(userData));
    localStorage.setItem('doctorToken', authToken);
  };

  const logoutDoctor = () => {
    setDoctor(null);
    setToken(null);
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorUser');
  };

  return (
    <DoctorAuthContext.Provider value={{ 
      doctor, 
      token, 
      doctorToken: token,
      loading, 
      isAuthenticated, 
      loginDoctor, 
      logoutDoctor, 
      login: loginDoctor,
      logout: logoutDoctor,
      setDoctor 
    }}>
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = () => useContext(DoctorAuthContext);
