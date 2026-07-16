const express = require('express');
const router = express.Router();
const {
  createOffer,
  getMyOffers,
  getCompanyOffers,
  respondToOffer,
} = require('../controllers/offerController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Company
router.post('/applications/:applicationId/offer', authenticate, authorizeRoles('company'), createOffer);
router.get('/company', authenticate, authorizeRoles('company'), getCompanyOffers);

// Student
router.get('/my', authenticate, authorizeRoles('student'), getMyOffers);
router.patch('/:offerId/respond', authenticate, authorizeRoles('student'), respondToOffer);

module.exports = router;