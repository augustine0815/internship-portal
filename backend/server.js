const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { sequelize } = require('./src/models');
const initializeChatSocket = require('./src/sockets/chatSocket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synced');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize chat socket
    initializeChatSocket(io);

    // Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Socket.io ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();