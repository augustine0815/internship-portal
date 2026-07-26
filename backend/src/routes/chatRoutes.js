const express = require('express');
const router = express.Router();
const {
  startConversation,
  getMyConversations,
  getMessages,
  getChatableUsers,
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, startConversation);
router.get('/', authenticate, getMyConversations);
router.get('/users', authenticate, getChatableUsers);
router.get('/:id/messages', authenticate, getMessages);

module.exports = router;