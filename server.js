const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
const threads = new Map();
const privateMessages = new Map();
const users = new Map();

function isValidImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  const validTypes = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
  return validTypes.some(type => 
    dataUrl.includes(`image/${type}`) || dataUrl.includes(`image/${type.toUpperCase()}`)
  );
}

io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);
  
  users.set(socket.id, { socketId: socket.id });

  socket.on('joinRoom', ({ roomName, username, isHost }) => {
    socket.join(roomName);
    
    const userInfo = {
      id: socket.id,
      username,
      isHost: isHost || false,
      room: roomName,
      status: 'online'
    };
    users.set(socket.id, userInfo);
    
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }
    rooms.get(roomName).add(userInfo);

    socket.to(roomName).emit('systemMessage', {
      text: `✨ ${username} has entered the chat!`,
      timestamp: new Date().toLocaleTimeString()
    });

    const roomUsers = Array.from(rooms.get(roomName)).map(u => ({
      username: u.username,
      isHost: u.isHost,
      id: u.id,
      status: u.status
    }));
    
    io.to(roomName).emit('updateUsers', roomUsers);
    socket.emit('updateRoomList', Array.from(rooms.keys()));
    
    socket.emit('joinedRoom', { 
      roomName, 
      users: roomUsers, 
      socketId: socket.id,
      isHost: isHost || false
    });
    
    console.log(`🚪 ${username} joined room: ${roomName}`);
  });

  socket.on('chatMessage', ({ roomName, username, message, image, replyTo }) => {
    if (!message?.trim() && !image) return;
    
    if (image && !isValidImage(image)) {
      socket.emit('error', '⚠️ Invalid image format');
      return;
    }

    const messageData = {
      id: uuidv4(),
      username,
      message: message?.trim() || '',
      image: image || null,
      replyTo: replyTo || null,
      reactions: {},
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id
    };

    socket.to(roomName).emit('chatMessage', messageData);
    console.log(`💬 [${roomName}] ${username}: ${message?.substring(0, 50) || ''}`);
  });

  socket.on('createThread', ({ roomName, parentMessageId, threadName, username }) => {
    const threadId = uuidv4();
    const thread = {
      id: threadId,
      room: roomName,
      parentMessageId,
      name: threadName || `Thread ${threads.size + 1}`,
      messages: [],
      participants: new Set([socket.id]),
      createdAt: new Date().toISOString()
    };
    
    threads.set(threadId, thread);
    socket.join(`thread-${threadId}`);
    
    io.to(roomName).emit('threadCreated', {
      threadId,
      threadName: thread.name,
      parentMessageId,
      createdBy: username
    });
    
    console.log(`🧵 Thread created: ${thread.name}`);
  });

  socket.on('threadMessage', ({ threadId, username, message, image }) => {
    const thread = threads.get(threadId);
    if (!thread) return;
    
    const messageData = {
      id: uuidv4(),
      username,
      message: message?.trim() || '',
      image: image || null,
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id,
      threadId: threadId
    };
    
    thread.messages.push(messageData);
    io.to(`thread-${threadId}`).emit('threadMessage', messageData);
    console.log(`🧵 Thread message in ${threadId}`);
  });

  socket.on('joinThread', ({ threadId }) => {
    const thread = threads.get(threadId);
    if (thread) {
      thread.participants.add(socket.id);
      socket.join(`thread-${threadId}`);
      socket.emit('threadMessages', { threadId, messages: thread.messages });
    }
  });

  socket.on('leaveThread', ({ threadId }) => {
    const thread = threads.get(threadId);
    if (thread) {
      thread.participants.delete(socket.id);
      socket.leave(`thread-${threadId}`);
    }
  });

  socket.on('privateMessage', ({ toUserId, fromUsername, message, image }) => {
    const dmId = [socket.id, toUserId].sort().join('-');
    
    const messageData = {
      id: uuidv4(),
      from: socket.id,
      fromUsername,
      to: toUserId,
      message: message?.trim() || '',
      image: image || null,
      timestamp: new Date().toLocaleTimeString()
    };
    
    if (!privateMessages.has(dmId)) {
      privateMessages.set(dmId, []);
    }
    privateMessages.get(dmId).push(messageData);
    
    io.to(toUserId).emit('privateMessage', messageData);
    socket.emit('privateMessage', messageData);
    
    console.log(`📩 DM from ${fromUsername} to ${toUserId}`);
  });

  socket.on('getDMHistory', ({ userId }) => {
    const dmId = [socket.id, userId].sort().join('-');
    const history = privateMessages.get(dmId) || [];
    socket.emit('dmHistory', { userId, messages: history });
  });

  socket.on('playSound', ({ roomName, soundId, username }) => {
    socket.to(roomName).emit('playSound', { soundId, username });
    console.log(`🔊 ${username} played sound ${soundId}`);
  });

  socket.on('addReaction', ({ roomName, messageId, emoji, username }) => {
    io.to(roomName).emit('reactionAdded', {
      messageId,
      emoji,
      username,
      socketId: socket.id
    });
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
    console.log(`🔌 Player disconnected: ${socket.id}`);
    
    for (const [roomName, roomUsers] of rooms) {
      const user = Array.from(roomUsers).find(u => u.id === socket.id);
      if (user) {
        roomUsers.delete(user);
        socket.to(roomName).emit('systemMessage', {
          text: `💨 ${user.username} has left the chat`,
          timestamp: new Date().toLocaleTimeString()
        });
        io.to(roomName).emit('updateUsers', 
          Array.from(roomUsers).map(u => ({
            username: u.username,
            isHost: u.isHost,
            id: u.id,
            status: u.status
          }))
        );
        if (roomUsers.size === 0) rooms.delete(roomName);
      }
    }
    
    users.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Pixel Chat running on http://localhost:${PORT}`);
  console.log(`🧵 Threads enabled`);
  console.log(`📩 Private messages enabled`);
  console.log(`🔊 Soundboard enabled`);
});