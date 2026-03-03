const socket = io();

// DOM Elements
const startScreen = document.getElementById('start-screen');
const joinRoomBtn = document.getElementById('join-room-btn');
const hostRoomBtn = document.getElementById('host-room-btn');
const customizeBtn = document.getElementById('customize-btn');
const serverUrlEl = document.getElementById('server-url');

const roomScreen = document.getElementById('room-screen');
const roomTitle = document.getElementById('room-title');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const enterRoomBtn = document.getElementById('enter-room-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');

const customizeScreen = document.getElementById('customize-screen');
const nameColorPicker = document.getElementById('name-color-picker');
const buttonColorPicker = document.getElementById('button-color-picker');
const bgColorPicker = document.getElementById('bg-color-picker');
const panelColorPicker = document.getElementById('panel-color-picker');
const bgImageUrl = document.getElementById('bg-image-url');
const bgImageUpload = document.getElementById('bg-image-upload');
const clearBgImageBtn = document.getElementById('clear-bg-image-btn');
const nameColorPreview = document.getElementById('name-color-preview');
const buttonColorPreview = document.getElementById('button-color-preview');
const bgColorPreview = document.getElementById('bg-color-preview');
const panelColorPreview = document.getElementById('panel-color-preview');
const bgImagePreview = document.getElementById('bg-image-preview');
const saveColorsBtn = document.getElementById('save-colors-btn');
const resetColorsBtn = document.getElementById('reset-colors-btn');
const backToStartCustomizeBtn = document.getElementById('back-to-start-customize-btn');

const chatScreen = document.getElementById('chat-screen');
const leaveBtn = document.getElementById('leave-btn');
const roomDisplay = document.getElementById('room-display');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const userListEl = document.getElementById('user-list');
const imageUpload = document.getElementById('image-upload');
const replyPreview = document.getElementById('reply-preview');
const replyUsernameEl = document.getElementById('reply-username');
const cancelReplyBtn = document.getElementById('cancel-reply');
const typingIndicator = document.getElementById('typing-indicator');
const soundToggleBtn = document.getElementById('sound-toggle');
const hostBadge = document.getElementById('host-badge');
const reactionPicker = document.getElementById('reaction-picker');

let currentRoom = null;
let myUsername = null;
let mySocketId = null;
let isHost = false;
let pendingReply = null;
let pendingImage = null;
let isTyping = false;
let typingTimer = null;
let selectedMessageId = null;

function showServerURL() {
  if (serverUrlEl && window.location.hostname !== 'localhost') {
    serverUrlEl.textContent = `🌐 ${window.location.origin}`;
  }
}

function initAudio() {
  if (window.audioContext) return;
  try {
    window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.audioEnabled = true;
  } catch (e) {
    window.audioEnabled = false;
  }
}

function playSound(type) {
  if (!window.audioEnabled || !window.audioContext) return;
  if (window.audioContext.state === 'suspended') window.audioContext.resume();
  
  const ctx = window.audioContext;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  
  switch(type) {
    case 'send':
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    case 'receive':
      osc.type = 'square';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(523.25, now + 0.05);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;
    case 'join':
      osc.type = 'square';
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.setValueAtTime(523.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
  }
}

if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    initAudio();
    window.audioEnabled = !window.audioEnabled;
    soundToggleBtn.textContent = window.audioEnabled ? '🔊' : '🔇';
    addSystemMessage(window.audioEnabled ? '🔊 Sound ENABLED' : '🔇 Sound DISABLED');
  });
}

function createParticles(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const distance = 30 + Math.random() * 40;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance - 20}px`);
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    if (Math.random() > 0.7) {
      particle.style.background = '#4cc9f0';
    }
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 600);
  }
}

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

joinRoomBtn.addEventListener('click', () => {
  initAudio();
  roomTitle.textContent = 'JOIN ROOM';
  showScreen(roomScreen);
  usernameInput.focus();
});

hostRoomBtn.addEventListener('click', () => {
  initAudio();
  roomTitle.textContent = 'HOST ROOM';
  showScreen(roomScreen);
  usernameInput.focus();
});

customizeBtn.addEventListener('click', () => {
  initAudio();
  loadColorPreviews();
  showScreen(customizeScreen);
});

enterRoomBtn.addEventListener('click', attemptEnterRoom);
backToStartBtn.addEventListener('click', () => {
  showScreen(startScreen);
  usernameInput.value = '';
  roomInput.value = '';
});

roomInput.addEventListener('keypress', (e) => { if(e.key==='Enter') attemptEnterRoom(); });
usernameInput.addEventListener('keypress', (e) => { 
  if(e.key==='Enter') { usernameInput.blur(); roomInput.focus(); }
});

function attemptEnterRoom() {
  const username = usernameInput.value.trim().toUpperCase() || 'GUEST' + Math.floor(Math.random()*999);
  const room = roomInput.value.trim().toUpperCase() || 'LOBBY';
  if (username.length < 2) { alert('NAME TOO SHORT!'); return; }
  if (room.length < 2) { alert('ROOM CODE TOO SHORT!'); return; }
  myUsername = username;
  currentRoom = room;
  isHost = roomTitle.textContent.includes('HOST');
  socket.emit('joinRoom', { roomName: room, username, isHost });
  playSound('join');
  showServerURL();
}

function loadColorPreviews() {
  nameColorPreview.style.background = nameColorPicker.value;
  buttonColorPreview.style.background = buttonColorPicker.value;
  bgColorPreview.style.background = bgColorPicker.value;
  panelColorPreview.style.background = panelColorPicker.value;
  if (bgImageUrl.value) {
    bgImagePreview.style.backgroundImage = `url(${bgImageUrl.value})`;
  }
}

nameColorPicker.addEventListener('input', () => {
  nameColorPreview.style.background = nameColorPicker.value;
  document.documentElement.style.setProperty('--pixel-success', nameColorPicker.value);
});

buttonColorPicker.addEventListener('input', () => {
  buttonColorPreview.style.background = buttonColorPicker.value;
  document.documentElement.style.setProperty('--pixel-accent', buttonColorPicker.value);
});

bgColorPicker.addEventListener('input', () => {
  bgColorPreview.style.background = bgColorPicker.value;
  document.documentElement.style.setProperty('--pixel-bg', bgColorPicker.value);
});

panelColorPicker.addEventListener('input', () => {
  panelColorPreview.style.background = panelColorPicker.value;
  document.documentElement.style.setProperty('--pixel-panel', panelColorPicker.value);
});

bgImageUrl.addEventListener('input', () => {
  if (bgImageUrl.value) {
    bgImagePreview.style.backgroundImage = `url(${bgImageUrl.value})`;
  }
});

bgImageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      bgImageUrl.value = event.target.result;
      bgImagePreview.style.backgroundImage = `url(${event.target.result})`;
    };
    reader.readAsDataURL(file);
  }
});

clearBgImageBtn.addEventListener('click', () => {
  bgImageUrl.value = '';
  bgImagePreview.style.backgroundImage = '';
});

saveColorsBtn.addEventListener('click', () => {
  const colors = {
    nameColor: nameColorPicker.value,
    buttonColor: buttonColorPicker.value,
    bgColor: bgColorPicker.value,
    panelColor: panelColorPicker.value,
    bgImage: bgImageUrl.value
  };
  localStorage.setItem('pixelChatColors', JSON.stringify(colors));
  
  if (colors.bgImage) {
    document.body.style.backgroundImage = `url(${colors.bgImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = '';
  }
  
  addSystemMessage('💾 Colors saved!');
  playSound('send');
});

resetColorsBtn.addEventListener('click', () => {
  nameColorPicker.value = '#4cc9f0';
  buttonColorPicker.value = '#e94560';
  bgColorPicker.value = '#1a1a2e';
  panelColorPicker.value = '#16213e';
  bgImageUrl.value = '';
  loadColorPreviews();
  
  document.documentElement.style.setProperty('--pixel-success', '#4cc9f0');
  document.documentElement.style.setProperty('--pixel-accent', '#e94560');
  document.documentElement.style.setProperty('--pixel-bg', '#1a1a2e');
  document.documentElement.style.setProperty('--pixel-panel', '#16213e');
  document.body.style.backgroundImage = '';
  
  localStorage.removeItem('pixelChatColors');
  addSystemMessage('🔄 Colors reset!');
  playSound('send');
});

backToStartCustomizeBtn.addEventListener('click', () => showScreen(startScreen));

leaveBtn.addEventListener('click', () => {
  if (currentRoom) {
    addSystemMessage('🔌 Disconnected');
    showScreen(startScreen);
    currentRoom = null;
    messagesEl.innerHTML = '';
    userListEl.innerHTML = '';
    clearReply();
    clearImagePreview();
    hostBadge.classList.add('hidden');
  }
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });

messageInput.addEventListener('input', () => {
  if (!currentRoom || !myUsername) return;
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing', { roomName: currentRoom, username: myUsername, isTyping: true });
  }
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit('typing', { roomName: currentRoom, username: myUsername, isTyping: false });
  }, 1000);
});

function sendMessage() {
  const message = messageInput.value.trim();
  const image = pendingImage || null;
  if (!message && !image) {
    addSystemMessage('⚠️ Type a message or attach an image');
    return;
  }
  if (!currentRoom || !myUsername) return;
  
  const messageData = {
    roomName: currentRoom,
    username: myUsername,
    message,
    image,
    replyTo: pendingReply
  };
  
  socket.emit('chatMessage', messageData);
  
  const localData = {
    ...messageData,
    id: Date.now() + '-local',
    timestamp: new Date().toLocaleTimeString(),
    senderId: socket.id,
    reactions: {}
  };
  addMessage(localData, true);
  
  messageInput.value = '';
  clearImagePreview();
  clearReply();
  
  if (isTyping) {
    isTyping = false;
    socket.emit('typing', { roomName: currentRoom, username: myUsername, isTyping: false });
  }
  
  playSound('send');
  createParticles(sendBtn.getBoundingClientRect().left + sendBtn.offsetWidth/2, sendBtn.getBoundingClientRect().top, 10);
  scrollToBottom();
}

imageUpload.addEventListener('change', (e) => {
  initAudio();
  const file = e.target.files[0];
  if (file) handleImageFile(file);
  imageUpload.value = '';
});

document.addEventListener('paste', (e) => {
  if (!currentRoom || document.activeElement !== messageInput) return;
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let item of items) {
    if (item.type?.startsWith('image/')) {
      e.preventDefault();
      handleImageFile(item.getAsFile());
      break;
    }
  }
});

function handleImageFile(file) {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    addSystemMessage('⚠️ Only PNG, JPG, GIF, WebP allowed');
    playSound('error');
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    addSystemMessage('⚠️ Image too large (max 50MB)');
    playSound('error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingImage = e.target.result;
    const isGif = file.type === 'image/gif';
    addSystemMessage(`🖼️ ${isGif ? '🎬 GIF' : 'Image'} attached`);
    messageInput.placeholder = 'Add caption (optional)...';
    messageInput.focus();
  };
  reader.readAsDataURL(file);
}

function clearImagePreview() {
  pendingImage = null;
  messageInput.placeholder = 'TYPE MESSAGE...';
}

messagesEl.addEventListener('dblclick', (e) => {
  initAudio();
  const messageEl = e.target.closest('.message');
  if (!messageEl || messageEl.classList.contains('system')) return;
  const msgId = messageEl.dataset.id;
  const username = messageEl.dataset.username;
  const text = messageEl.dataset.text;
  if (!msgId || !username) return;
  pendingReply = { id: msgId, username, text: text?.slice(0, 100) || '' };
  replyUsernameEl.textContent = username;
  replyPreview.classList.remove('hidden');
  messageInput.focus();
});

cancelReplyBtn.addEventListener('click', clearReply);
function clearReply() {
  pendingReply = null;
  replyPreview.classList.add('hidden');
}

messagesEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-reaction-btn');
  if (btn) {
    const messageEl = btn.closest('.message');
    selectedMessageId = messageEl.dataset.id;
    reactionPicker.classList.toggle('hidden');
  }
});

document.querySelectorAll('.reaction-emoji').forEach(emoji => {
  emoji.addEventListener('click', () => {
    if (selectedMessageId && currentRoom) {
      socket.emit('addReaction', {
        roomName: currentRoom,
        messageId: selectedMessageId,
        emoji: emoji.dataset.emoji,
        username: myUsername
      });
      reactionPicker.classList.add('hidden');
      selectedMessageId = null;
    }
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.add-reaction-btn') && !e.target.closest('.reaction-picker')) {
    reactionPicker.classList.add('hidden');
    selectedMessageId = null;
  }
});

socket.on('joinedRoom', ({ roomName, users, socketId, isHost: hostStatus }) => {
  mySocketId = socketId;
  isHost = hostStatus;
  roomDisplay.textContent = roomName;
  updateUserList(users);
  showScreen(chatScreen);
  addSystemMessage(`🎮 Connected to ${roomName}${isHost ? ' (HOST)' : ''}`);
  if (isHost) hostBadge.classList.remove('hidden');
  messageInput.focus();
  playSound('join');
  showServerURL();
});

socket.on('chatMessage', (data) => {
  addMessage(data, false);
  scrollToBottom();
  playSound('receive');
  createParticles(messagesEl.getBoundingClientRect().right - 20, messagesEl.getBoundingClientRect().bottom - 50, 5);
});

socket.on('reactionAdded', ({ messageId, emoji, username, socketId }) => {
  updateMessageReactions(messageId, emoji, username, socketId, 'add');
});

socket.on('reactionRemoved', ({ messageId, emoji, username, socketId }) => {
  updateMessageReactions(messageId, emoji, username, socketId, 'remove');
});

socket.on('systemMessage', ({ text }) => {
  addSystemMessage(text);
  scrollToBottom();
});

socket.on('updateUsers', (users) => {
  updateUserList(users);
});

socket.on('userTyping', ({ username, isTyping }) => {
  if (isTyping && username !== myUsername) {
    typingIndicator.textContent = username;
    typingIndicator.classList.remove('hidden');
    setTimeout(() => typingIndicator.classList.add('hidden'), 2000);
  } else {
    typingIndicator.classList.add('hidden');
  }
});

socket.on('error', (msg) => {
  addSystemMessage(msg);
  playSound('error');
});

const messageReactions = new Map();

function updateMessageReactions(messageId, emoji, username, socketId, action) {
  if (!messageReactions.has(messageId)) {
    messageReactions.set(messageId, {});
  }
  
  const reactions = messageReactions.get(messageId);
  if (!reactions[emoji]) reactions[emoji] = new Set();
  
  if (action === 'add') {
    reactions[emoji].add(socketId);
  } else {
    reactions[emoji].delete(socketId);
  }
  
  const messageEl = document.querySelector(`.message[data-id="${messageId}"]`);
  if (messageEl) {
    renderReactions(messageEl, reactions);
  }
}

function renderReactions(messageEl, reactions) {
  let reactionsContainer = messageEl.querySelector('.reactions');
  if (!reactionsContainer) {
    reactionsContainer = document.createElement('div');
    reactionsContainer.className = 'reactions';
    messageEl.appendChild(reactionsContainer);
  }
  
  reactionsContainer.innerHTML = '';
  
  for (const [emoji, users] of Object.entries(reactions)) {
    if (users.size === 0) continue;
    const reactionEl = document.createElement('span');
    reactionEl.className = 'reaction';
    reactionEl.innerHTML = `<span class="emoji">${emoji}</span><span class="count">${users.size}</span>`;
    reactionEl.addEventListener('click', () => {
      if (currentRoom && messageEl.dataset.id) {
        socket.emit('removeReaction', {
          roomName: currentRoom,
          messageId: messageEl.dataset.id,
          emoji,
          username: myUsername
        });
      }
    });
    reactionsContainer.appendChild(reactionEl);
  }
  
  if (reactionsContainer.children.length === 0) {
    reactionsContainer.remove();
  }
}

function parseMarkdown(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return escaped;
}

function addMessage(data, isSelf) {
  const msgEl = document.createElement('div');
  msgEl.className = 'message new';
  msgEl.dataset.id = data.id;
  msgEl.dataset.username = data.username;
  msgEl.dataset.text = data.message;
  setTimeout(() => msgEl.classList.remove('new'), 500);
  
  if (data.senderId === socket.id) {
    msgEl.classList.add('self');
    msgEl.style.borderColor = 'var(--pixel-accent)';
  }
  
  let content = '';
  
  if (data.replyTo) {
    content += `<div class="quoted-message"><span class="username">@${escapeHtml(data.replyTo.username)}</span><span class="text">${escapeHtml(data.replyTo.text)}</span></div>`;
  }
  
  if (data.image) {
    const isGif = data.image.includes('image/gif');
    content += `<div class="image-container ${isGif ? 'gif' : ''}" onclick="openLightbox(this)"><img src="${data.image}" alt="image"/><div class="image-overlay">${isGif ? '🎬 GIF' : '[ZOOM]'}</div></div>`;
  }
  
  if (data.message) {
    content += `<span class="text">${parseMarkdown(data.message)}</span>`;
  }
  
  msgEl.innerHTML = `
    <span class="meta"><span class="username">${escapeHtml(data.username)}</span><span class="time">[${data.timestamp}]</span></span>
    ${content}
    <span class="add-reaction-btn">😊</span>
  `;
  
  if (data.reactions) {
    messageReactions.set(data.id, data.reactions);
    renderReactions(msgEl, data.reactions);
  }
  
  messagesEl.appendChild(msgEl);
}

function addSystemMessage(text) {
  const msgEl = document.createElement('div');
  msgEl.className = 'message system new';
  setTimeout(() => msgEl.classList.remove('new'), 500);
  msgEl.innerHTML = `<span class="text">${escapeHtml(text)}</span>`;
  messagesEl.appendChild(msgEl);
}

function updateUserList(users) {
  userListEl.innerHTML = '';
  const seen = new Set();
  users.forEach(user => {
    if (seen.has(user.username)) return;
    seen.add(user.username);
    const li = document.createElement('li');
    li.textContent = user.username;
    if (user.username === myUsername) li.classList.add('you');
    if (user.isHost) li.classList.add('host');
    userListEl.appendChild(li);
  });
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.openLightbox = function(container) {
  const img = container.querySelector('img');
  if (!img) return;
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `<img src="${img.src}" alt="zoomed"/>`;
  lightbox.onclick = () => lightbox.remove();
  document.body.appendChild(lightbox);
  const onKey = (e) => {
    if (e.key === 'Escape') { lightbox.remove(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);
};

usernameInput.focus();
showServerURL();

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  document.body.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
});