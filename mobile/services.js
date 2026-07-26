import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your EC2 IP for production
// or localhost for local development
const BASE_URL = 'http://13.212.52.253:5000/api';


const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Internships
export const getInternships = (params) => API.get('/internships', { params });
export const applyToInternship = (id, data) => API.post(`/applications/internships/${id}/apply`, data);

// Applications
export const getMyApplications = () => API.get('/applications/my');

// Offers
export const getMyOffers = () => API.get('/offers/my');
export const respondToOffer = (id, decision) => API.patch(`/offers/${id}/respond`, { decision });

// Profile
export const getMyProfile = () => API.get('/students/me');
export const updateMyProfile = (data) => API.put('/students/me', data);

// Notifications
export const getMyNotifications = () => API.get('/notifications/my');
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');