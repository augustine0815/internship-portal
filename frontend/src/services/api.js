import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
export const getChatableUsers = () => API.get('/conversations/users');

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

// Student Profile
export const getMyProfile = () => API.get('/students/me');
export const updateMyProfile = (data) => API.put('/students/me', data);
export const uploadProfilePhoto = (formData) => API.post('/students/me/photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const uploadResume = (formData) => API.post('/upload/resume', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Logbook
export const createLogbook = (data) => API.post('/logbooks', data);
export const getMyLogbooks = () => API.get('/logbooks/my');
export const getLogbookById = (id) => API.get(`/logbooks/my/${id}`);
export const updateLogbook = (id, data) => API.put(`/logbooks/my/${id}`, data);
export const generateAIContent = (id) => API.post(`/logbooks/my/${id}/generate-ai`);
export const chatWithLogbookAI = (id, messages) => API.post(`/logbooks/my/${id}/chat`, { messages });
export const uploadLogbookPhoto = (id, formData) => API.post(`/logbooks/my/${id}/photo`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const submitLogbook = (id) => API.patch(`/logbooks/my/${id}/submit`);
export const getAllLogbooksAdmin = () => API.get('/logbooks/admin/all');
export const reviewLogbook = (id, data) => API.patch(`/logbooks/admin/${id}/review`, data);
// Coordinator
export const getCoordinatorOverview = () => API.get('/coordinator/overview');
export const getCoordinatorStudents = (params) => API.get('/coordinator/students', { params });
export const getStudentDetail = (id) => API.get(`/coordinator/students/${id}`);
export const getCoordinatorApplications = () => API.get('/coordinator/applications');
export const getCoordinatorLogbooks = () => API.get('/coordinator/logbooks');
export const reviewLogbookCoordinator = (id, data) => API.patch(`/coordinator/logbooks/${id}/review`, data);
export const gradeStudent = (data) => API.post('/coordinator/grades', data);
export const getAllGrades = () => API.get('/coordinator/grades');
export const getMyGrades = () => API.get('/students/me/grades');
export const getCoordinatorInternships = (params) => API.get('/coordinator/internships', { params });
export const approveInternshipCoordinator = (id, approved) => API.patch(`/coordinator/internships/${id}/approve`, { approved });