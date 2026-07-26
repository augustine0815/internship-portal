const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getAllStudents,
  getStudentDetail,
  getAllLogbooks,
  reviewLogbook,
  gradeStudent,
  getAllGrades,
  getAllInternships,
  updateInternshipApproval,
  getAllApplications,
} = require('../controllers/coordinatorController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate, authorizeRoles('coordinator'));

router.get('/overview', getDashboardOverview);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetail);
router.get('/applications', getAllApplications);
router.get('/logbooks', getAllLogbooks);
router.patch('/logbooks/:id/review', reviewLogbook);
router.post('/grades', gradeStudent);
router.get('/grades', getAllGrades);
router.get('/internships', getAllInternships);
router.patch('/internships/:id/approve', updateInternshipApproval);

module.exports = router;