const express = require('express');
const router = express.Router();
const {
  applyToInternship,
  getMyApplications,
  getApplicantsForInternship,
  updateApplicationStatus,
  withdrawApplication,
} = require('../controllers/applicationController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Student
router.post('/internships/:id/apply', authenticate, authorizeRoles('student'), applyToInternship);
router.get('/my', authenticate, authorizeRoles('student'), getMyApplications);
router.delete('/:id/withdraw', authenticate, authorizeRoles('student'), withdrawApplication);

// Company
router.get('/internships/:id/applicants', authenticate, authorizeRoles('company'), getApplicantsForInternship);
router.patch('/:id/status', authenticate, authorizeRoles('company'), updateApplicationStatus);

module.exports = router;