const express = require('express');
const router = express.Router();
const {
  getApplicationsOverTime,
  getConversionFunnel,
  getTopSkills,
  getCompanyActivity,
  getPlacementRate,
} = require('../controllers/analyticsController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// All analytics routes require admin role
router.use(authenticate, authorizeRoles('admin'));

router.get('/applications-over-time', getApplicationsOverTime);
router.get('/conversion-funnel', getConversionFunnel);
router.get('/top-skills', getTopSkills);
router.get('/company-activity', getCompanyActivity);
router.get('/placement-rate', getPlacementRate);

module.exports = router;