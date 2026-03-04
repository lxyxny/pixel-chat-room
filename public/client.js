document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Pixel Chat Loading...');
  
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
  const buttonTextColorPicker = document.getElementById('button-text-color-picker');
  const bgColorPicker = document.getElementById('bg-color-picker');
  const panelColorPicker = document.getElementById('panel-color-picker');
  const bgImageUrl = document.getElementById('bg-image-url');
  const bgImageUpload = document.getElementById('bg-image-upload');
  const clearBgImageBtn = document.getElementById('clear-bg-image-btn');
  const nameColorPreview = document.getElementById('name-color-preview');
  const buttonColorPreview = document.getElementById('button-color-preview');
  const buttonTextColorPreview = document.getElementById('button-text-color-preview');
  const bgColorPreview = document.getElementById('bg-color-preview');
  const panelColorPreview = document.getElementById('panel-color-preview');
  const bgImagePreview = document.getElementById('bg-image-preview');
  const uiOpacitySlider = document.getElementById('ui-opacity-slider');
  const buttonOpacitySlider = document.getElementById('button-opacity-slider');
  const textOpacitySlider = document.getElementById('text-opacity-slider');
  const showAvatarsToggle = document.getElementById('show-avatars-toggle');
  const uiOpacityValue = document.getElementById('ui-opacity-value');
  const buttonOpacityValue = document.getElementById('button-opacity-value');
  const textOpacityValue = document.getElementById('text-opacity-value');
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
  const userCountEl = document.getElementById('user-count');
  const imageUpload = document.getElementById('image-upload');
  const replyPreview = document.getElementById('reply-preview');
  const replyUsernameEl = document.getElementById('reply-username');
  const cancelReplyBtn = document.getElementById('cancel-reply');
  const typingIndicator = document.getElementById('typing-indicator');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundboardBtn = document.getElementById('soundboard-btn');
  const soundboardPanel = document.getElementById('soundboard-panel');
  const soundButtons = document.querySelectorAll('.sound-btn');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const mainChatPanel = document.getElementById('main-chat-panel');
  const threadsPanel = document.getElementById('threads-panel');
  const dmsPanel = document.getElementById('dms-panel');
  const threadsTab = document.getElementById('threads-tab');

  // Threads
  const threadsList = document.getElementById('threads-list');
  const threadView = document.getElementById('thread-view');
  const threadNameEl = document.getElementById('thread-name');
  const threadMessagesEl = document.getElementById('thread-messages');
  const threadMessageInput = document.getElementById('thread-message-input');
  const sendThreadBtn = document.getElementById('send-thread-btn');
  const closeThreadBtn = document.getElementById('close-thread-btn');

  // DMs
  const dmUsersList = document.getElementById('dm-users-list');
  const dmChat = document.getElementById('dm-chat');
  const dmUsernameEl = document.getElementById('dm-username');
  const dmMessagesEl = document.getElementById('dm-messages');
  const dmMessageInput = document.getElementById('dm-message-input');
  const sendDmBtn = document.getElementById('send-dm-btn');
  const closeDmBtn = document.getElementById('close-dm-btn');

  // Profile Modal
  const profileModal = document.getElementById('profile-modal');
  const profileUsernameEl = document.getElementById('profile-username');
  const profileAvatarImg = document.getElementById('profile-avatar-img');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  const profileRoleEl = document.getElementById('profile-role');
  const profileStatusEl = document.getElementById('profile-status');
  const profileRoomsEl = document.getElementById('profile-rooms');
  const profileMessagesEl = document.getElementById('profile-messages');
  const closeProfileBtn = document.getElementById('close-profile-btn');
  const ownerControls = document.getElementById('owner-controls');
  const modControls = document.getElementById('mod-controls');
  const setModBtn = document.getElementById('set-mod-btn');
  const kickBtn = document.getElementById('kick-btn');
  const banBtn = document.getElementById('ban-btn');
  const unbanBtn = document.getElementById('unban-btn');
  const modKickBtn = document.getElementById('mod-kick-btn');

  // Room Controls Modal
  const roomControlsModal = document.getElementById('room-controls-modal');
  const closeRoomControlsBtn = document.getElementById('close-room-controls-btn');
  const deleteRoomBtn = document.getElementById('delete-room-btn');
  const viewBannedBtn = document.getElementById('view-banned-btn');

  // ===== STATE =====
  let currentRoom = null;
  let myUsername = null;
  let mySocketId = null;
  let isHost = false;
  let myRole = 'member';
  let pendingReply = null;
  let pendingImage = null;
  let pendingAvatar = null;
  let isTyping = false;
  let typingTimer = null;
  let selectedMessageId = null;
  const messageReactions = new Map();
  const threads = new Map();
  let currentThread = null;
  let currentDM = null;
  const sentDMMessages = new Set();
  const usersMap = new Map(); // ✅ FIXED: Renamed from 'users'
  let selectedUser = null;
  let myAvatar = null;

  // ===== AUDIO =====
  window.audioContext = null;
  window.audioEnabled = false;

  const soundEffects = {
    airhorn: { freq: [200, 300, 400], type: 'sawtooth', duration: 0.5 },
    bruh: { freq: [150, 100], type: 'square', duration: 0.4 },
    wow: { freq: [400, 600], type: 'sine', duration: 0.3 },
    laugh: { freq: [500, 400, 300], type: 'triangle', duration: 0.5 },
    clap: { freq: [800, 600], type: 'square', duration: 0.2 },
    sad: { freq: [300, 200], type: 'sine', duration: 0.6 }
  };

  function initAudio() {
    if (window.audioContext) return;
    try {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      window.audioEnabled = true;
    } catch(e) {
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
    
    const sound = soundEffects[type] || { freq: [523.25], type: 'square', duration: 0.15 };
    osc.type = sound.type;
    sound.freq.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, now + (i * 0.1));
    });
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + sound.duration);
    osc.start(now);
    osc.stop(now + sound.duration);
  }

  function playSystemSound(type) {
    if (!window.audioEnabled || !window.audioContext) return;
    
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

  // ===== PARTICLES =====
  function createParticles(x, y, count = 8, color = null) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 30 + Math.random() * 40;
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance - 20}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      if (color) particle.style.background = color;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    }
  }

  // ===== SCREENS =====
  function showScreen(screen) {
    if (!screen) return;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  function showPanel(panelId) {
    document.querySelectorAll('.chat-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const panel = document.getElementById(panelId);
    const tab = document.querySelector(`[data-tab="${panelId.replace('-panel', '')}"]`);
    
    if (panel) panel.classList.add('active');
    if (tab) tab.classList.add('active');
  }

  function openProfileModal(user) {
    if (!profileModal) return;
    
    selectedUser = user;
    profileUsernameEl.textContent = user.username;
    profileRoleEl.textContent = user.role || 'Member';
    profileStatusEl.textContent = user.status || 'Online';
    profileRoomsEl.textContent = user.roomsJoined || 1;
    profileMessagesEl.textContent = user.messagesSent || 0;
    
    if (user.avatar) {
      profileAvatarImg.src = user.avatar;
      profileAvatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
    } else {
      profileAvatarImg.style.display = 'none';
      avatarPlaceholder.style.display = 'flex';
    }
    
    if (user.isBanned) {
      profileStatusEl.textContent = 'Banned';
      profileStatusEl.style.color = '#ff4757';
    }
    
    ownerControls.classList.add('hidden');
    modControls.classList.add('hidden');
    unbanBtn.classList.add('hidden');
    
    if (myRole === 'owner' && user.username !== myUsername) {
      ownerControls.classList.remove('hidden');
      if (user.isBanned) {
        unbanBtn.classList.remove('hidden');
        banBtn.classList.add('hidden');
      } else {
        unbanBtn.classList.add('hidden');
        banBtn.classList.remove('hidden');
      }
    } else if (myRole === 'mod' && user.username !== myUsername && user.role !== 'owner') {
      modControls.classList.remove('hidden');
    }
    
    profileModal.classList.remove('hidden');
  }

  function closeProfileModal() {
    if (profileModal) profileModal.classList.add('hidden');
    selectedUser = null;
  }

  function openRoomControlsModal() {
    if (roomControlsModal && myRole === 'owner') {
      roomControlsModal.classList.remove('hidden');
    }
  }

  function closeRoomControlsModal() {
    if (roomControlsModal) roomControlsModal.classList.add('hidden');
  }

  // ===== START MENU =====
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
      initAudio();
      roomTitle.textContent = 'JOIN ROOM';
      showScreen(roomScreen);
      usernameInput?.focus();
    });
  }

  if (hostRoomBtn) {
    hostRoomBtn.addEventListener('click', () => {
      initAudio();
      roomTitle.textContent = 'HOST ROOM';
      showScreen(roomScreen);
      usernameInput?.focus();
    });
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      initAudio();
      loadColorPreviews();
      showScreen(customizeScreen);
    });
  }

  // ===== ROOM SCREEN =====
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
    initAudio();
    const username = usernameInput?.value.trim().toUpperCase() || 'GUEST' + Math.floor(Math.random()*999);
    const room = roomInput?.value.trim().toUpperCase() || 'LOBBY';
    
    if (username.length < 2) { alert('NAME TOO SHORT!'); return; }
    if (room.length < 2) { alert('ROOM CODE TOO SHORT!'); return; }
    
    myUsername = username;
    currentRoom = room;
    isHost = roomTitle.textContent.includes('HOST');
    
    socket.emit('joinRoom', { roomName: room, username, isHost, avatar: myAvatar });
    playSystemSound('join');
    showServerURL();
  }

  // ===== CUSTOMIZE =====
  function loadColorPreviews() {
    const savedColors = localStorage.getItem('pixelChatColors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      if (nameColorPicker) nameColorPicker.value = colors.nameColor || '#4cc9f0';
      if (buttonColorPicker) buttonColorPicker.value = colors.buttonColor || '#e94560';
      if (buttonTextColorPicker) buttonTextColorPicker.value = colors.buttonTextColor || '#ffffff';
      if (bgColorPicker) bgColorPicker.value = colors.bgColor || '#1a1a2e';
      if (panelColorPicker) panelColorPicker.value = colors.panelColor || '#16213e';
      if (bgImageUrl) bgImageUrl.value = colors.bgImage || '';
      if (uiOpacitySlider) uiOpacitySlider.value = colors.uiOpacity || '1';
      if (buttonOpacitySlider) buttonOpacitySlider.value = colors.buttonOpacity || '1';
      if (textOpacitySlider) textOpacitySlider.value = colors.textOpacity || '1';
      if (showAvatarsToggle) showAvatarsToggle.checked = colors.showAvatars !== false;
    }
    updateColorPreviews();
    updateOpacityValues();
  }

  function updateColorPreviews() {
    if (nameColorPreview) nameColorPreview.style.background = nameColorPicker?.value || '#4cc9f0';
    if (buttonColorPreview) buttonColorPreview.style.background = buttonColorPicker?.value || '#e94560';
    if (buttonTextColorPreview) buttonTextColorPreview.style.background = buttonTextColorPicker?.value || '#ffffff';
    if (bgColorPreview) bgColorPreview.style.background = bgColorPicker?.value || '#1a1a2e';
    if (panelColorPreview) panelColorPreview.style.background = panelColorPicker?.value || '#16213e';
    if (bgImagePreview && bgImageUrl?.value) {
      bgImagePreview.style.backgroundImage = `url(${bgImageUrl.value})`;
    }
  }

  function updateOpacityValues() {
    if (uiOpacitySlider && uiOpacityValue) uiOpacityValue.textContent = Math.round(uiOpacitySlider.value * 100) + '%';
    if (buttonOpacitySlider && buttonOpacityValue) buttonOpacityValue.textContent = Math.round(buttonOpacitySlider.value * 100) + '%';
    if (textOpacitySlider && textOpacityValue) textOpacityValue.textContent = Math.round(textOpacitySlider.value * 100) + '%';
  }

  if (nameColorPicker) {
    nameColorPicker.addEventListener('input', () => {
      updateColorPreviews();
      document.documentElement.style.setProperty('--pixel-success', nameColorPicker.value);
    });
  }

  if (buttonColorPicker) {
    buttonColorPicker.addEventListener('input', () => {
      updateColorPreviews();
      document.documentElement.style.setProperty('--pixel-accent', buttonColorPicker.value);
    });
  }

  if (buttonTextColorPicker) {
    buttonTextColorPicker.addEventListener('input', () => {
      updateColorPreviews();
      document.documentElement.style.setProperty('--pixel-btn-text', buttonTextColorPicker.value);
    });
  }

  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', () => {
      updateColorPreviews();
      document.documentElement.style.setProperty('--pixel-bg', bgColorPicker.value);
    });
  }

  if (panelColorPicker) {
    panelColorPicker.addEventListener('input', () => {
      updateColorPreviews();
      document.documentElement.style.setProperty('--pixel-panel', panelColorPicker.value);
    });
  }

  if (bgImageUrl) {
    bgImageUrl.addEventListener('input', () => updateColorPreviews());
  }

  if (bgImageUpload) {
    bgImageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (bgImageUrl) bgImageUrl.value = event.target.result;
          updateColorPreviews();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (clearBgImageBtn) {
    clearBgImageBtn.addEventListener('click', () => {
      if (bgImageUrl) bgImageUrl.value = '';
      updateColorPreviews();
    });
  }

  if (uiOpacitySlider) {
    uiOpacitySlider.addEventListener('input', () => {
      updateOpacityValues();
      document.documentElement.style.setProperty('--ui-opacity', uiOpacitySlider.value);
    });
  }

  if (buttonOpacitySlider) {
    buttonOpacitySlider.addEventListener('input', () => {
      updateOpacityValues();
      document.documentElement.style.setProperty('--button-opacity', buttonOpacitySlider.value);
    });
  }

  if (textOpacitySlider) {
    textOpacitySlider.addEventListener('input', () => {
      updateOpacityValues();
      document.documentElement.style.setProperty('--text-opacity', textOpacitySlider.value);
    });
  }

  if (showAvatarsToggle) {
    showAvatarsToggle.addEventListener('change', () => {
      const show = showAvatarsToggle.checked;
      document.documentElement.style.setProperty('--show-avatars', show ? 'block' : 'none');
    });
  }

  if (saveColorsBtn) {
    saveColorsBtn.addEventListener('click', () => {
      const colors = {
        nameColor: nameColorPicker?.value || '#4cc9f0',
        buttonColor: buttonColorPicker?.value || '#e94560',
        buttonTextColor: buttonTextColorPicker?.value || '#ffffff',
        bgColor: bgColorPicker?.value || '#1a1a2e',
        panelColor: panelColorPicker?.value || '#16213e',
        bgImage: bgImageUrl?.value || '',
        uiOpacity: uiOpacitySlider?.value || '1',
        buttonOpacity: buttonOpacitySlider?.value || '1',
        textOpacity: textOpacitySlider?.value || '1',
        showAvatars: showAvatarsToggle?.checked !== false
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
      
      document.documentElement.style.setProperty('--ui-opacity', colors.uiOpacity);
      document.documentElement.style.setProperty('--button-opacity', colors.buttonOpacity);
      document.documentElement.style.setProperty('--text-opacity', colors.textOpacity);
      document.documentElement.style.setProperty('--show-avatars', colors.showAvatars ? 'block' : 'none');
      
      addSystemMessage('💾 Colors saved!');
      playSystemSound('send');
    });
  }

  if (resetColorsBtn) {
    resetColorsBtn.addEventListener('click', () => {
      if (nameColorPicker) nameColorPicker.value = '#4cc9f0';
      if (buttonColorPicker) buttonColorPicker.value = '#e94560';
      if (buttonTextColorPicker) buttonTextColorPicker.value = '#ffffff';
      if (bgColorPicker) bgColorPicker.value = '#1a1a2e';
      if (panelColorPicker) panelColorPicker.value = '#16213e';
      if (bgImageUrl) bgImageUrl.value = '';
      if (uiOpacitySlider) uiOpacitySlider.value = '1';
      if (buttonOpacitySlider) buttonOpacitySlider.value = '1';
      if (textOpacitySlider) textOpacitySlider.value = '1';
      if (showAvatarsToggle) showAvatarsToggle.checked = true;
      updateColorPreviews();
      updateOpacityValues();
      
      document.documentElement.style.setProperty('--pixel-success', '#4cc9f0');
      document.documentElement.style.setProperty('--pixel-accent', '#e94560');
      document.documentElement.style.setProperty('--pixel-btn-text', '#ffffff');
      document.documentElement.style.setProperty('--pixel-bg', '#1a1a2e');
      document.documentElement.style.setProperty('--pixel-panel', '#16213e');
      document.documentElement.style.setProperty('--ui-opacity', '1');
      document.documentElement.style.setProperty('--button-opacity', '1');
      document.documentElement.style.setProperty('--text-opacity', '1');
      document.documentElement.style.setProperty('--show-avatars', 'block');
      document.body.style.backgroundImage = '';
      
      localStorage.removeItem('pixelChatColors');
      addSystemMessage('🔄 Colors reset!');
      playSystemSound('send');
    });
  }

  if (backToStartCustomizeBtn) {
    backToStartCustomizeBtn.addEventListener('click', () => showScreen(startScreen));
  }

  // ===== TABS =====
  tabBtns.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      showPanel(`${tabName}-panel`);
      
      if (tabName !== 'threads') {
        if (threadView) threadView.classList.add('hidden');
        if (threadsList) threadsList.classList.remove('hidden');
        currentThread = null;
      }
      if (tabName !== 'dms') {
        if (dmChat) dmChat.classList.add('hidden');
        if (dmUsersList) dmUsersList.classList.remove('hidden');
        currentDM = null;
      }
    });
  });

  // ===== CHAT =====
  if (leaveBtn) {
    leaveBtn.addEventListener('click', () => {
      if (currentRoom) {
        addSystemMessage('🔌 Disconnected');
        showScreen(startScreen);
        currentRoom = null;
        if (messagesEl) messagesEl.innerHTML = '';
        if (userListEl) userListEl.innerHTML = '';
        if (userCountEl) userCountEl.textContent = '0';
        clearReply();
        clearImagePreview();
        if (soundboardPanel) soundboardPanel.classList.add('hidden');
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
    
    socket.emit('chatMessage', {
      roomName: currentRoom,
      username: myUsername,
      message,
      image,
      replyTo: pendingReply,
      avatar: myAvatar
    });
    
    addMessage({
      roomName: currentRoom,
      username: myUsername,
      message,
      image,
      replyTo: pendingReply,
      id: Date.now() + '-local',
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id,
      reactions: {},
      avatar: myAvatar
    }, true);
    
    messageInput.value = '';
    clearImagePreview();
    clearReply();
    
    if (isTyping) {
      isTyping = false;
      socket.emit('typing', { roomName: currentRoom, username: myUsername, isTyping: false });
    }
    
    playSystemSound('send');
    if (sendBtn) {
      const rect = sendBtn.getBoundingClientRect();
      createParticles(rect.left + rect.offsetWidth/2, rect.top, 10, '#e94560');
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
      playSystemSound('error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      addSystemMessage('⚠️ Image too large (max 50MB)');
      playSystemSound('error');
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

  // ===== AVATAR UPLOAD =====
  function uploadAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          addSystemMessage('⚠️ Avatar too large (max 5MB)');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          myAvatar = event.target.result;
          socket.emit('updateAvatar', { avatar: myAvatar });
          addSystemMessage('✅ Avatar updated!');
          updateUserList(Array.from(usersMap.values()));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  // ===== REPLY =====
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

  // ===== SOUNDBOARD =====
  if (soundboardBtn) {
    soundboardBtn.addEventListener('click', () => {
      if (soundboardPanel) {
        soundboardPanel.classList.toggle('hidden');
      }
    });
  }

  soundButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const soundId = btn.dataset.sound;
      if (soundId && currentRoom) {
        playSound(soundId);
        socket.emit('playSound', { roomName: currentRoom, soundId, username: myUsername });
      }
    });
  });

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      window.audioEnabled = !window.audioEnabled;
      soundToggleBtn.textContent = window.audioEnabled ? '🔊' : '🔇';
      addSystemMessage(window.audioEnabled ? '🔊 Sound ENABLED' : '🔇 Sound DISABLED');
    });
  }

  // ===== PROFILE MODAL =====
  if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', closeProfileModal);
  }

  if (setModBtn) {
    setModBtn.addEventListener('click', () => {
      if (selectedUser && currentRoom) {
        socket.emit('setModerator', { roomName: currentRoom, targetUser: selectedUser.username });
        closeProfileModal();
      }
    });
  }

  if (kickBtn) {
    kickBtn.addEventListener('click', () => {
      if (selectedUser && currentRoom) {
        socket.emit('kickUser', { roomName: currentRoom, targetUser: selectedUser.username });
        closeProfileModal();
      }
    });
  }

  if (banBtn) {
    banBtn.addEventListener('click', () => {
      if (selectedUser && currentRoom) {
        socket.emit('banUser', { roomName: currentRoom, targetUser: selectedUser.username });
        closeProfileModal();
      }
    });
  }

  if (unbanBtn) {
    unbanBtn.addEventListener('click', () => {
      if (selectedUser && currentRoom) {
        socket.emit('unbanUser', { roomName: currentRoom, targetUser: selectedUser.username });
        closeProfileModal();
      }
    });
  }

  if (modKickBtn) {
    modKickBtn.addEventListener('click', () => {
      if (selectedUser && currentRoom) {
        socket.emit('kickUser', { roomName: currentRoom, targetUser: selectedUser.username });
        closeProfileModal();
      }
    });
  }

  // ===== ROOM CONTROLS =====
  if (deleteRoomBtn) {
    deleteRoomBtn.addEventListener('click', () => {
      if (currentRoom && myRole === 'owner') {
        if (confirm('Are you sure you want to delete this room? This cannot be undone!')) {
          socket.emit('deleteRoom', { roomName: currentRoom });
          closeRoomControlsModal();
        }
      }
    });
  }

  if (viewBannedBtn) {
    viewBannedBtn.addEventListener('click', () => {
      socket.emit('getBannedUsers', { roomName: currentRoom });
    });
  }

  if (closeRoomControlsBtn) {
    closeRoomControlsBtn.addEventListener('click', closeRoomControlsModal);
  }

  // ===== THREADS =====
  if (closeThreadBtn) {
    closeThreadBtn.addEventListener('click', () => {
      threadView.classList.add('hidden');
      threadsList.classList.remove('hidden');
      currentThread = null;
    });
  }

  if (sendThreadBtn) {
    sendThreadBtn.addEventListener('click', sendThreadMessage);
  }

  if (threadMessageInput) {
    threadMessageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendThreadMessage();
    });
  }

  function sendThreadMessage() {
    if (!currentThread || !threadMessageInput) return;
    
    const message = threadMessageInput.value.trim();
    if (!message) return;
    
    socket.emit('threadMessage', {
      threadId: currentThread.id,
      username: myUsername,
      message
    });
    
    threadMessageInput.value = '';
  }

  // ===== DMS =====
  if (closeDmBtn) {
    closeDmBtn.addEventListener('click', () => {
      dmChat.classList.add('hidden');
      dmUsersList.classList.remove('hidden');
      currentDM = null;
    });
  }

  if (sendDmBtn) {
    sendDmBtn.addEventListener('click', sendDM);
  }

  if (dmMessageInput) {
    dmMessageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendDM();
    });
  }

  function sendDM() {
    if (!currentDM || !dmMessageInput) return;
    
    const message = dmMessageInput.value.trim();
    if (!message) return;
    
    const messageId = Date.now() + '-dm-' + Math.random().toString(36).substr(2, 9);
    sentDMMessages.add(messageId);
    
    socket.emit('privateMessage', {
      toUserId: currentDM.userId,
      fromUsername: myUsername,
      message,
      messageId
    });
    
    addDMMessage({
      from: mySocketId,
      fromUsername: myUsername,
      message,
      timestamp: new Date().toLocaleTimeString(),
      id: messageId
    });
    
    dmMessageInput.value = '';
  }

  // ===== SOCKET EVENTS =====
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
    addSystemMessage('⚠️ Connection error. Refresh page.');
  });

  socket.on('joinedRoom', ({ roomName, users, socketId, isHost: hostStatus, role }) => {
    console.log('✅ Joined room:', roomName);
    mySocketId = socketId;
    isHost = hostStatus;
    myRole = role || (isHost ? 'owner' : 'member');
    
    if (roomDisplay) roomDisplay.textContent = roomName;
    
    // ✅ FIXED: Clear usersMap properly
    usersMap.clear();
    
    // ✅ FIXED: users is an array from server
    if (Array.isArray(users)) {
      users.forEach(u => {
        usersMap.set(u.id, u);
      });
    }
    
    updateUserList(users);
    showScreen(chatScreen);
    addSystemMessage(`🎮 Connected to ${roomName}${myRole === 'owner' ? ' (OWNER)' : myRole === 'mod' ? ' (MOD)' : ''}`);
    if (messageInput) messageInput.focus();
    playSystemSound('join');
    showServerURL();
  });

  socket.on('chatMessage', (data) => {
    console.log('📥 Received message:', data.username);
    if (data.avatar) {
      if (!usersMap.has(data.senderId)) {
        usersMap.set(data.senderId, { id: data.senderId, username: data.username, avatar: data.avatar });
      } else {
        usersMap.get(data.senderId).avatar = data.avatar;
      }
    }
    addMessage(data, false);
    scrollToBottom();
    playSystemSound('receive');
  });

  socket.on('systemMessage', ({ text }) => {
    addSystemMessage(text);
    scrollToBottom();
  });

  socket.on('updateUsers', (usersList) => {
    usersMap.clear();
    usersList.forEach(u => {
      usersMap.set(u.id, u);
    });
    updateUserList(usersList);
    updateDMUsersList(usersList);
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
    playSystemSound('error');
  });

  socket.on('userKicked', () => {
    addSystemMessage('👢 You have been kicked from the room');
    showScreen(startScreen);
    currentRoom = null;
  });

  socket.on('userBanned', () => {
    addSystemMessage('🚫 You have been banned from the room');
    showScreen(startScreen);
    currentRoom = null;
  });

  socket.on('roomDeleted', () => {
    addSystemMessage('🗑️ Room has been deleted by owner');
    showScreen(startScreen);
    currentRoom = null;
  });

  socket.on('bannedUsersList', ({ bannedUsers }) => {
    addSystemMessage(`🚫 Banned users: ${bannedUsers.join(', ') || 'None'}`);
  });

  socket.on('moderatorSet', ({ username }) => {
    addSystemMessage(`⭐ ${username} is now a moderator!`);
  });

  socket.on('threadCreated', ({ threadId, threadName, createdBy }) => {
    threads.set(threadId, { id: threadId, name: threadName, messages: [] });
    addSystemMessage(`🧵 ${createdBy} created thread: ${threadName}`);
    updateThreadsList();
    if (threadsTab) threadsTab.classList.remove('hidden');
  });

  socket.on('threadMessage', (data) => {
    if (currentThread && currentThread.id === data.threadId) {
      addThreadMessage(data);
    }
  });

  socket.on('threadMessages', ({ threadId, messages }) => {
    if (currentThread && currentThread.id === threadId) {
      threadMessagesEl.innerHTML = '';
      messages.forEach(msg => addThreadMessage(msg));
    }
  });

  socket.on('privateMessage', (data) => {
    if (data.messageId && sentDMMessages.has(data.messageId)) {
      return;
    }
    
    if (currentDM && (data.from === currentDM.userId || data.to === mySocketId)) {
      addDMMessage(data);
      playSystemSound('receive');
    } else {
      addSystemMessage(`📩 New DM from ${data.fromUsername}`);
    }
  });

  socket.on('dmHistory', ({ userId, messages }) => {
    if (currentDM && currentDM.userId === userId) {
      dmMessagesEl.innerHTML = '';
      messages.forEach(msg => addDMMessage(msg));
    }
  });

  socket.on('playSound', ({ soundId, username }) => {
    playSound(soundId);
    addSystemMessage(`🔊 ${username} played ${soundId}`);
  });

  socket.on('avatarUpdated', ({ userId, avatar }) => {
    if (usersMap.has(userId)) {
      usersMap.get(userId).avatar = avatar;
      updateUserList(Array.from(usersMap.values()));
    }
  });

  // ===== HELPERS =====
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
    
    const user = usersMap.get(data.senderId);
    const avatar = data.avatar || (user ? user.avatar : null);
    
    let avatarHtml = '';
    if (avatar) {
      avatarHtml = `<div class="avatar"><img src="${avatar}" alt="avatar" /></div>`;
    } else {
      avatarHtml = `<div class="avatar"><div class="avatar-placeholder">👤</div></div>`;
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
      ${avatarHtml}
      <div class="content">
        <span class="meta"><span class="username" onclick="openProfileFromMessage('${data.username}', '${data.senderId}')">${escapeHtml(data.username)}</span><span class="time">[${data.timestamp}]</span></span>
        ${content}
        <span class="add-reaction-btn" title="Add Reaction">😊</span>
        <span class="create-thread-btn" title="Create Thread">🧵</span>
      </div>
    `;
    
    const threadBtn = msgEl.querySelector('.create-thread-btn');
    if (threadBtn) {
      threadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const threadName = prompt('Thread name:', `Thread about "${data.message.substring(0, 30)}..."`);
        if (threadName && currentRoom) {
          socket.emit('createThread', {
            roomName: currentRoom,
            parentMessageId: data.id,
            threadName,
            username: myUsername
          });
        }
      });
    }
    
    const reactionBtn = msgEl.querySelector('.add-reaction-btn');
    if (reactionBtn) {
      reactionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedMessageId = data.id;
        socket.emit('addReaction', {
          roomName: currentRoom,
          messageId: data.id,
          emoji: '👍',
          username: myUsername
        });
      });
    }
    
    messagesEl.appendChild(msgEl);
  }

  window.openProfileFromMessage = function(username, userId) {
    const user = usersMap.get(userId) || { username, id: userId };
    openProfileModal(user);
  };

  function addSystemMessage(text) {
    if (!messagesEl) return;
    const msgEl = document.createElement('div');
    msgEl.className = 'message system new';
    setTimeout(() => msgEl.classList.remove('new'), 500);
    msgEl.innerHTML = `<span class="text">${escapeHtml(text)}</span>`;
    messagesEl.appendChild(msgEl);
  }

  function updateUserList(usersList) {
    if (!userListEl) return;
    userListEl.innerHTML = '';
    const seen = new Set();
    usersList.forEach(user => {
      if (seen.has(user.username)) return;
      seen.add(user.username);
      const li = document.createElement('li');
      
      let avatarHtml = '';
      if (user.avatar) {
        avatarHtml = `<div class="user-avatar"><img src="${user.avatar}" alt="avatar" /></div>`;
      } else {
        avatarHtml = `<div class="user-avatar"><div class="user-avatar-placeholder">👤</div></div>`;
      }
      
      li.innerHTML = `
        ${avatarHtml}
        <span class="username-text">${user.username}</span>
        ${user.role === 'owner' ? '<span class="user-role owner">👑</span>' : ''}
        ${user.role === 'mod' ? '<span class="user-role mod">🛡️</span>' : ''}
        ${user.isBanned ? '<span class="user-role banned">🚫</span>' : ''}
      `;
      
      li.addEventListener('click', () => {
        if (user.id !== mySocketId) {
          openProfileModal(user);
        } else {
          uploadAvatar();
        }
      });
      
      userListEl.appendChild(li);
    });
    
    if (userCountEl) userCountEl.textContent = usersList.length;
  }

  function updateDMUsersList(usersList) {
    if (!dmUsersList) return;
    dmUsersList.innerHTML = '';
    
    usersList.forEach(user => {
      if (user.id === mySocketId) return;
      
      const item = document.createElement('div');
      item.className = 'dm-user-item';
      item.textContent = `📩 ${user.username}`;
      item.addEventListener('click', () => openDM(user.id, user.username));
      dmUsersList.appendChild(item);
    });
  }

  function openDM(userId, username) {
    currentDM = { userId, username };
    dmUsernameEl.textContent = username;
    dmChat.classList.remove('hidden');
    dmUsersList.classList.add('hidden');
    sentDMMessages.clear();
    socket.emit('getDMHistory', { userId });
  }

  function addDMMessage(data) {
    if (!dmMessagesEl) return;
    
    if (data.id && sentDMMessages.has(data.id)) {
      return;
    }
    if (data.id) sentDMMessages.add(data.id);
    
    const msgEl = document.createElement('div');
    msgEl.className = 'message';
    if (data.from === mySocketId) {
      msgEl.classList.add('self');
      msgEl.style.borderColor = 'var(--pixel-accent)';
    }
    
    msgEl.innerHTML = `
      <span class="meta"><span class="username">${escapeHtml(data.fromUsername)}</span><span class="time">[${data.timestamp}]</span></span>
      <span class="text">${escapeHtml(data.message)}</span>
    `;
    
    dmMessagesEl.appendChild(msgEl);
    scrollToBottom();
  }

  function updateThreadsList() {
    if (!threadsList) return;
    threadsList.innerHTML = '';
    
    threads.forEach((thread, threadId) => {
      const item = document.createElement('div');
      item.className = 'thread-item';
      item.innerHTML = `🧵 ${thread.name}`;
      item.addEventListener('click', () => openThread(threadId, thread.name));
      threadsList.appendChild(item);
    });
  }

  function openThread(threadId, threadName) {
    currentThread = { id: threadId, name: threadName };
    threadNameEl.textContent = threadName;
    threadView.classList.remove('hidden');
    threadsList.classList.add('hidden');
    socket.emit('joinThread', { threadId });
  }

  function addThreadMessage(data) {
    if (!threadMessagesEl) return;
    
    const msgEl = document.createElement('div');
    msgEl.className = 'message';
    if (data.senderId === socket.id) {
      msgEl.classList.add('self');
      msgEl.style.borderColor = 'var(--pixel-accent)';
    }
    
    msgEl.innerHTML = `
      <span class="meta"><span class="username">${escapeHtml(data.username)}</span><span class="time">[${data.timestamp}]</span></span>
      <span class="text">${escapeHtml(data.message)}</span>
    `;
    
    threadMessagesEl.appendChild(msgEl);
    threadMessagesEl.scrollTop = threadMessagesEl.scrollHeight;
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    if (dmMessagesEl) dmMessagesEl.scrollTop = dmMessagesEl.scrollHeight;
    if (threadMessagesEl) threadMessagesEl.scrollTop = threadMessagesEl.scrollHeight;
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

  // ===== SERVER URL =====
  function showServerURL() {
    if (serverUrlEl && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      serverUrlEl.textContent = `🌐 ${window.location.origin}`;
    }
  }

  // ===== INIT =====
  console.log('🎮 Pixel Chat Ready!');
  console.log('🔌 Socket:', socket.connected ? 'Connected' : 'Disconnected');
  console.log('🧵 Threads: Enabled');
  console.log('📩 DMs: Enabled');
  console.log('🎵 Soundboard: Enabled');
  console.log('👤 Profiles: Enabled');
  console.log('🛡️ Admin Controls: Enabled');
  showServerURL();
  
  if (usernameInput) usernameInput.focus();

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });
});