const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');
const leaveBtn = document.getElementById('leave-btn');
const roomDisplay = document.getElementById('room-display');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const userListEl = document.getElementById('user-list');

let currentRoom = null;
let myUsername = null;

// ===== LOGIN FLOW =====
function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

joinBtn.addEventListener('click', attemptJoin);
roomInput.addEventListener('keypress', (e) => { if(e.key==='Enter') attemptJoin(); });
usernameInput.addEventListener('keypress', (e) => { if(e.key==='Enter') usernameInput.blur(); roomInput.focus(); });

function attemptJoin() {
  const username = usernameInput.value.trim().toUpperCase() || 'GUEST' + Math.floor(Math.random()*999);
  const room = roomInput.value.trim().toUpperCase() || 'LOBBY';
  
  if (username.length < 2) { alert('NAME TOO SHORT!'); return; }
  if (room.length < 2) { alert('ROOM CODE TOO SHORT!'); return; }
  
  myUsername = username;
  currentRoom = room;
  
  socket.emit('joinRoom', { roomName: room, username });
}

// ===== SOCKET EVENTS =====
socket.on('joinedRoom', ({ roomName, users }) => {
  roomDisplay.textContent = roomName;
  updateUserList(users);
  showScreen(chatScreen);
  addSystemMessage(`🎮 Connected to ${roomName}`);
  messageInput.focus();
});

socket.on('chatMessage', ({ username, message, timestamp, isSelf }) => {
  addMessage(username, message, timestamp, false);
  scrollToBottom();
});

socket.on('systemMessage', ({ text, timestamp }) => {
  addSystemMessage(text);
  scrollToBottom();
});

socket.on('updateUsers', (users) => {
  updateUserList(users);
});

// ===== LEAVE ROOM =====
leaveBtn.addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leaveRoom', currentRoom); // Optional: implement on server
    addSystemMessage('🔌 Disconnected');
    showScreen(loginScreen);
    currentRoom = null;
    messagesEl.innerHTML = '';
    userListEl.innerHTML = '';
  }
});

// ===== SEND MESSAGE =====
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !currentRoom || !myUsername) return;
  
  // Send to server
  socket.emit('chatMessage', {
    roomName: currentRoom,
    username: myUsername,
    message
  });
  
  // In client.js, after message sends:
const snd = new Audio('/sounds/pixel-send.wav');
snd.volume = 0.3;
snd.play().catch(() => {}); // Ignore autoplay restrictions
  // Display locally immediately (optimistic UI)
  addMessage(myUsername, message, new Date().toLocaleTimeString(), true);
  messageInput.value = '';
  scrollToBottom();
}

// ===== UI HELPERS =====
function addMessage(username, text, timestamp, isSelf) {
  const msgEl = document.createElement('div');
  msgEl.className = 'message' + (isSelf ? ' self' : '');
  msgEl.innerHTML = `
    <span class="meta">
      <span class="username">${escapeHtml(username)}</span> 
      <span class="time">[${timestamp}]</span>
    </span>
    <span class="text">${escapeHtml(text)}</span>
  `;
  if (isSelf) msgEl.style.borderColor = 'var(--pixel-accent)';
  messagesEl.appendChild(msgEl);
}

function addSystemMessage(text) {
  const msgEl = document.createElement('div');
  msgEl.className = 'message system';
  msgEl.innerHTML = `<span class="text">${escapeHtml(text)}</span>`;
  messagesEl.appendChild(msgEl);
}

function updateUserList(users) {
  userListEl.innerHTML = '';
  users.forEach(username => {
    const li = document.createElement('li');
    li.textContent = username;
    if (username === myUsername) li.classList.add('you');
    userListEl.appendChild(li);
  });
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Auto-focus helpers
usernameInput.focus();