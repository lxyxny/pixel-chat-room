const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  socket.on('joinRoom', ({ roomName, username }) => {
    socket.join(roomName);
    
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }
    rooms.get(roomName).add({ id: socket.id, username });

    socket.to(roomName).emit('systemMessage', {
      text: `✨ ${username} has entered the chat!`,
      timestamp: new Date().toLocaleTimeString()
    });

    const users = Array.from(rooms.get(roomName)).map(u => u.username);
    io.to(roomName).emit('updateUsers', users);
    
    socket.emit('joinedRoom', { roomName, users });
    console.log(`🚪 ${username} joined room: ${roomName}`);
  });

  socket.on('chatMessage', ({ roomName, username, message }) => {
    if (!message.trim()) return;
    
    io.to(roomName).emit('chatMessage', {
      username,
      message,
      timestamp: new Date().toLocaleTimeString(),
      isSelf: false
    });
    console.log(`💬 [${roomName}] ${username}: ${message}`);
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
          Array.from(users).map(u => u.username)
        );
        if (users.size === 0) rooms.delete(roomName);
        console.log(`🚪 ${user.username} disconnected from ${roomName}`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎮 Pixel Chat Server running on http://localhost:${PORT}`);
});