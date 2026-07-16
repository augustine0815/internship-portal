const express = require('express');
const router = express.Router();
const {
  getOverview,
  getAllUsers,
  updateUserStatus,
  getAllInternships,
  updateInternshipApproval,
  verifyCompany,
} = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate, authorizeRoles('admin'));

router.get('/overview', getOverview);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/internships', getAllInternships);
router.patch('/internships/:id/approve', updateInternshipApproval);
router.patch('/companies/:userId/verify', verifyCompany);

module.exports = router;