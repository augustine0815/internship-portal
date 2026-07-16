const express = require('express');
const router = express.Router();
const {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
  getMyInternships,
} = require('../controllers/internshipController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Public
router.get('/', getAllInternships);
router.get('/:id', getInternshipById);

// Company only
router.post('/', authenticate, authorizeRoles('company'), createInternship);
router.get('/company/mine', authenticate, authorizeRoles('company'), getMyInternships);
router.put('/:id', authenticate, authorizeRoles('company'), updateInternship);
router.patch('/:id/status', authenticate, authorizeRoles('company'), updateInternshipStatus);
router.delete('/:id', authenticate, authorizeRoles('company'), deleteInternship);

module.exports = router;