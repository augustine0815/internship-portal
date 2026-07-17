import axios from 'axios';

const API = axios.create({
  baseURL: 'http://13.212.52.253:5000/api',
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Internships
export const getInternships = (params) => API.get('/internships', { params });
export const getInternshipById = (id) => API.get(`/internships/${id}`);
export const createInternship = (data) => API.post('/internships', data);
export const updateInternship = (id, data) => API.put(`/internships/${id}`, data);
export const updateInternshipStatus = (id, status) => API.patch(`/internships/${id}/status`, { status });
export const deleteInternship = (id) => API.delete(`/internships/${id}`);
export const getMyInternships = () => API.get('/internships/company/mine');

// Applications
export const applyToInternship = (id, data) => API.post(`/applications/internships/${id}/apply`, data);
export const getMyApplications = () => API.get('/applications/my');
export const getApplicants = (internshipId) => API.get(`/applications/internships/${internshipId}/applicants`);
export const updateApplicationStatus = (id, status) => API.patch(`/applications/${id}/status`, { status });
export const withdrawApplication = (id) => API.delete(`/applications/${id}/withdraw`);

// Offers
export const createOffer = (applicationId, data) => API.post(`/offers/applications/${applicationId}/offer`, data);
export const getMyOffers = () => API.get('/offers/my');
export const getCompanyOffers = () => API.get('/offers/company');
export const respondToOffer = (offerId, decision) => API.patch(`/offers/${offerId}/respond`, { decision });

// Notifications
export const getMyNotifications = () => API.get('/notifications/my');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');

// Chat
export const getConversations = () => API.get('/conversations');
export const startConversation = (data) => API.post('/conversations', data);
export const getMessages = (conversationId) => API.get(`/conversations/${conversationId}/messages`);

// Admin
export const getAdminOverview = () => API.get('/admin/overview');
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const updateUserStatus = (id, is_verified) => API.patch(`/admin/users/${id}/status`, { is_verified });
export const getAllInternshipsAdmin = (params) => API.get('/admin/internships', { params });
export const approveInternship = (id, approved) => API.patch(`/admin/internships/${id}/approve`, { approved });

// Analytics
export const getApplicationsOverTime = (days) => API.get('/analytics/applications-over-time', { params: { days } });
export const getConversionFunnel = () => API.get('/analytics/conversion-funnel');
export const getTopSkills = () => API.get('/analytics/top-skills');
export const getPlacementRate = () => API.get('/analytics/placement-rate');