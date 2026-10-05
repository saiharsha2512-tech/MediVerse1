import { API_URL } from '../config/api';
import axios from 'axios';

const API_URL = `${API_URL}/api/profile';

// Get token helper
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getProfile = async () => {
  const response = await axios.get(PROFILE_API_URL, getAuthConfig());
  return response.data;
};

const updateProfile = async (userData) => {
  const response = await axios.put(PROFILE_API_URL, userData, getAuthConfig());
  return response.data;
};

const updateProfilePhoto = async (formData) => {
  const config = getAuthConfig();
  config.headers['Content-Type'] = 'multipart/form-data';
  const response = await axios.put(`${PROFILE_API_URL}/photo`, formData, config);
  return response.data;
};

const removeProfilePhoto = async () => {
  const response = await axios.delete(`${PROFILE_API_URL}/photo`, getAuthConfig());
  return response.data;
};

const changePassword = async (passwordData) => {
  const response = await axios.put(`${PROFILE_API_URL}/password`, passwordData, getAuthConfig());
  return response.data;
};

const deleteAccount = async (password) => {
  const response = await axios.delete(PROFILE_API_URL, {
    ...getAuthConfig(),
    data: { password }
  });
  return response.data;
};

const getMedicalHistory = async () => {
  const response = await axios.get(`${PROFILE_API_URL}/history`, getAuthConfig());
  return response.data;
};

const addMedicalHistory = async (historyData) => {
  const response = await axios.post(`${PROFILE_API_URL}/history`, historyData, getAuthConfig());
  return response.data;
};

const updateMedicalHistory = async (id, historyData) => {
  const response = await axios.put(`${API_URL}/history/${id}`, historyData, getAuthConfig());
  return response.data;
};

const deleteMedicalHistory = async (id) => {
  const response = await axios.delete(`${API_URL}/history/${id}`, getAuthConfig());
  return response.data;
};

const getReports = async () => {
  const response = await axios.get(`${PROFILE_API_URL}/reports`, getAuthConfig());
  return response.data;
};

const uploadReport = async (formData) => {
  const config = getAuthConfig();
  config.headers['Content-Type'] = 'multipart/form-data';
  const response = await axios.post(`${PROFILE_API_URL}/reports`, formData, config);
  return response.data;
};

const renameReport = async (id, reportName) => {
  const response = await axios.put(`${API_URL}/reports/${id}`, { reportName }, getAuthConfig());
  return response.data;
};

const deleteReport = async (id) => {
  const response = await axios.delete(`${API_URL}/reports/${id}`, getAuthConfig());
  return response.data;
};

export default {
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
};
