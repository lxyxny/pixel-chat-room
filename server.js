const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

const io = new Server(server, {
  maxHttpBufferSize: MAX_IMAGE_SIZE,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const rooms = new Map();

function isValidImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  const validTypes = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
  return validTypes.some(type => 
    dataUrl.includes(`image/${type}`) || dataUrl.includes(`image/${type.toUpperCase()}`)
  );
}

io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  socket.on('joinRoom', ({ roomName, username, isHost }) => {
    socket.join(roomName);
    
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }
    
    const existingUser = Array.from(rooms.get(roomName)).find(u => u.id === socket.id);
    if (!existingUser) {
      rooms.get(roomName).add({ id: socket.id, username, isHost: isHost || false });
    }

    socket.to(roomName).emit('systemMessage', {
      text: `✨ ${username} has entered the chat!`,
      timestamp: new Date().toLocaleTimeString()
    });

    const users = Array.from(rooms.get(roomName)).map(u => ({
      username: u.username,
      isHost: u.isHost,
      id: u.id
    }));
    
    io.to(roomName).emit('updateUsers', users);
    
    socket.emit('joinedRoom', { 
      roomName, 
      users, 
      socketId: socket.id,
      isHost: isHost || false
    });
    
    console.log(`🚪 ${username} joined room: ${roomName}${isHost ? ' (HOST)' : ''}`);
  });

  socket.on('chatMessage', ({ roomName, username, message, image, replyTo }) => {
    if (!message?.trim() && !image) return;
    
    if (image && !isValidImage(image)) {
      socket.emit('error', '⚠️ Invalid image format. Supported: PNG, JPG, GIF, WebP');
      return;
    }

    if (image && image.length > MAX_IMAGE_SIZE * 1.33) {
      socket.emit('error', `⚠️ Image too large! Max ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
      return;
    }

    const messageData = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      username,
      message: message?.trim() || '',
      image: image || null,
      replyTo: replyTo || null,
      reactions: {},
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id
    };

    socket.to(roomName).emit('chatMessage', messageData);
    
    console.log(`💬 [${roomName}] ${username}: ${message?.substring(0, 50) || ''}${image ? ' [IMAGE]' : ''}`);
  });

  socket.on('addReaction', ({ roomName, messageId, emoji, username }) => {
    const room = rooms.get(roomName);
    if (!room) return;
    
    io.to(roomName).emit('reactionAdded', {
      messageId,
      emoji,
      username,
      socketId: socket.id
    });
    
    console.log(`😊 ${username} reacted ${emoji} to message ${messageId}`);
  });

  socket.on('removeReaction', ({ roomName, messageId, emoji, username }) => {
    io.to(roomName).emit('reactionRemoved', {
      messageId,
      emoji,
      username,
      socketId: socket.id
    });
  });

  socket.on('typing', ({ roomName, username, isTyping }) => {
    socket.to(roomName).emit('userTyping', { username, isTyping });
  });

  socket.on('disconnect', () => {
    for (const [roomName, users] of rooms) {
      const user = Array.from(users).find(u => u.id === socket.id);
      if (user) {
        users.delete(user);
        socket.to(roomName).emit('systemMessage', {
          text: `💨 ${user.username} has left the chat`,
          timestamp: new Date().toLocaleTimeString()
        });
        io.to(roomName).emit('updateUsers', 
          Array.from(users).map(u => ({ username: u.username, isHost: u.isHost, id: u.id }))
        );
        if (users.size === 0) rooms.delete(roomName);
        console.log(`🚪 ${user.username} disconnected from ${roomName}`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Pixel Chat Server running on http://localhost:${PORT}`);
  console.log(`📸 Image upload limit: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  console.log(`🌐 Deployed to Render for 24/7 hosting!`);
});