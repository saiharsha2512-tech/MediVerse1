import axios from 'axios';

const api = axios.create({
  baseURL: '/api/doctor'
});

// Request interceptor to add the doctor token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry or unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('doctorToken');
      // window.location.href = '/doctor/login'; // Optional: auto redirect on 401
    }
    return Promise.reject(error);
  }
);

export default api;
