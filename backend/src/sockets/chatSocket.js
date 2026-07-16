const jwt = require('jsonwebtoken');
const { Message, Conversation, StudentProfile, CompanyProfile } = require('../models');

const initializeChatSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: user ${socket.user.id} (${socket.user.role})`);

    // Join personal room so we can send direct messages
    socket.join(`user_${socket.user.id}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { conversation_id, body } = data;

        // Verify conversation exists
        const conversation = await Conversation.findByPk(conversation_id);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Save message to DB
        const message = await Message.create({
          conversation_id,
          sender_id: socket.user.id,
          body,
        });

        // Update conversation updated_at
        await conversation.update({ updated_at: new Date() });

        // Broadcast message to everyone in the conversation room
        io.to(`conversation_${conversation_id}`).emit('message_received', {
          id: message.id,
          conversation_id,
          sender_id: socket.user.id,
          sender_role: socket.user.role,
          body: message.body,
          sent_at: message.sent_at,
          is_read: false,
        });

        console.log(`Message sent in conversation ${conversation_id}`);
      } catch (error) {
        console.error('send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`conversation_${data.conversation_id}`).emit('user_typing', {
        user_id: socket.user.id,
        role: socket.user.role,
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`conversation_${data.conversation_id}`).emit('user_stop_typing', {
        user_id: socket.user.id,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: user ${socket.user.id}`);
    });
  });
};

module.exports = initializeChatSocket;