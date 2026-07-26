const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createLogbook,
  getMyLogbooks,
  getLogbookById,
  updateLogbook,
  generateAIContent,
  chatWithAI,
  uploadLogbookPhoto,
  submitLogbook,
  getAllLogbooks,
  reviewLogbook,
} = require('../controllers/logbookController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Student routes
router.post('/', authenticate, authorizeRoles('student'), createLogbook);
router.get('/my', authenticate, authorizeRoles('student'), getMyLogbooks);
router.get('/my/:id', authenticate, authorizeRoles('student'), getLogbookById);
router.put('/my/:id', authenticate, authorizeRoles('student'), updateLogbook);
router.post('/my/:id/generate-ai', authenticate, authorizeRoles('student'), generateAIContent);
router.post('/my/:id/chat', authenticate, authorizeRoles('student'), chatWithAI);
router.post('/my/:id/photo', authenticate, authorizeRoles('student'), upload.single('photo'), uploadLogbookPhoto);
router.patch('/my/:id/submit', authenticate, authorizeRoles('student'), submitLogbook);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('admin'), getAllLogbooks);
router.patch('/admin/:id/review', authenticate, authorizeRoles('admin'), reviewLogbook);

module.exports = router;