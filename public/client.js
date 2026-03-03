// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Pixel Chat Client Loading...');
  
  const socket = io();

  // ===== DOM ELEMENTS =====
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

  // ===== STATE =====
  let currentRoom = null;
  let myUsername = null;
  let mySocketId = null;
  let isHost = false;
  let pendingReply = null;
  let pendingImage = null;
  let isTyping = false;
  let typingTimer = null;
  let selectedMessageId = null;
  const messageReactions = new Map();

  // ===== AUDIO SYSTEM =====
  window.audioContext = null;
  window.audioEnabled = false;

  function initAudio() {
    if (window.audioContext) return;
    try {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      window.audioEnabled = true;
      console.log('🔊 Audio initialized');
    } catch(e) {
      console.warn('⚠️ Audio not supported:', e);
      window.audioEnabled = false;
    }
  }

  function playSound(type) {
    if (!window.audioEnabled || !window.audioContext) return;
    if (window.audioContext.state === 'suspended') {
      window.audioContext.resume();
    }
    
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

  // ===== PARTICLE EFFECT =====
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

  // ===== SCREEN NAVIGATION =====
  function showScreen(screen) {
    if (!screen) {
      console.error('❌ Screen element not found');
      return;
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    console.log('📺 Screen changed to:', screen.id);
  }

  // ===== START MENU BUTTONS =====
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
      console.log('🚪 Join Room clicked');
      initAudio();
      roomTitle.textContent = 'JOIN ROOM';
      showScreen(roomScreen);
      usernameInput?.focus();
    });
  }

  if (hostRoomBtn) {
    hostRoomBtn.addEventListener('click', () => {
      console.log('🏠 Host Room clicked');
      initAudio();
      roomTitle.textContent = 'HOST ROOM';
      showScreen(roomScreen);
      usernameInput?.focus();
    });
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      console.log('🎨 Customize clicked');
      initAudio();
      loadColorPreviews();
      showScreen(customizeScreen);
    });
  }

  // ===== ROOM SCREEN BUTTONS =====
  if (enterRoomBtn) {
    enterRoomBtn.addEventListener('click', attemptEnterRoom);
  }

  if (backToStartBtn) {
    backToStartBtn.addEventListener('click', () => {
      showScreen(startScreen);
      if (usernameInput) usernameInput.value = '';
      if (roomInput) roomInput.value = '';
    });
  }

  if (roomInput) {
    roomInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') attemptEnterRoom();
    });
  }

  if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') {
        usernameInput.blur();
        roomInput?.focus();
      }
    });
  }

  function attemptEnterRoom() {
    console.log('🔑 Attempting to enter room...');
    initAudio();
    
    const username = usernameInput?.value.trim().toUpperCase() || 'GUEST' + Math.floor(Math.random()*999);
    const room = roomInput?.value.trim().toUpperCase() || 'LOBBY';
    
    if (username.length < 2) {
      alert('NAME TOO SHORT!');
      return;
    }
    if (room.length < 2) {
      alert('ROOM CODE TOO SHORT!');
      return;
    }
    
    myUsername = username;
    currentRoom = room;
    isHost = roomTitle.textContent.includes('HOST');
    
    console.log('📤 Emitting joinRoom:', { roomName: room, username, isHost });
    socket.emit('joinRoom', { roomName: room, username, isHost });
    playSound('join');
    showServerURL();
  }

  // ===== CUSTOMIZE SCREEN =====
  function loadColorPreviews() {
    if (nameColorPreview) nameColorPreview.style.background = nameColorPicker?.value || '#4cc9f0';
    if (buttonColorPreview) buttonColorPreview.style.background = buttonColorPicker?.value || '#e94560';
    if (bgColorPreview) bgColorPreview.style.background = bgColorPicker?.value || '#1a1a2e';
    if (panelColorPreview) panelColorPreview.style.background = panelColorPicker?.value || '#16213e';
    if (bgImagePreview && bgImageUrl?.value) {
      bgImagePreview.style.backgroundImage = `url(${bgImageUrl.value})`;
    }
  }

  if (nameColorPicker) {
    nameColorPicker.addEventListener('input', () => {
      if (nameColorPreview) nameColorPreview.style.background = nameColorPicker.value;
      document.documentElement.style.setProperty('--pixel-success', nameColorPicker.value);
    });
  }

  if (buttonColorPicker) {
    buttonColorPicker.addEventListener('input', () => {
      if (buttonColorPreview) buttonColorPreview.style.background = buttonColorPicker.value;
      document.documentElement.style.setProperty('--pixel-accent', buttonColorPicker.value);
    });
  }

  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', () => {
      if (bgColorPreview) bgColorPreview.style.background = bgColorPicker.value;
      document.documentElement.style.setProperty('--pixel-bg', bgColorPicker.value);
    });
  }

  if (panelColorPicker) {
    panelColorPicker.addEventListener('input', () => {
      if (panelColorPreview) panelColorPreview.style.background = panelColorPicker.value;
      document.documentElement.style.setProperty('--pixel-panel', panelColorPicker.value);
    });
  }

  if (bgImageUrl) {
    bgImageUrl.addEventListener('input', () => {
      if (bgImagePreview && bgImageUrl.value) {
        bgImagePreview.style.backgroundImage = `url(${bgImageUrl.value})`;
      }
    });
  }

  if (bgImageUpload) {
    bgImageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (bgImageUrl) bgImageUrl.value = event.target.result;
          if (bgImagePreview) bgImagePreview.style.backgroundImage = `url(${event.target.result})`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (clearBgImageBtn) {
    clearBgImageBtn.addEventListener('click', () => {
      if (bgImageUrl) bgImageUrl.value = '';
      if (bgImagePreview) bgImagePreview.style.backgroundImage = '';
    });
  }

  if (saveColorsBtn) {
    saveColorsBtn.addEventListener('click', () => {
      const colors = {
        nameColor: nameColorPicker?.value || '#4cc9f0',
        buttonColor: buttonColorPicker?.value || '#e94560',
        bgColor: bgColorPicker?.value || '#1a1a2e',
        panelColor: panelColorPicker?.value || '#16213e',
        bgImage: bgImageUrl?.value || ''
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
      console.log('💾 Colors saved to localStorage');
    });
  }

  if (resetColorsBtn) {
    resetColorsBtn.addEventListener('click', () => {
      if (nameColorPicker) nameColorPicker.value = '#4cc9f0';
      if (buttonColorPicker) buttonColorPicker.value = '#e94560';
      if (bgColorPicker) bgColorPicker.value = '#1a1a2e';
      if (panelColorPicker) panelColorPicker.value = '#16213e';
      if (bgImageUrl) bgImageUrl.value = '';
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
  }

  if (backToStartCustomizeBtn) {
    backToStartCustomizeBtn.addEventListener('click', () => showScreen(startScreen));
  }

  // ===== CHAT SCREEN =====
  if (leaveBtn) {
    leaveBtn.addEventListener('click', () => {
      if (currentRoom) {
        addSystemMessage('🔌 Disconnected');
        showScreen(startScreen);
        currentRoom = null;
        if (messagesEl) messagesEl.innerHTML = '';
        if (userListEl) userListEl.innerHTML = '';
        clearReply();
        clearImagePreview();
        if (hostBadge) hostBadge.classList.add('hidden');
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      initAudio();
      sendMessage();
    });
  }

  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') sendMessage();
    });

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
  }

  function sendMessage() {
    console.log('📤 Sending message...');
    if (!messageInput) return;
    
    const message = messageInput.value.trim();
    const image = pendingImage || null;
    
    if (!message && !image) {
      addSystemMessage('⚠️ Type a message or attach an image');
      return;
    }
    if (!currentRoom || !myUsername) {
      addSystemMessage('⚠️ Not connected to a room');
      return;
    }
    
    const messageData = {
      roomName: currentRoom,
      username: myUsername,
      message,
      image,
      replyTo: pendingReply
    };
    
    console.log('📤 Emitting chatMessage:', { ...messageData, image: image ? 'BASE64_IMAGE' : null });
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
    if (sendBtn) {
      const rect = sendBtn.getBoundingClientRect();
      createParticles(rect.left + rect.offsetWidth/2, rect.top, 10);
    }
    scrollToBottom();
  }

  // ===== IMAGE UPLOAD =====
  if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
      initAudio();
      const file = e.target.files[0];
      if (file) handleImageFile(file);
      imageUpload.value = '';
    });
  }

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
      if (messageInput) {
        messageInput.placeholder = 'Add caption (optional)...';
        messageInput.focus();
      }
    };
    reader.readAsDataURL(file);
  }

  function clearImagePreview() {
    pendingImage = null;
    if (messageInput) messageInput.placeholder = 'TYPE MESSAGE...';
  }

  // ===== REPLY SYSTEM =====
  if (messagesEl) {
    messagesEl.addEventListener('dblclick', (e) => {
      initAudio();
      const messageEl = e.target.closest('.message');
      if (!messageEl || messageEl.classList.contains('system')) return;
      const msgId = messageEl.dataset.id;
      const username = messageEl.dataset.username;
      const text = messageEl.dataset.text;
      if (!msgId || !username) return;
      pendingReply = { id: msgId, username, text: text?.slice(0, 100) || '' };
      if (replyUsernameEl) replyUsernameEl.textContent = username;
      if (replyPreview) replyPreview.classList.remove('hidden');
      if (messageInput) messageInput.focus();
    });
  }

  if (cancelReplyBtn) {
    cancelReplyBtn.addEventListener('click', clearReply);
  }

  function clearReply() {
    pendingReply = null;
    if (replyPreview) replyPreview.classList.add('hidden');
    if (replyUsernameEl) replyUsernameEl.textContent = '';
  }

  // ===== REACTIONS =====
  if (messagesEl) {
    messagesEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-reaction-btn');
      if (btn) {
        const messageEl = btn.closest('.message');
        selectedMessageId = messageEl.dataset.id;
        if (reactionPicker) reactionPicker.classList.toggle('hidden');
      }
    });
  }

  document.querySelectorAll('.reaction-emoji').forEach(emoji => {
    emoji.addEventListener('click', () => {
      if (selectedMessageId && currentRoom) {
        socket.emit('addReaction', {
          roomName: currentRoom,
          messageId: selectedMessageId,
          emoji: emoji.dataset.emoji,
          username: myUsername
        });
        if (reactionPicker) reactionPicker.classList.add('hidden');
        selectedMessageId = null;
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.add-reaction-btn') && !e.target.closest('.reaction-picker')) {
      if (reactionPicker) reactionPicker.classList.add('hidden');
      selectedMessageId = null;
    }
  });

  // ===== SOUND TOGGLE =====
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      window.audioEnabled = !window.audioEnabled;
      soundToggleBtn.textContent = window.audioEnabled ? '🔊' : '🔇';
      soundToggleBtn.title = window.audioEnabled ? 'Sound ON' : 'Sound OFF';
      addSystemMessage(window.audioEnabled ? '🔊 Sound ENABLED' : '🔇 Sound DISABLED');
    });
  }

  // ===== SOCKET EVENTS =====
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
    addSystemMessage('⚠️ Connection error. Refresh page.');
  });

  socket.on('joinedRoom', ({ roomName, users, socketId, isHost: hostStatus }) => {
    console.log('✅ Joined room:', roomName);
    mySocketId = socketId;
    isHost = hostStatus;
    if (roomDisplay) roomDisplay.textContent = roomName;
    updateUserList(users);
    showScreen(chatScreen);
    addSystemMessage(`🎮 Connected to ${roomName}${isHost ? ' (HOST)' : ''}`);
    if (hostBadge && isHost) hostBadge.classList.remove('hidden');
    if (messageInput) messageInput.focus();
    playSound('join');
    showServerURL();
  });

  socket.on('chatMessage', (data) => {
    console.log('📥 Received message:', data.username);
    addMessage(data, false);
    scrollToBottom();
    playSound('receive');
    if (messagesEl) {
      const rect = messagesEl.getBoundingClientRect();
      createParticles(rect.right - 20, rect.bottom - 50, 5);
    }
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
      if (typingIndicator) {
        typingIndicator.textContent = username;
        typingIndicator.classList.remove('hidden');
        setTimeout(() => typingIndicator.classList.add('hidden'), 2000);
      }
    } else {
      if (typingIndicator) typingIndicator.classList.add('hidden');
    }
  });

  socket.on('error', (msg) => {
    addSystemMessage(msg);
    playSound('error');
  });

  // ===== REACTION HELPERS =====
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

  // ===== UI HELPERS =====
  function parseMarkdown(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return escaped;
  }

  function addMessage(data, isSelf) {
    if (!messagesEl) return;
    
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
    if (!messagesEl) return;
    const msgEl = document.createElement('div');
    msgEl.className = 'message system new';
    setTimeout(() => msgEl.classList.remove('new'), 500);
    msgEl.innerHTML = `<span class="text">${escapeHtml(text)}</span>`;
    messagesEl.appendChild(msgEl);
  }

  function updateUserList(users) {
    if (!userListEl) return;
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
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== LIGHTBOX =====
  window.openLightbox = function(container) {
    const img = container.querySelector('img');
    if (!img) return;
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `<img src="${img.src}" alt="zoomed"/>`;
    lightbox.onclick = () => lightbox.remove();
    document.body.appendChild(lightbox);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        lightbox.remove();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  };

  // ===== SHOW SERVER URL =====
  function showServerURL() {
    if (serverUrlEl && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      serverUrlEl.textContent = `🌐 ${window.location.origin}`;
    }
  }

  // ===== LOAD SAVED COLORS =====
  const savedColors = localStorage.getItem('pixelChatColors');
  if (savedColors) {
    try {
      const colors = JSON.parse(savedColors);
      if (colors.nameColor) document.documentElement.style.setProperty('--pixel-success', colors.nameColor);
      if (colors.buttonColor) document.documentElement.style.setProperty('--pixel-accent', colors.buttonColor);
      if (colors.bgColor) document.documentElement.style.setProperty('--pixel-bg', colors.bgColor);
      if (colors.panelColor) document.documentElement.style.setProperty('--pixel-panel', colors.panelColor);
      if (colors.bgImage) {
        document.body.style.backgroundImage = `url(${colors.bgImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      }
      console.log('🎨 Loaded saved colors from localStorage');
    } catch(e) {
      console.error('❌ Error loading saved colors:', e);
    }
  }

  // ===== INITIALIZATION =====
  console.log('🎮 Pixel Chat Client Ready!');
  console.log('🔌 Socket.IO Status:', socket.connected ? 'Connected' : 'Disconnected');
  showServerURL();
  
  // Focus first input
  if (usernameInput) usernameInput.focus();

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });
});