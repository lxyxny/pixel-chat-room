const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ⚠️ MAX RECOMMENDED: 50MB (1GB will crash browsers/servers)
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

const io = new Server(server, {
  maxHttpBufferSize: MAX_IMAGE_SIZE,
  cors: {
    origin: "*", // Allow ngrok HTTPS connections
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Allow larger requests for ngrok
app.use((req, res, next) => {
  req.headers['content-length'] = req.headers['content-length'] || '0';
  next();
});

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
    rooms.get(roomName).add({ id: socket.id, username, isHost: isHost || false });

    socket.to(roomName).emit('systemMessage', {
      text: `✨ ${username} has entered the chat!`,
      timestamp: new Date().toLocaleTimeString()
    });

    const users = Array.from(rooms.get(roomName)).map(u => ({
      username: u.username,
      isHost: u.isHost
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
    if (!message?.trim() && !image) {
      console.log('⚠️ Empty message rejected');
      return;
    }
    
    if (image && !isValidImage(image)) {
      socket.emit('error', '⚠️ Invalid image format. Supported: PNG, JPG, GIF, WebP');
      console.log('⚠️ Invalid image from', username);
      return;
    }

    // Check image size (base64 is ~33% larger than original)
    if (image && image.length > MAX_IMAGE_SIZE * 1.33) {
      socket.emit('error', `⚠️ Image too large! Max ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
      console.log('⚠️ Image too large from', username);
      return;
    }

    const messageData = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      username,
      message: message?.trim() || '',
      image: image || null,
      replyTo: replyTo || null,
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id
    };

    socket.to(roomName).emit('chatMessage', messageData);
    
    console.log(`💬 [${roomName}] ${username}: ${message?.substring(0, 50) || ''}${image ? ' [IMAGE]' : ''}`);
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
          Array.from(users).map(u => ({ username: u.username, isHost: u.isHost }))
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
  console.log(`🌐 For online access, run: npm run ngrok`);
});