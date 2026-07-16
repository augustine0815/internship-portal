const express = require('express');
const router = express.Router();
const {
  startConversation,
  getMyConversations,
  getMessages,
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, startConversation);
router.get('/', authenticate, getMyConversations);
router.get('/:id/messages', authenticate, getMessages);

module.exports = router;