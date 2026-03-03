// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Pixel Chat Ultimate Loading...');
  
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
  const saveColorsBtn = document.getElementById('save-colors-btn');
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
  const hostBadge = document.getElementById('host-badge');
  const reactionPicker = document.getElementById('reaction-picker');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const mainChatPanel = document.getElementById('main-chat-panel');
  const threadsPanel = document.getElementById('threads-panel');
  const dmsPanel = document.getElementById('dms-panel');
  const threadsTab = document.getElementById('threads-tab');
  const dmsTab = document.getElementById('dms-tab');

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

  // Voice Chat
  const voiceChatBtn = document.getElementById('voice-chat-btn');
  const voicePanel = document.getElementById('voice-panel');
  const voiceParticipantsEl = document.getElementById('voice-participants');
  const toggleMicBtn = document.getElementById('toggle-mic-btn');
  const leaveVoiceBtn = document.getElementById('leave-voice-btn');
  const voiceModal = document.getElementById('voice-modal');
  const cancelVoiceBtn = document.getElementById('cancel-voice-btn');

  // Soundboard
  const soundButtons = document.querySelectorAll('.sound-btn');

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
  const threads = new Map();
  let currentThread = null;
  const dmUsers = new Map();
  let currentDM = null;
  
  // Voice Chat State
  let localStream = null;
  let peerConnections = new Map();
  let isMicMuted = false;
  let isInVoiceChat = false;

  // ===== AUDIO SYSTEM =====
  window.audioContext = null;
  window.audioEnabled = false;

  // Sound effects library (base64 or Web Audio API)
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
      case 'voice':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  }

  // ===== PARTICLE/VFX EFFECTS =====
  function createParticles(x, y, count = 10, color = null) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 30 + Math.random() * 50;
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance - 30}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      if (color) {
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
      }
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  }

  function createRipple(element, event) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(233, 69, 96, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size/2}px`;
    ripple.style.top = `${event.clientY - rect.top - size/2}px`;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // Add ripple CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

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

  function showPanel(panelId) {
    document.querySelectorAll('.chat-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const panel = document.getElementById(panelId);
    const tab = document.querySelector(`[data-tab="${panelId.replace('-panel', '')}"]`);
    
    if (panel) panel.classList.add('active');
    if (tab) tab.classList.add('active');
  }

  // ===== START MENU BUTTONS =====
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', (e) => {
      console.log('🚪 Join Room clicked');
      initAudio();
      createRipple(e.target, e);
      roomTitle.textContent = 'JOIN ROOM';
      showScreen(roomScreen);
      usernameInput?.focus();
    });
  }

  if (hostRoomBtn) {
    hostRoomBtn.addEventListener('click', (e) => {
      console.log('🏠 Host Room clicked');
      initAudio();
      createRipple(e.target, e);
      roomTitle.textContent = 'HOST ROOM';
      showScreen(roomScreen);
      usernameInput?.focus();
    });
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', (e) => {
      console.log('🎨 Customize clicked');
      initAudio();
      createRipple(e.target, e);
      loadColorPreviews();
      showScreen(customizeScreen);
    });
  }

  // ===== ROOM SCREEN BUTTONS =====
  if (enterRoomBtn) {
    enterRoomBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      attemptEnterRoom();
    });
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
    playSystemSound('join');
    showServerURL();
  }

  // ===== CUSTOMIZE SCREEN =====
  function loadColorPreviews() {
    // Load from localStorage or defaults
    const savedColors = localStorage.getItem('pixelChatColors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      if (nameColorPicker) nameColorPicker.value = colors.nameColor || '#4cc9f0';
      if (buttonColorPicker) buttonColorPicker.value = colors.buttonColor || '#e94560';
      if (bgColorPicker) bgColorPicker.value = colors.bgColor || '#1a1a2e';
    }
  }

  if (nameColorPicker) {
    nameColorPicker.addEventListener('input', () => {
      document.documentElement.style.setProperty('--pixel-success', nameColorPicker.value);
    });
  }

  if (buttonColorPicker) {
    buttonColorPicker.addEventListener('input', () => {
      document.documentElement.style.setProperty('--pixel-accent', buttonColorPicker.value);
    });
  }

  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', () => {
      document.documentElement.style.setProperty('--pixel-bg', bgColorPicker.value);
    });
  }

  if (saveColorsBtn) {
    saveColorsBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      const colors = {
        nameColor: nameColorPicker?.value || '#4cc9f0',
        buttonColor: buttonColorPicker?.value || '#e94560',
        bgColor: bgColorPicker?.value || '#1a1a2e',
        panelColor: '#16213e'
      };
      localStorage.setItem('pixelChatColors', JSON.stringify(colors));
      addSystemMessage('💾 Colors saved!');
      playSystemSound('send');
    });
  }

  if (backToStartCustomizeBtn) {
    backToStartCustomizeBtn.addEventListener('click', () => showScreen(startScreen));
  }

  // ===== TABS =====
  tabBtns.forEach(tab => {
    tab.addEventListener('click', (e) => {
      createRipple(e.target, e);
      const tabName = tab.dataset.tab;
      showPanel(`${tabName}-panel`);
      
      // Hide thread/DM views when switching tabs
      if (tabName !== 'threads') {
        threadView.classList.add('hidden');
        threadsList.classList.remove('hidden');
        currentThread = null;
      }
      if (tabName !== 'dms') {
        dmChat.classList.add('hidden');
        dmUsersList.classList.remove('hidden');
        currentDM = null;
      }
    });
  });

  // ===== CHAT SCREEN =====
  if (leaveBtn) {
    leaveBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      if (currentRoom) {
        // Leave voice chat if active
        if (isInVoiceChat) {
          leaveVoiceChat();
        }
        addSystemMessage('🔌 Disconnected');
        showScreen(startScreen);
        currentRoom = null;
        if (messagesEl) messagesEl.innerHTML = '';
        if (userListEl) userListEl.innerHTML = '';
        if (userCountEl) userCountEl.textContent = '0';
        clearReply();
        clearImagePreview();
        if (hostBadge) hostBadge.classList.add('hidden');
        if (voicePanel) voicePanel.classList.add('hidden');
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
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
    
    console.log('📤 Emitting chatMessage');
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
    
    playSystemSound('send');
    if (sendBtn) {
      const rect = sendBtn.getBoundingClientRect();
      createParticles(rect.left + rect.offsetWidth/2, rect.top, 15, '#e94560');
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
    soundToggleBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      initAudio();
      window.audioEnabled = !window.audioEnabled;
      soundToggleBtn.textContent = window.audioEnabled ? '🔊' : '🔇';
      soundToggleBtn.title = window.audioEnabled ? 'Sound ON' : 'Sound OFF';
      addSystemMessage(window.audioEnabled ? '🔊 Sound ENABLED' : '🔇 Sound DISABLED');
    });
  }

  // ===== VOICE CHAT (WebRTC) =====
  if (voiceChatBtn) {
    voiceChatBtn.addEventListener('click', async (e) => {
      createRipple(e.target, e);
      initAudio();
      await startVoiceChat();
    });
  }

  if (toggleMicBtn) {
    toggleMicBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      toggleMic();
    });
  }

  if (leaveVoiceBtn) {
    leaveVoiceBtn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      leaveVoiceChat();
    });
  }

  if (cancelVoiceBtn) {
    cancelVoiceBtn.addEventListener('click', () => {
      voiceModal.classList.add('hidden');
    });
  }

  async function startVoiceChat() {
    if (isInVoiceChat) return;
    
    voiceModal.classList.remove('hidden');
    
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      isInVoiceChat = true;
      
      if (voicePanel) voicePanel.classList.remove('hidden');
      voiceModal.classList.add('hidden');
      
      playSystemSound('voice');
      addSystemMessage('🎤 Voice chat connected!');
      
      // Notify others
      socket.emit('voiceJoin', { roomName: currentRoom, username: myUsername });
      
      // Add self to participants
      updateVoiceParticipants([{ username: myUsername, isSelf: true, isSpeaking: false }]);
      
    } catch (err) {
      console.error('❌ Voice chat error:', err);
      voiceModal.classList.add('hidden');
      addSystemMessage('⚠️ Could not access microphone');
      playSystemSound('error');
    }
  }

  function toggleMic() {
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      isMicMuted = !isMicMuted;
      audioTrack.enabled = !isMicMuted;
      toggleMicBtn.textContent = isMicMuted ? '🎤 Unmute' : '🎤 Mute';
      addSystemMessage(isMicMuted ? '🔇 Microphone muted' : '🔊 Microphone unmuted');
    }
  }

  function leaveVoiceChat() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    
    peerConnections.forEach(pc => pc.close());
    peerConnections.clear();
    
    isInVoiceChat = false;
    isMicMuted = false;
    
    if (voicePanel) voicePanel.classList.add('hidden');
    if (toggleMicBtn) toggleMicBtn.textContent = '🎤 Mute';
    
    addSystemMessage('🎤 Left voice chat');
    socket.emit('voiceLeave', { roomName: currentRoom });
  }

  // Soundboard
  soundButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      createRipple(e.target, e);
      const soundId = btn.dataset.sound;
      if (soundId && currentRoom) {
        playSound(soundId);
        socket.emit('playSound', { roomName: currentRoom, soundId, username: myUsername });
        
        // Visual feedback
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => btn.style.transform = '', 100);
      }
    });
  });

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
    
    socket.emit('privateMessage', {
      toUserId: currentDM.userId,
      fromUsername: myUsername,
      message
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
    playSystemSound('join');
    showServerURL();
  });

  socket.on('chatMessage', (data) => {
    console.log('📥 Received message:', data.username);
    addMessage(data, false);
    scrollToBottom();
    playSystemSound('receive');
    if (messagesEl) {
      const rect = messagesEl.getBoundingClientRect();
      createParticles(rect.right - 20, rect.bottom - 50, 8, '#4cc9f0');
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
    updateDMUsersList(users);
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

  // Thread events
  socket.on('threadCreated', ({ threadId, threadName, parentMessageId, createdBy }) => {
    threads.set(threadId, { id: threadId, name: threadName, messages: [] });
    addSystemMessage(`🧵 ${createdBy} created thread: ${threadName}`);
    updateThreadsList();
  });

  socket.on('threadMessage', (data) => {
    if (currentThread && currentThread.id === data.threadId) {
      addThreadMessage(data);
    }
  });

  socket.on('threadMessages', (messages) => {
    if (currentThread) {
      threadMessagesEl.innerHTML = '';
      messages.forEach(msg => addThreadMessage(msg));
    }
  });

  // DM events
  socket.on('privateMessage', (data) => {
    if (currentDM && (data.from === currentDM.userId || data.to === mySocketId)) {
      addDMMessage(data);
      playSystemSound('receive');
    } else {
      // Show notification
      addSystemMessage(`📩 New DM from ${data.fromUsername}`);
    }
  });

  socket.on('dmHistory', ({ userId, messages }) => {
    if (currentDM && currentDM.userId === userId) {
      dmMessagesEl.innerHTML = '';
      messages.forEach(msg => addDMMessage(msg));
    }
  });

  // Soundboard events
  socket.on('playSound', ({ soundId, username }) => {
    playSound(soundId);
    addSystemMessage(`🔊 ${username} played ${soundId}`);
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
    
    // Add thread creation button on long press / context menu
    msgEl.innerHTML = `
      <span class="meta"><span class="username">${escapeHtml(data.username)}</span><span class="time">[${data.timestamp}]</span></span>
      ${content}
      <span class="add-reaction-btn">😊</span>
      <span class="create-thread-btn" title="Create Thread">🧵</span>
    `;
    
    // Thread creation
    const threadBtn = msgEl.querySelector('.create-thread-btn');
    if (threadBtn) {
      threadBtn.addEventListener('click', () => {
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
      li.dataset.userId = user.id;
      if (user.username === myUsername) li.classList.add('you');
      if (user.isHost) li.classList.add('host');
      
      // Click to DM
      li.addEventListener('click', () => {
        if (user.id !== mySocketId) {
          openDM(user.id, user.username);
        }
      });
      
      userListEl.appendChild(li);
    });
    
    if (userCountEl) userCountEl.textContent = users.length;
  }

  function updateDMUsersList(users) {
    if (!dmUsersList) return;
    dmUsersList.innerHTML = '';
    
    users.forEach(user => {
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
    
    // Request DM history
    socket.emit('getDMHistory', { userId });
  }

  function addDMMessage(data) {
    if (!dmMessagesEl) return;
    
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
    
    // Join thread and get messages
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

  function updateVoiceParticipants(participants) {
    if (!voiceParticipantsEl) return;
    voiceParticipantsEl.innerHTML = '';
    
    participants.forEach(p => {
      const div = document.createElement('div');
      div.className = `voice-participant${p.isSpeaking ? ' speaking' : ''}`;
      div.innerHTML = `${p.isSelf ? '🎤' : '👤'} ${p.username}`;
      voiceParticipantsEl.appendChild(div);
    });
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    if (dmMessagesEl) dmMessagesEl.scrollTop = dmMessagesEl.scrollHeight;
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
    lightbox.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:2000;cursor:zoom-out;';
    lightbox.innerHTML = `<img src="${img.src}" alt="zoomed" style="max-width:95vw;max-height:95vh;"/>`;
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
      console.log('🎨 Loaded saved colors from localStorage');
    } catch(e) {
      console.error('❌ Error loading saved colors:', e);
    }
  }

  // ===== INITIALIZATION =====
  console.log('🎮 Pixel Chat Ultimate Ready!');
  console.log('🔌 Socket.IO Status:', socket.connected ? 'Connected' : 'Disconnected');
  console.log('🧵 Threads: Enabled');
  console.log('📩 DMs: Enabled');
  console.log('🎤 Voice Chat: Enabled');
  console.log('🔊 Soundboard: Enabled');
  showServerURL();
  
  if (usernameInput) usernameInput.focus();

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });
});