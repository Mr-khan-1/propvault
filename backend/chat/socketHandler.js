const { Server } = require('socket.io');
const Message = require('../models/Message');

let io;
const connectedUsers = new Map();

const initSocket = (server) => {
  const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://propvault-plum.vercel.app'
    ];
    if (process.env.FRONTEND_URL) {
      let cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
      if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
      if (!allowedOrigins.includes(cleanUrl)) allowedOrigins.push(cleanUrl);
    }

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    const userId = socket.handshake.query.userId;
    if (userId) {
      connectedUsers.set(userId, socket.id);
      io.emit('user_status', { userId, status: 'online' });
    }

    socket.on('send_message', async (data) => {
      try {
        const receiverSocketId = connectedUsers.get(data.receiverId);
        
        // Save message to DB
        const savedMessage = await Message.create({
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          fileUrl: data.fileUrl
        });

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', { ...data, timestamp: savedMessage.createdAt });
        }
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('typing', (data) => {
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { userId: data.userId });
      }
    });

    socket.on('stop_typing', (data) => {
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stop_typing', { userId: data.userId });
      }
    });

    socket.on('call_user', (data) => {
      const receiverSocketId = connectedUsers.get(data.userToCall);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming_call', {
          signal: data.signalData,
          callerId: data.from,
          type: data.type
        });
      }
    });

    socket.on('answer_call', (data) => {
      const callerSocketId = connectedUsers.get(data.to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_accepted', data.signal);
      }
    });
    
    socket.on('end_call', (data) => {
      const peerSocketId = connectedUsers.get(data.to);
      if (peerSocketId) {
        io.to(peerSocketId).emit('call_ended');
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      if (userId) {
        connectedUsers.delete(userId);
        io.emit('user_status', { userId, status: 'offline' });
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
