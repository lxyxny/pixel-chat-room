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
const roomOwners = new Map();
const roomModerators = new Map();
const bannedUsers = new Map();

function isValidImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  const validTypes = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
  return validTypes.some(type => 
    dataUrl.includes(`image/${type}`) || dataUrl.includes(`image/${type.toUpperCase()}`)
  );
}

function getUserRole(socketId, roomName) {
  const user = users.get(socketId);
  if (!user) return 'member';
  
  if (roomOwners.get(roomName) === socketId) return 'owner';
  if (roomModerators.has(roomName) && roomModerators.get(roomName).has(user.username)) return 'mod';
  if (bannedUsers.has(roomName) && bannedUsers.get(roomName).has(user.username)) return 'banned';
  
  return 'member';
}

io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);
  
  users.set(socket.id, { 
    socketId: socket.id, 
    username: null, 
    avatar: null,
    roomsJoined: 0,
    messagesSent: 0,
    status: 'online'
  });

  socket.on('joinRoom', ({ roomName, username, isHost, avatar }) => {
    console.log(`📥 joinRoom event: ${username} joining ${roomName} as ${isHost ? 'host' : 'member'}`);
    
    if (bannedUsers.has(roomName) && bannedUsers.get(roomName).has(username)) {
      socket.emit('error', '🚫 You are banned from this room');
      return;
    }
    
    socket.join(roomName);
    
    const userInfo = {
      id: socket.id,
      username,
      avatar: avatar || null,
      isHost: isHost || false,
      role: isHost ? 'owner' : 'member',
      room: roomName,
      status: 'online',
      roomsJoined: (users.get(socket.id)?.roomsJoined || 0) + 1,
      messagesSent: users.get(socket.id)?.messagesSent || 0,
      isBanned: false
    };
    
    users.set(socket.id, userInfo);
    
    if (isHost) {
      roomOwners.set(roomName, socket.id);
      if (!roomModerators.has(roomName)) {
        roomModerators.set(roomName, new Set());
      }
      if (!bannedUsers.has(roomName)) {
        bannedUsers.set(roomName, new Set());
      }
    }
    
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
      status: u.status,
      role: getUserRole(u.id, roomName),
      avatar: u.avatar,
      roomsJoined: u.roomsJoined,
      messagesSent: u.messagesSent,
      isBanned: false
    }));
    
    io.to(roomName).emit('updateUsers', roomUsers);
    socket.emit('updateRoomList', Array.from(rooms.keys()));
    
    socket.emit('joinedRoom', { 
      roomName, 
      users: roomUsers, 
      socketId: socket.id,
      isHost: isHost || false,
      role: getUserRole(socket.id, roomName)
    });
    
    console.log(`✅ ${username} joined room: ${roomName} successfully`);
  });

  socket.on('chatMessage', ({ roomName, username, message, image, replyTo, avatar }) => {
    if (!message?.trim() && !image) return;
    
    if (image && !isValidImage(image)) {
      socket.emit('error', '⚠️ Invalid image format');
      return;
    }
    
    if (avatar && users.has(socket.id)) {
      users.get(socket.id).avatar = avatar;
      socket.to(roomName).emit('avatarUpdated', { userId: socket.id, avatar });
    }
    
    const user = users.get(socket.id);
    if (user) {
      user.messagesSent = (user.messagesSent || 0) + 1;
    }

    const messageData = {
      id: uuidv4(),
      username,
      message: message?.trim() || '',
      image: image || null,
      replyTo: replyTo || null,
      reactions: {},
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id,
      avatar: avatar || null
    };

    socket.to(roomName).emit('chatMessage', messageData);
    console.log(`💬 [${roomName}] ${username}: ${message?.substring(0, 50) || ''}`);
  });

  socket.on('updateAvatar', ({ avatar }) => {
    if (avatar && isValidImage(avatar)) {
      const user = users.get(socket.id);
      if (user) {
        user.avatar = avatar;
        for (const [roomName, roomUsers] of rooms) {
          if (Array.from(roomUsers).some(u => u.id === socket.id)) {
            socket.to(roomName).emit('avatarUpdated', { userId: socket.id, avatar });
          }
        }
      }
    }
  });

  socket.on('setModerator', ({ roomName, targetUser }) => {
    const role = getUserRole(socket.id, roomName);
    if (role !== 'owner') {
      socket.emit('error', '⚠️ Only owners can set moderators');
      return;
    }
    
    if (!roomModerators.has(roomName)) {
      roomModerators.set(roomName, new Set());
    }
    roomModerators.get(roomName).add(targetUser);
    
    io.to(roomName).emit('moderatorSet', { username: targetUser });
    io.to(roomName).emit('updateUsers', 
      Array.from(rooms.get(roomName)).map(u => ({
        username: u.username,
        isHost: u.isHost,
        id: u.id,
        role: getUserRole(u.id, roomName),
        avatar: u.avatar
      }))
    );
  });

  socket.on('kickUser', ({ roomName, targetUser }) => {
    const role = getUserRole(socket.id, roomName);
    if (role !== 'owner' && role !== 'mod') {
      socket.emit('error', '⚠️ Only owners and mods can kick users');
      return;
    }
    
    for (const [sockId, user] of users) {
      if (user.username === targetUser && user.room === roomName) {
        io.to(sockId).emit('userKicked');
        io.to(roomName).emit('systemMessage', { text: `👢 ${targetUser} has been kicked` });
        
        const room = rooms.get(roomName);
        if (room) {
          room.delete(user);
        }
        socket.to(roomName).emit('updateUsers', 
          Array.from(room || []).map(u => ({
            username: u.username,
            isHost: u.isHost,
            id: u.id,
            role: getUserRole(u.id, roomName)
          }))
        );
        break;
      }
    }
  });

  socket.on('banUser', ({ roomName, targetUser }) => {
    const role = getUserRole(socket.id, roomName);
    if (role !== 'owner') {
      socket.emit('error', '⚠️ Only owners can ban users');
      return;
    }
    
    if (!bannedUsers.has(roomName)) {
      bannedUsers.set(roomName, new Set());
    }
    bannedUsers.get(roomName).add(targetUser);
    
    for (const [sockId, user] of users) {
      if (user.username === targetUser && user.room === roomName) {
        io.to(sockId).emit('userBanned');
        
        const room = rooms.get(roomName);
        if (room) {
          room.delete(user);
        }
        break;
      }
    }
    
    io.to(roomName).emit('systemMessage', { text: `🚫 ${targetUser} has been banned` });
    io.to(roomName).emit('updateUsers', 
      Array.from(rooms.get(roomName) || []).map(u => ({
        username: u.username,
        isHost: u.isHost,
        id: u.id,
        role: getUserRole(u.id, roomName),
        isBanned: bannedUsers.get(roomName)?.has(u.username) || false
      }))
    );
  });

  socket.on('unbanUser', ({ roomName, targetUser }) => {
    const role = getUserRole(socket.id, roomName);
    if (role !== 'owner') {
      socket.emit('error', '⚠️ Only owners can unban users');
      return;
    }
    
    if (bannedUsers.has(roomName)) {
      bannedUsers.get(roomName).delete(targetUser);
    }
    
    io.to(roomName).emit('systemMessage', { text: `✅ ${targetUser} has been unbanned` });
  });

  socket.on('deleteRoom', ({ roomName }) => {
    const role = getUserRole(socket.id, roomName);
    if (role !== 'owner') {
      socket.emit('error', '⚠️ Only owners can delete rooms');
      return;
    }
    
    io.to(roomName).emit('roomDeleted');
    io.to(roomName).disconnectSockets(true);
    
    rooms.delete(roomName);
    roomOwners.delete(roomName);
    roomModerators.delete(roomName);
    bannedUsers.delete(roomName);
    threads.forEach((thread, id) => {
      if (thread.room === roomName) {
        threads.delete(id);
      }
    });
    
    console.log(`🗑️ Room deleted: ${roomName}`);
  });

  socket.on('getBannedUsers', ({ roomName }) => {
    const role = getUserRole(socket.id, roomName);
    if (role !== 'owner') {
      socket.emit('error', '⚠️ Only owners can view banned users');
      return;
    }
    
    const banned = bannedUsers.has(roomName) ? Array.from(bannedUsers.get(roomName)) : [];
    socket.emit('bannedUsersList', { bannedUsers: banned });
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
  });

  socket.on('threadMessage', ({ threadId, username, message }) => {
    const thread = threads.get(threadId);
    if (!thread) return;
    
    const messageData = {
      id: uuidv4(),
      username,
      message: message?.trim() || '',
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id,
      threadId: threadId
    };
    
    thread.messages.push(messageData);
    io.to(`thread-${threadId}`).emit('threadMessage', messageData);
  });

  socket.on('joinThread', ({ threadId }) => {
    const thread = threads.get(threadId);
    if (thread) {
      thread.participants.add(socket.id);
      socket.join(`thread-${threadId}`);
      socket.emit('threadMessages', { threadId, messages: thread.messages });
    }
  });

  socket.on('privateMessage', ({ toUserId, fromUsername, message, messageId }) => {
    const dmId = [socket.id, toUserId].sort().join('-');
    
    const messageData = {
      id: messageId || uuidv4(),
      from: socket.id,
      fromUsername,
      to: toUserId,
      message: message?.trim() || '',
      timestamp: new Date().toLocaleTimeString()
    };
    
    if (!privateMessages.has(dmId)) {
      privateMessages.set(dmId, []);
    }
    privateMessages.get(dmId).push(messageData);
    
    io.to(toUserId).emit('privateMessage', messageData);
    socket.emit('privateMessage', messageData);
  });

  socket.on('getDMHistory', ({ userId }) => {
    const dmId = [socket.id, userId].sort().join('-');
    const history = privateMessages.get(dmId) || [];
    socket.emit('dmHistory', { userId, messages: history });
  });

  socket.on('playSound', ({ roomName, soundId, username }) => {
    socket.to(roomName).emit('playSound', { soundId, username });
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

  // ── Minigame: broadcast position/state to room ──
  socket.on('gameState', ({ roomName, game, payload }) => {
    socket.to(roomName).emit('gameState', { game, payload });
  });

  // ── Minigame: host updates match settings ──
  socket.on('gameSettings', ({ roomName, opts }) => {
    socket.to(roomName).emit('gameSettings', { opts });
  });

  // ── Minigame: host broadcasts invite popup to all players ──
  socket.on('gameInvite', ({ roomName, game, gameName, hostUsername }) => {
    socket.to(roomName).emit('gameInvite', { game, gameName, hostUsername });
  });

  // ── Minigame: host launches game to all players ──
  socket.on('gameLaunch', ({ roomName, game, players, opts }) => {
    socket.to(roomName).emit('gameLaunch', { game, players, opts });
  });

  // ── Minigame: player responds to invite (yes/no) ──
  socket.on('gameJoinResponse', ({ roomName, username, accepted, game }) => {
    socket.to(roomName).emit('gameJoinResponse', { username, accepted, game });
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
            status: u.status,
            role: getUserRole(u.id, roomName)
          }))
        );
        if (roomUsers.size === 0) {
          rooms.delete(roomName);
          roomOwners.delete(roomName);
          roomModerators.delete(roomName);
          bannedUsers.delete(roomName);
        }
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
  console.log(`🎵 Soundboard enabled`);
  console.log(`👤 Profiles enabled`);
  console.log(`🛡️ Admin controls enabled`);
});