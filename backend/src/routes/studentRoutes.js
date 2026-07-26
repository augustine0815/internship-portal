const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  getStudentProfile,
  getMyGrades,
} = require('../controllers/studentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/me', authenticate, authorizeRoles('student'), getMyProfile);
router.put('/me', authenticate, authorizeRoles('student'), updateMyProfile);
router.post('/me/photo', authenticate, authorizeRoles('student'), upload.single('photo'), uploadProfilePhoto);
router.get('/me/grades', authenticate, authorizeRoles('student'), getMyGrades);
router.get('/:id', authenticate, getStudentProfile);

module.exports = router;