document.addEventListener('DOMContentLoaded', () => {

  const socket = io();

  // ===== DOM REFS =====
  const startScreen     = document.getElementById('start-screen');
  const joinRoomBtn     = document.getElementById('join-room-btn');
  const hostRoomBtn     = document.getElementById('host-room-btn');
  const openDmsBtn      = document.getElementById('open-dms-btn');
  const customizeBtn    = document.getElementById('customize-btn');
  const serverUrlEl     = document.getElementById('server-url');

  const roomScreen     = document.getElementById('room-screen');
  const roomTitle      = document.getElementById('room-title');
  const usernameInput  = document.getElementById('username-input');
  const roomInput      = document.getElementById('room-input');
  const enterRoomBtn   = document.getElementById('enter-room-btn');
  const backToStartBtn = document.getElementById('back-to-start-btn');

  const customizeScreen        = document.getElementById('customize-screen');
  const nameColorPicker        = document.getElementById('name-color-picker');
  const buttonColorPicker      = document.getElementById('button-color-picker');
  const buttonTextColorPicker  = document.getElementById('button-text-color-picker');
  const bgColorPicker          = document.getElementById('bg-color-picker');
  const panelColorPicker       = document.getElementById('panel-color-picker');
  const bgImageUrl             = document.getElementById('bg-image-url');
  const bgImageUpload          = document.getElementById('bg-image-upload');
  const clearBgImageBtn        = document.getElementById('clear-bg-image-btn');
  const nameColorPreview       = document.getElementById('name-color-preview');
  const buttonColorPreview     = document.getElementById('button-color-preview');
  const buttonTextColorPreview = document.getElementById('button-text-color-preview');
  const bgColorPreview         = document.getElementById('bg-color-preview');
  const panelColorPreview      = document.getElementById('panel-color-preview');
  const bgImagePreview         = document.getElementById('bg-image-preview');
  const uiOpacitySlider        = document.getElementById('ui-opacity-slider');
  const buttonOpacitySlider    = document.getElementById('button-opacity-slider');
  const textOpacitySlider      = document.getElementById('text-opacity-slider');
  const showAvatarsToggle      = document.getElementById('show-avatars-toggle');
  const groqApiKeyInput        = document.getElementById('groq-api-key');
  const uiOpacityValue         = document.getElementById('ui-opacity-value');
  const buttonOpacityValue     = document.getElementById('button-opacity-value');
  const textOpacityValue       = document.getElementById('text-opacity-value');
  const saveColorsBtn          = document.getElementById('save-colors-btn');
  const resetColorsBtn         = document.getElementById('reset-colors-btn');
  const backToStartCustomizeBtn= document.getElementById('back-to-start-customize-btn');

  const chatScreen      = document.getElementById('chat-screen');
  const leaveBtn        = document.getElementById('leave-btn');
  const roomDisplay     = document.getElementById('room-display');
  const messagesEl      = document.getElementById('messages');
  const messageInput    = document.getElementById('message-input');
  const sendBtn         = document.getElementById('send-btn');
  const userListEl      = document.getElementById('user-list');
  const userCountEl     = document.getElementById('user-count');
  const imageUpload     = document.getElementById('image-upload');
  const replyPreview    = document.getElementById('reply-preview');
  const replyUsernameEl = document.getElementById('reply-username');
  const cancelReplyBtn  = document.getElementById('cancel-reply');
  const typingIndicator = document.getElementById('typing-indicator');
  const soundToggleBtn  = document.getElementById('sound-toggle');
  const soundboardBtn   = document.getElementById('soundboard-btn');
  const soundboardPanel = document.getElementById('soundboard-panel');
  const soundButtons    = document.querySelectorAll('.sound-btn');
  const minigameBtn     = document.getElementById('minigame-btn');

  const tabBtns    = document.querySelectorAll('.tab-btn');
  const threadsTab = document.getElementById('threads-tab');

  const threadsList        = document.getElementById('threads-list');
  const threadView         = document.getElementById('thread-view');
  const threadNameEl       = document.getElementById('thread-name');
  const threadMessagesEl   = document.getElementById('thread-messages');
  const threadMessageInput = document.getElementById('thread-message-input');
  const sendThreadBtn      = document.getElementById('send-thread-btn');
  const closeThreadBtn     = document.getElementById('close-thread-btn');

  const profileModal         = document.getElementById('profile-modal');
  const profileUsernameEl    = document.getElementById('profile-username');
  const profileAvatarImg     = document.getElementById('profile-avatar-img');
  const avatarPlaceholder    = document.getElementById('avatar-placeholder');
  const profileRoleEl        = document.getElementById('profile-role');
  const profileStatusEl      = document.getElementById('profile-status');
  const profileRoomsEl       = document.getElementById('profile-rooms');
  const profileMessagesEl    = document.getElementById('profile-messages');
  const closeProfileBtn      = document.getElementById('close-profile-btn');
  const ownerControls        = document.getElementById('owner-controls');
  const modControls          = document.getElementById('mod-controls');
  const setModBtn            = document.getElementById('set-mod-btn');
  const kickBtn              = document.getElementById('kick-btn');
  const banBtn               = document.getElementById('ban-btn');
  const unbanBtn             = document.getElementById('unban-btn');
  const modKickBtn           = document.getElementById('mod-kick-btn');
  const openDmFromProfileBtn = document.getElementById('open-dm-from-profile-btn');

  const roomControlsModal   = document.getElementById('room-controls-modal');
  const closeRoomControlsBtn= document.getElementById('close-room-controls-btn');
  const deleteRoomBtn       = document.getElementById('delete-room-btn');
  const viewBannedBtn       = document.getElementById('view-banned-btn');

  const contextMenu = document.getElementById('context-menu');

  // DM elements
  const dmListEl       = document.getElementById('dm-list');
  const dmConvEl       = document.getElementById('dm-conversation');
  const dmConvUsername = document.getElementById('dm-conv-username');
  const dmMessagesEl   = document.getElementById('dm-messages');
  const dmInput        = document.getElementById('dm-message-input');
  const dmSendBtn      = document.getElementById('dm-send-btn');
  const dmBackBtn      = document.getElementById('dm-back-btn');

  // ===== STATE =====
  let currentRoom = null, myUsername = null, mySocketId = null;
  let isHost = false, myRole = 'member';
  let pendingReply = null, pendingImage = null;
  let isTyping = false, typingTimer = null;
  let selectedUser = null, myAvatar = null;
  const threads = new Map(), usersMap = new Map();
  let currentThread = null;

  // Bot & commands
  const mutedUsers = new Set();
  let groqApiKey = '';
  let botPersona = 'helpful';
  const botPersonas = {
    helpful:     'You are a helpful, friendly assistant in a pixel-art chat room. Keep replies short.',
    sarcastic:   'You are a sarcastic chatbot. Respond with dry wit. Keep it short.',
    pirate:      'You are a pirate. Speak in pirate dialect with Arrr. Keep it short.',
    shakespeare: 'You speak like Shakespeare in Early Modern English. Keep it short.',
    robot:       'You are a robot. Respond in an overly literal, robotic way. Keep it short.',
    villain:     'You are a dramatic supervillain with evil flair. Keep it short.',
  };

  // DM state
  let activeDmUserId = null;
  const dmConversations = new Map();

  // Minigame state
  let activeGame = null;

  // ===== LOAD SAVED SETTINGS =====
  try {
    const saved = JSON.parse(localStorage.getItem('pixelChatColors') || '{}');
    if (saved.groqApiKey) {
      groqApiKey = saved.groqApiKey;
      if (groqApiKeyInput) groqApiKeyInput.value = saved.groqApiKey;
    }
  } catch(e) {}

  // ===== AUDIO =====
  window.audioContext = null;
  window.audioEnabled = false;

  function initAudio() {
    if (window.audioContext) return;
    try { window.audioContext = new (window.AudioContext || window.webkitAudioContext)(); window.audioEnabled = true; }
    catch(e) { window.audioEnabled = false; }
  }

  const soundEffects = {
    airhorn:{freq:[200,300,400],type:'sawtooth',duration:.5},
    bruh:   {freq:[150,100],    type:'square',  duration:.4},
    wow:    {freq:[400,600],    type:'sine',    duration:.3},
    laugh:  {freq:[500,400,300],type:'triangle',duration:.5},
    clap:   {freq:[800,600],    type:'square',  duration:.2},
    sad:    {freq:[300,200],    type:'sine',    duration:.6},
  };

  function playSound(type) {
    if (!window.audioEnabled || !window.audioContext) return;
    if (window.audioContext.state === 'suspended') window.audioContext.resume();
    const ctx = window.audioContext, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime, s = soundEffects[type] || {freq:[523],type:'square',duration:.15};
    osc.type = s.type;
    s.freq.forEach((f,i) => osc.frequency.setValueAtTime(f, now + i*.1));
    gain.gain.setValueAtTime(.3,now); gain.gain.exponentialRampToValueAtTime(.01, now+s.duration);
    osc.start(now); osc.stop(now+s.duration);
  }

  function playSystemSound(type) {
    if (!window.audioEnabled || !window.audioContext) return;
    const ctx = window.audioContext, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const presets = {
      send:    {type:'square',  freqs:[[523.25,now],[783.99,now+.05]], dur:.15, vol:.3},
      receive: {type:'square',  freqs:[[659.25,now],[523.25,now+.05]], dur:.12, vol:.25},
      join:    {type:'square',  freqs:[[392,now],[523.25,now+.1],[783.99,now+.2]], dur:.3, vol:.3},
      error:   {type:'sawtooth',freqs:[[150,now],[100,now+.15]], dur:.2, vol:.3, ramp:true},
    };
    const p = presets[type]; if (!p) return;
    osc.type = p.type;
    if (p.ramp) { osc.frequency.setValueAtTime(p.freqs[0][0],now); osc.frequency.linearRampToValueAtTime(p.freqs[1][0],now+.15); }
    else p.freqs.forEach(([f,t]) => osc.frequency.setValueAtTime(f,t));
    gain.gain.setValueAtTime(p.vol,now); gain.gain.exponentialRampToValueAtTime(.01,now+p.dur);
    osc.start(now); osc.stop(now+p.dur);
  }

  // ===== RIPPLE EFFECT =====
  function createRipple(x, y) {
    for (let i = 0; i < 3; i++) {
      const r = document.createElement('div');
      r.className = 'send-ripple';
      r.style.left = x + 'px'; r.style.top = y + 'px';
      r.style.animationDelay = (i * 0.12) + 's';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 900 + i*120);
    }
  }

  // ===== SCREENS & PANELS =====
  function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screen) screen.classList.add('active');
  }

  const TAB_TO_PANEL = { main:'main-chat-panel', dms:'dms-panel', threads:'threads-panel' };
  const PANEL_TO_TAB = { 'main-chat-panel':'main', 'dms-panel':'dms', 'threads-panel':'threads' };

  function showPanel(panelId) {
    document.querySelectorAll('.chat-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    const tab = document.querySelector('[data-tab="' + (PANEL_TO_TAB[panelId]||panelId.replace('-panel','')) + '"]');
    if (tab) tab.classList.add('active');
  }

  // ===== START MENU =====
  if (joinRoomBtn)  joinRoomBtn.addEventListener('click',  () => { initAudio(); if(roomTitle) roomTitle.textContent='JOIN ROOM'; isHost=false; showScreen(roomScreen); usernameInput?.focus(); });
  if (hostRoomBtn)  hostRoomBtn.addEventListener('click',  () => { initAudio(); if(roomTitle) roomTitle.textContent='HOST ROOM'; isHost=true;  showScreen(roomScreen); usernameInput?.focus(); });
  if (openDmsBtn)   openDmsBtn.addEventListener('click',   () => {
    initAudio();
    if (currentRoom) {
      showScreen(chatScreen);
      showPanel('dms-panel');
    } else {
      // Not in a room yet — go to chat screen's room select first
      addSystemMessage && addSystemMessage('💬 Join a room first to use DMs!');
      showScreen(roomScreen);
      if(roomTitle) roomTitle.textContent = 'JOIN ROOM';
      isHost = false;
    }
  });
  if (customizeBtn) customizeBtn.addEventListener('click', () => { initAudio(); loadColorPreviews(); showScreen(customizeScreen); });

  // ===== ROOM SCREEN =====
  if (enterRoomBtn)  enterRoomBtn.addEventListener('click', attemptEnterRoom);
  if (backToStartBtn) backToStartBtn.addEventListener('click', () => { showScreen(startScreen); if(usernameInput) usernameInput.value=''; if(roomInput) roomInput.value=''; });
  if (roomInput)     roomInput.addEventListener('keypress',    e => { if(e.key==='Enter') attemptEnterRoom(); });
  if (usernameInput) usernameInput.addEventListener('keypress', e => { if(e.key==='Enter') roomInput?.focus(); });

  function attemptEnterRoom() {
    initAudio();
    const username = usernameInput?.value.trim().toUpperCase() || ('GUEST'+Math.floor(Math.random()*999));
    const room     = roomInput?.value.trim().toUpperCase() || 'LOBBY';
    if (username.length < 2) { showInlineError('NAME TOO SHORT!'); return; }
    if (room.length     < 2) { showInlineError('ROOM CODE TOO SHORT!'); return; }
    myUsername = username; currentRoom = room;
    isHost = roomTitle ? roomTitle.textContent.includes('HOST') : isHost;
    socket.emit('joinRoom', { roomName:room, username, isHost, avatar:myAvatar });
    playSystemSound('join');
  }

  function showInlineError(msg) {
    let el = document.getElementById('inline-error');
    if (!el) {
      el = document.createElement('p'); el.id = 'inline-error';
      el.style.cssText = 'color:#e94560;font-family:inherit;font-size:8px;margin-top:8px;text-align:center;';
      document.querySelector('#room-screen .pixel-box')?.appendChild(el);
    }
    el.textContent = '⚠️ ' + msg;
    setTimeout(() => { if(el) el.textContent=''; }, 3000);
  }

  // ===== TABS =====
  tabBtns.forEach(btn => btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    showPanel(TAB_TO_PANEL[tabName] || (tabName+'-panel'));
    if (tabName !== 'threads') {
      if (threadView)  threadView.classList.add('hidden');
      if (threadsList) threadsList.classList.remove('hidden');
      currentThread = null;
    }
  }));

  // ===== CUSTOMIZE =====
  function loadColorPreviews() {
    try {
      const c = JSON.parse(localStorage.getItem('pixelChatColors') || '{}');
      if (nameColorPicker       && c.nameColor)       nameColorPicker.value       = c.nameColor;
      if (buttonColorPicker     && c.buttonColor)     buttonColorPicker.value     = c.buttonColor;
      if (buttonTextColorPicker && c.buttonTextColor) buttonTextColorPicker.value = c.buttonTextColor;
      if (bgColorPicker         && c.bgColor)         bgColorPicker.value         = c.bgColor;
      if (panelColorPicker      && c.panelColor)      panelColorPicker.value      = c.panelColor;
      if (bgImageUrl            && c.bgImage)         bgImageUrl.value            = c.bgImage;
      if (uiOpacitySlider       && c.uiOpacity)       uiOpacitySlider.value       = c.uiOpacity;
      if (buttonOpacitySlider   && c.buttonOpacity)   buttonOpacitySlider.value   = c.buttonOpacity;
      if (textOpacitySlider     && c.textOpacity)     textOpacitySlider.value     = c.textOpacity;
      if (showAvatarsToggle)    showAvatarsToggle.checked = c.showAvatars !== false;
      if (groqApiKeyInput       && c.groqApiKey)      groqApiKeyInput.value       = c.groqApiKey;
    } catch(e) {}
    updateColorPreviews(); updateOpacityValues();
  }

  function updateColorPreviews() {
    if (nameColorPreview)       nameColorPreview.style.background       = nameColorPicker?.value       || '#4cc9f0';
    if (buttonColorPreview)     buttonColorPreview.style.background     = buttonColorPicker?.value     || '#e94560';
    if (buttonTextColorPreview) buttonTextColorPreview.style.background = buttonTextColorPicker?.value || '#ffffff';
    if (bgColorPreview)         bgColorPreview.style.background         = bgColorPicker?.value         || '#1a1a2e';
    if (panelColorPreview)      panelColorPreview.style.background      = panelColorPicker?.value      || '#16213e';
    if (bgImagePreview && bgImageUrl?.value) bgImagePreview.style.backgroundImage = 'url(' + bgImageUrl.value + ')';
  }

  function updateOpacityValues() {
    if (uiOpacitySlider     && uiOpacityValue)     uiOpacityValue.textContent     = Math.round(uiOpacitySlider.value     * 100) + '%';
    if (buttonOpacitySlider && buttonOpacityValue) buttonOpacityValue.textContent = Math.round(buttonOpacitySlider.value * 100) + '%';
    if (textOpacitySlider   && textOpacityValue)   textOpacityValue.textContent   = Math.round(textOpacitySlider.value   * 100) + '%';
  }

  if (nameColorPicker)       nameColorPicker.addEventListener('input',       () => { updateColorPreviews(); document.documentElement.style.setProperty('--pixel-success',  nameColorPicker.value); });
  if (buttonColorPicker)     buttonColorPicker.addEventListener('input',     () => { updateColorPreviews(); document.documentElement.style.setProperty('--pixel-accent',   buttonColorPicker.value); });
  if (buttonTextColorPicker) buttonTextColorPicker.addEventListener('input', () => { updateColorPreviews(); document.documentElement.style.setProperty('--pixel-btn-text', buttonTextColorPicker.value); });
  if (bgColorPicker)         bgColorPicker.addEventListener('input',         () => { updateColorPreviews(); document.documentElement.style.setProperty('--pixel-bg',       bgColorPicker.value); });
  if (panelColorPicker)      panelColorPicker.addEventListener('input',      () => { updateColorPreviews(); document.documentElement.style.setProperty('--pixel-panel',    panelColorPicker.value); });
  if (bgImageUrl)            bgImageUrl.addEventListener('input',            updateColorPreviews);

  if (bgImageUpload) bgImageUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file?.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = ev => { if(bgImageUrl) bgImageUrl.value = ev.target.result; updateColorPreviews(); };
      r.readAsDataURL(file);
    }
  });
  if (clearBgImageBtn) clearBgImageBtn.addEventListener('click', () => { if(bgImageUrl) bgImageUrl.value=''; updateColorPreviews(); });

  if (uiOpacitySlider)     uiOpacitySlider.addEventListener('input',     () => { updateOpacityValues(); document.documentElement.style.setProperty('--ui-opacity',     uiOpacitySlider.value); });
  if (buttonOpacitySlider) buttonOpacitySlider.addEventListener('input', () => { updateOpacityValues(); document.documentElement.style.setProperty('--button-opacity', buttonOpacitySlider.value); });
  if (textOpacitySlider)   textOpacitySlider.addEventListener('input',   () => { updateOpacityValues(); document.documentElement.style.setProperty('--text-opacity',   textOpacitySlider.value); });
  if (showAvatarsToggle)   showAvatarsToggle.addEventListener('change',  () => document.documentElement.style.setProperty('--show-avatars', showAvatarsToggle.checked ? 'block' : 'none'));
  if (groqApiKeyInput)     groqApiKeyInput.addEventListener('input',     () => { groqApiKey = groqApiKeyInput.value.trim(); });

  if (saveColorsBtn) saveColorsBtn.addEventListener('click', () => {
    const c = {
      nameColor: nameColorPicker?.value || '#4cc9f0',
      buttonColor: buttonColorPicker?.value || '#e94560',
      buttonTextColor: buttonTextColorPicker?.value || '#ffffff',
      bgColor: bgColorPicker?.value || '#1a1a2e',
      panelColor: panelColorPicker?.value || '#16213e',
      bgImage: bgImageUrl?.value || '',
      uiOpacity: uiOpacitySlider?.value || '1',
      buttonOpacity: buttonOpacitySlider?.value || '1',
      textOpacity: textOpacitySlider?.value || '1',
      showAvatars: showAvatarsToggle?.checked !== false,
      groqApiKey: groqApiKeyInput?.value || '',
    };
    localStorage.setItem('pixelChatColors', JSON.stringify(c));
    groqApiKey = c.groqApiKey;
    if (c.bgImage) { document.body.style.backgroundImage='url('+c.bgImage+')'; document.body.style.backgroundSize='cover'; document.body.style.backgroundPosition='center'; document.body.style.backgroundAttachment='fixed'; }
    else document.body.style.backgroundImage='';
    document.documentElement.style.setProperty('--ui-opacity', c.uiOpacity);
    document.documentElement.style.setProperty('--button-opacity', c.buttonOpacity);
    document.documentElement.style.setProperty('--text-opacity', c.textOpacity);
    document.documentElement.style.setProperty('--show-avatars', c.showAvatars ? 'block' : 'none');
    addSystemMessage('💾 Settings saved! API key: ' + (c.groqApiKey ? '✅ set' : '❌ not set'));
    playSystemSound('send');
  });

  if (resetColorsBtn) resetColorsBtn.addEventListener('click', () => {
    localStorage.removeItem('pixelChatColors');
    addSystemMessage('🔄 Settings reset. Reload to apply defaults.');
  });

  if (backToStartCustomizeBtn) backToStartCustomizeBtn.addEventListener('click', () => showScreen(startScreen));

  // ===== CHAT & LEAVE =====
  if (leaveBtn) leaveBtn.addEventListener('click', () => {
    if (!currentRoom) return;
    showScreen(startScreen);
    currentRoom = null;
    if (messagesEl) messagesEl.innerHTML = '';
    if (userListEl) userListEl.innerHTML = '';
    if (userCountEl) userCountEl.textContent = '0';
    clearReply(); clearImagePreview();
    if (soundboardPanel) soundboardPanel.classList.add('hidden');
  });

  if (sendBtn)      sendBtn.addEventListener('click',          () => { initAudio(); sendMessage(); });
  if (messageInput) messageInput.addEventListener('keypress',  e  => { if(e.key==='Enter') sendMessage(); });
  if (messageInput) messageInput.addEventListener('input', () => {
    if (!currentRoom || !myUsername) return;
    if (!isTyping) { isTyping=true; socket.emit('typing',{roomName:currentRoom,username:myUsername,isTyping:true}); }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => { isTyping=false; socket.emit('typing',{roomName:currentRoom,username:myUsername,isTyping:false}); }, 1000);
  });

  // ===== SLASH COMMANDS + SEND =====
  async function sendMessage() {
    if (!messageInput) return;
    const raw   = messageInput.value;
    const message = raw.trim();
    const image = pendingImage || null;
    if (!message && !image) return;
    if (!currentRoom || !myUsername) { addSystemMessage('⚠️ Not connected to a room'); return; }

    // --- SLASH COMMANDS ---
    if (message.startsWith('/')) {
      messageInput.value = '';
      const parts = message.slice(1).split(/\s+/);
      const cmd   = parts[0].toLowerCase();
      const args  = parts.slice(1);

      if (cmd === 'clear') {
        if (messagesEl) messagesEl.innerHTML = '';
        addSystemMessage('🧹 Chat cleared.');
        return;
      }
      if (cmd === 'mute') {
        if (!args[0]) { addSystemMessage('⚠️ Usage: /mute <username>'); return; }
        mutedUsers.add(args[0].toUpperCase());
        addSystemMessage('🔇 Muted ' + args[0] + '. Their messages are hidden.');
        return;
      }
      if (cmd === 'unmute') {
        if (!args[0]) { addSystemMessage('⚠️ Usage: /unmute <username>'); return; }
        mutedUsers.delete(args[0].toUpperCase());
        addSystemMessage('🔊 Unmuted ' + args[0] + '.');
        return;
      }
      if (cmd === 'persona') {
        const list = Object.keys(botPersonas).join(', ');
        if (!args[0]) { addSystemMessage('🤖 Personas: ' + list + '  — Usage: /persona <name>'); return; }
        const name = args[0].toLowerCase();
        if (!botPersonas[name]) { addSystemMessage('⚠️ Unknown persona. Options: ' + list); return; }
        botPersona = name;
        addSystemMessage('🎭 Bot persona → ' + name);
        return;
      }
      if (cmd === 'help') {
        [
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '📖 COMMANDS',
          '/clear              — wipe chat window',
          '/mute <user>        — hide their messages',
          '/unmute <user>      — show them again',
          '/persona <name>     — change bot personality',
          '  personas: ' + Object.keys(botPersonas).join(', '),
          '/help               — this list',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '• @bot <question>   — ask the AI',
          '• Double-click msg  — reply',
          '• Double-click user — DM',
          '• Host only: 🎮 button to start minigames',
          '• Host starts a minigame → popup asks if you want to join',
        ].forEach(l => addSystemMessage(l));
        return;
      }
      addSystemMessage('⚠️ Unknown command: /' + cmd + '  — type /help');
      return;
    }

    // --- MINIGAME CHAT COMMANDS ---
    handleLocalGameMsg(message);

    // --- EMIT TO SERVER (always first, so question appears before bot answer) ---
    socket.emit('chatMessage', { roomName:currentRoom, username:myUsername, message, image, replyTo:pendingReply, avatar:myAvatar });
    addMessage({ username:myUsername, message, image, replyTo:pendingReply, id:Date.now()+'-local', timestamp:new Date().toLocaleTimeString(), senderId:socket.id, reactions:{}, avatar:myAvatar }, true);

    // --- @BOT MENTION (runs after message is already shown) ---
    if (message.toLowerCase().includes('@bot')) {
      const botMsg = message.replace(/@bot/gi, '').trim();
      if (!groqApiKey) {
        addSystemMessage('⚠️ No API key set — go to Customize, enter your Groq key, then hit SAVE.');
      } else if (botMsg) {
        addSystemMessage('🤖 Thinking...');
        try {
          const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + groqApiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              max_tokens: 200,
              messages: [
                { role: 'system', content: botPersonas[botPersona] || botPersonas.helpful },
                { role: 'user',   content: botMsg },
              ],
            }),
          });
          const data = await res.json();
          if (data.error) {
            addSystemMessage('⚠️ Bot error: ' + data.error.message);
          } else {
            const reply = data.choices?.[0]?.message?.content || '(no response)';
            addMessage({ username:'🤖 Bot', message:reply, id:Date.now()+'-bot', timestamp:new Date().toLocaleTimeString(), senderId:'bot', isBot:true }, false);
            playSystemSound('receive');
          }
        } catch(err) { addSystemMessage('⚠️ Bot error: ' + err.message); }
      }
    }

    messageInput.value = '';
    clearImagePreview(); clearReply();
    if (isTyping) { isTyping=false; socket.emit('typing',{roomName:currentRoom,username:myUsername,isTyping:false}); }
    playSystemSound('send');
    if (sendBtn) {
      const rect = sendBtn.getBoundingClientRect();
      createRipple(rect.left + rect.width/2, rect.top + rect.height/2);
    }
    scrollToBottom();
  }

  // ===== IMAGE UPLOAD =====
  if (imageUpload) imageUpload.addEventListener('change', e => {
    initAudio();
    const file = e.target.files[0];
    if (file) handleImageFile(file);
    imageUpload.value = '';
  });

  document.addEventListener('paste', e => {
    if (!currentRoom || document.activeElement !== messageInput) return;
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type?.startsWith('image/')) { e.preventDefault(); handleImageFile(item.getAsFile()); break; }
    }
  });

  function handleImageFile(file) {
    const valid = ['image/png','image/jpeg','image/jpg','image/gif','image/webp'];
    if (!valid.includes(file.type)) { addSystemMessage('⚠️ Only PNG, JPG, GIF, WebP'); playSystemSound('error'); return; }
    if (file.size > 50*1024*1024) { addSystemMessage('⚠️ Image too large (max 50MB)'); playSystemSound('error'); return; }
    const r = new FileReader();
    r.onload = e => {
      pendingImage = e.target.result;
      addSystemMessage('🖼️ Image attached' + (file.type==='image/gif' ? ' (GIF)' : ''));
      if (messageInput) { messageInput.placeholder='Add caption (optional)...'; messageInput.focus(); }
    };
    r.readAsDataURL(file);
  }

  function clearImagePreview() {
    pendingImage = null;
    if (messageInput) messageInput.placeholder = 'Message #main  (@bot for AI)';
  }

  // ===== AVATAR =====
  function uploadAvatar() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = e => {
      const file = e.target.files[0];
      if (file?.type.startsWith('image/')) {
        if (file.size > 5*1024*1024) { addSystemMessage('⚠️ Avatar too large (max 5MB)'); return; }
        const r = new FileReader();
        r.onload = ev => { myAvatar = ev.target.result; socket.emit('updateAvatar',{avatar:myAvatar}); addSystemMessage('✅ Avatar updated!'); updateUserList(Array.from(usersMap.values())); };
        r.readAsDataURL(file);
      }
    };
    inp.click();
  }

  // ===== REPLY =====
  if (messagesEl) messagesEl.addEventListener('dblclick', e => {
    initAudio();
    const msgEl = e.target.closest('.message');
    if (!msgEl || msgEl.classList.contains('system')) return;
    const msgId = msgEl.dataset.id, username = msgEl.dataset.username, text = msgEl.dataset.text;
    if (!msgId || !username) return;
    pendingReply = { id:msgId, username, text:(text||'').slice(0,100) };
    if (replyUsernameEl) replyUsernameEl.textContent = username;
    if (replyPreview) replyPreview.classList.remove('hidden');
    if (messageInput) messageInput.focus();
  });
  if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', clearReply);
  function clearReply() {
    pendingReply = null;
    if (replyPreview) replyPreview.classList.add('hidden');
    if (replyUsernameEl) replyUsernameEl.textContent = '';
  }

  // ===== SOUNDBOARD =====
  if (soundboardBtn) soundboardBtn.addEventListener('click', () => soundboardPanel?.classList.toggle('hidden'));
  soundButtons.forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.sound;
    if (id && currentRoom) { playSound(id); socket.emit('playSound',{roomName:currentRoom,soundId:id,username:myUsername}); }
  }));
  if (soundToggleBtn) soundToggleBtn.addEventListener('click', () => {
    initAudio();
    window.audioEnabled = !window.audioEnabled;
    soundToggleBtn.textContent = window.audioEnabled ? '🔊' : '🔇';
    addSystemMessage(window.audioEnabled ? '🔊 Sound ON' : '🔇 Sound OFF');
  });

  // ===== PROFILE MODAL =====
  function openProfileModal(user) {
    if (!profileModal) return;
    selectedUser = user;
    if (profileUsernameEl) profileUsernameEl.textContent = user.username;
    if (profileRoleEl)     profileRoleEl.textContent     = user.role || 'Member';
    if (profileStatusEl)   profileStatusEl.textContent   = user.status || 'Online';
    if (profileRoomsEl)    profileRoomsEl.textContent    = user.roomsJoined || 1;
    if (profileMessagesEl) profileMessagesEl.textContent = user.messagesSent || 0;
    if (user.avatar && profileAvatarImg)  { profileAvatarImg.src=user.avatar; profileAvatarImg.style.display='block'; if(avatarPlaceholder) avatarPlaceholder.style.display='none'; }
    else { if(profileAvatarImg) profileAvatarImg.style.display='none'; if(avatarPlaceholder) avatarPlaceholder.style.display='flex'; }
    if (user.isBanned && profileStatusEl) { profileStatusEl.textContent='Banned'; profileStatusEl.style.color='#ff4757'; }
    if (ownerControls) ownerControls.classList.add('hidden');
    if (modControls)   modControls.classList.add('hidden');
    if (unbanBtn)      unbanBtn.classList.add('hidden');
    if (myRole==='owner' && user.username!==myUsername) {
      if (ownerControls) ownerControls.classList.remove('hidden');
      if (user.isBanned) { if(unbanBtn) unbanBtn.classList.remove('hidden'); if(banBtn) banBtn.classList.add('hidden'); }
      else               { if(banBtn)   banBtn.classList.remove('hidden');   if(unbanBtn) unbanBtn.classList.add('hidden'); }
    } else if (myRole==='mod' && user.username!==myUsername && user.role!=='owner') {
      if (modControls) modControls.classList.remove('hidden');
    }
    profileModal.classList.remove('hidden');
  }
  function closeProfileModal() { if(profileModal) profileModal.classList.add('hidden'); selectedUser=null; }
  function closeRoomControlsModal() { if(roomControlsModal) roomControlsModal.classList.add('hidden'); }

  if (closeProfileBtn)      closeProfileBtn.addEventListener('click', closeProfileModal);
  if (openDmFromProfileBtn) openDmFromProfileBtn.addEventListener('click', () => { if(selectedUser){openDM(selectedUser.id,selectedUser.username);closeProfileModal();} });
  if (setModBtn)   setModBtn.addEventListener('click',   () => { if(selectedUser&&currentRoom){socket.emit('setModerator',{roomName:currentRoom,targetUser:selectedUser.username});closeProfileModal();} });
  if (kickBtn)     kickBtn.addEventListener('click',     () => { if(selectedUser&&currentRoom){socket.emit('kickUser',    {roomName:currentRoom,targetUser:selectedUser.username});closeProfileModal();} });
  if (banBtn)      banBtn.addEventListener('click',      () => { if(selectedUser&&currentRoom){socket.emit('banUser',     {roomName:currentRoom,targetUser:selectedUser.username});closeProfileModal();} });
  if (unbanBtn)    unbanBtn.addEventListener('click',    () => { if(selectedUser&&currentRoom){socket.emit('unbanUser',   {roomName:currentRoom,targetUser:selectedUser.username});closeProfileModal();} });
  if (modKickBtn)  modKickBtn.addEventListener('click',  () => { if(selectedUser&&currentRoom){socket.emit('kickUser',    {roomName:currentRoom,targetUser:selectedUser.username});closeProfileModal();} });

  // ===== ROOM CONTROLS =====
  if (deleteRoomBtn) deleteRoomBtn.addEventListener('click', () => {
    if (currentRoom && myRole==='owner' && confirm('Delete this room?')) { socket.emit('deleteRoom',{roomName:currentRoom}); closeRoomControlsModal(); }
  });
  if (viewBannedBtn)       viewBannedBtn.addEventListener('click',       () => socket.emit('getBannedUsers',{roomName:currentRoom}));
  if (closeRoomControlsBtn) closeRoomControlsBtn.addEventListener('click', closeRoomControlsModal);

  // ===== CONTEXT MENU =====
  document.addEventListener('contextmenu', e => {
    const li = e.target.closest('.pixel-list li');
    if (li && currentRoom && contextMenu) {
      e.preventDefault();
      const userId = li.dataset.userId, username = li.querySelector('.username-text')?.textContent;
      if (userId && username) {
        selectedUser = usersMap.get(userId) || { id:userId, username };
        contextMenu.style.left = e.pageX+'px'; contextMenu.style.top = e.pageY+'px';
        contextMenu.classList.remove('hidden');
        contextMenu.querySelectorAll('.context-item').forEach(item => {
          item.onclick = () => {
            const action = item.dataset.action;
            if (action==='profile') openProfileModal(selectedUser);
            else if (action==='dm') openDM(userId, username);
            else if (action==='mention' && messageInput) { messageInput.value += '@'+username+' '; messageInput.focus(); }
            contextMenu.classList.add('hidden');
          };
        });
      }
    }
  });
  document.addEventListener('click', e => {
    if (contextMenu && !e.target.closest('.context-menu') && !e.target.closest('.pixel-list li')) contextMenu.classList.add('hidden');
  });

  // ===== THREADS =====
  if (closeThreadBtn) closeThreadBtn.addEventListener('click', () => {
    if(threadView)  threadView.classList.add('hidden');
    if(threadsList) threadsList.classList.remove('hidden');
    currentThread = null;
  });
  if (sendThreadBtn)      sendThreadBtn.addEventListener('click', sendThreadMessage);
  if (threadMessageInput) threadMessageInput.addEventListener('keypress', e => { if(e.key==='Enter') sendThreadMessage(); });

  function sendThreadMessage() {
    if (!currentThread || !threadMessageInput) return;
    const msg = threadMessageInput.value.trim();
    if (!msg) return;
    socket.emit('threadMessage',{threadId:currentThread.id,username:myUsername,message:msg});
    threadMessageInput.value = '';
  }

  // ===== DM SYSTEM =====
  function openDM(userId, username) {
    showPanel('dms-panel');
    activeDmUserId = userId;
    if (dmListEl) dmListEl.classList.add('hidden');
    if (dmConvEl) dmConvEl.classList.remove('hidden');
    if (dmConvUsername) dmConvUsername.textContent = '📩 ' + username;
    socket.emit('getDMHistory', { userId });
    renderDmMessages(userId);
    if (dmInput) dmInput.focus();
  }

  function renderDmMessages(userId) {
    if (!dmMessagesEl) return;
    dmMessagesEl.innerHTML = '';
    (dmConversations.get(userId) || []).forEach(m => addDmMessageEl(m));
    dmMessagesEl.scrollTop = dmMessagesEl.scrollHeight;
  }

  function addDmMessageEl(msg) {
    if (!dmMessagesEl) return;
    const isSelf = msg.from===mySocketId || msg.fromUsername===myUsername;
    const el = document.createElement('div');
    el.className = 'message' + (isSelf ? ' self' : '');
    el.innerHTML = '<div class="avatar"><div class="avatar-placeholder">👤</div></div><div class="content"><span class="meta"><span class="username">' + escapeHtml(msg.fromUsername) + '</span><span class="time">[' + (msg.timestamp||'') + ']</span></span><span class="text">' + parseMarkdown(escapeHtml(msg.message)) + '</span></div>';
    dmMessagesEl.appendChild(el);
    dmMessagesEl.scrollTop = dmMessagesEl.scrollHeight;
  }

  function updateDmList() {
    if (!dmListEl) return;
    if (dmConversations.size === 0) {
      dmListEl.innerHTML = '<p class="pixel-hint" style="margin-top:16px;text-align:center;">Double-click a user to start a DM</p>';
      return;
    }
    dmListEl.innerHTML = '';
    dmConversations.forEach((msgs, userId) => {
      const last = msgs[msgs.length-1]; if (!last) return;
      const other = last.fromUsername===myUsername ? (usersMap.get(userId)?.username||userId) : last.fromUsername;
      const entry = document.createElement('div');
      entry.className = 'dm-entry';
      entry.innerHTML = '<div style="width:32px;height:32px;border-radius:50%;background:var(--pixel-border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">👤</div><div style="flex:1;min-width:0;"><div class="dm-name">' + escapeHtml(other) + '</div><div style="font-size:7px;color:var(--pixel-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHtml(last.message.substring(0,50)) + '</div></div>';
      entry.addEventListener('click', () => openDM(userId, other));
      dmListEl.appendChild(entry);
    });
  }

  if (dmSendBtn) dmSendBtn.addEventListener('click', sendDM);
  if (dmInput)   dmInput.addEventListener('keypress', e => { if(e.key==='Enter') sendDM(); });
  if (dmBackBtn) dmBackBtn.addEventListener('click', () => {
    activeDmUserId = null;
    if (dmConvEl) dmConvEl.classList.add('hidden');
    if (dmListEl) { dmListEl.classList.remove('hidden'); updateDmList(); }
  });

  function sendDM() {
    if (!dmInput || !activeDmUserId || !myUsername) return;
    const message = dmInput.value.trim();
    if (!message) return;
    dmInput.value = '';
    // Emit only — the server will echo back via 'privateMessage' which renders it.
    // We do NOT add to DOM here to avoid the double-render.
    const msgId = mySocketId + '-' + Date.now();
    socket.emit('privateMessage',{toUserId:activeDmUserId,fromUsername:myUsername,message,messageId:msgId});
  }

  // ===== MINIGAMES =====
  // All games run in a fullscreen overlay (#game-overlay)
  // The overlay contains pre-built screens for each game.

  // activeGame declared at line 138

  const GO  = () => document.getElementById('game-overlay');
  const GS  = id => document.getElementById(id);
  const $g  = id => document.getElementById(id);

  function goShow(screenId) {
    GO()?.classList.remove('hidden');
    document.querySelectorAll('.gscreen').forEach(s => s.classList.add('hidden'));
    $g(screenId)?.classList.remove('hidden');
  }
  function goHide() {
    GO()?.classList.add('hidden');
    document.querySelectorAll('.gscreen').forEach(s => s.classList.add('hidden'));
    hideGameLoading();
  }

  // ── Loading screen for game init ──
  function showGameLoading(msg) {
    let el = $g('game-loading-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'game-loading-overlay';
      el.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;';
      el.innerHTML = '<div style="font-family:var(--pixel-font,monospace);font-size:11px;color:#4cc9f0;letter-spacing:2px;">LOADING…</div>'
        + '<div id="game-loading-msg" style="font-family:var(--pixel-font,monospace);font-size:8px;color:rgba(255,255,255,.5);"></div>'
        + '<div style="display:flex;gap:6px;" id="game-loading-dots">'
        + '<div class="gload-dot"></div><div class="gload-dot"></div><div class="gload-dot"></div>'
        + '</div>';
      document.body.appendChild(el);
    }
    const msgEl = $g('game-loading-msg');
    if (msgEl) msgEl.textContent = msg || '';
    el.style.display = 'flex';
  }
  function hideGameLoading() {
    const el = $g('game-loading-overlay');
    if (el) el.style.display = 'none';
  }

  // ── Open lobby when host clicks 🎮 ──────────────────────────
  if (minigameBtn) minigameBtn.addEventListener('click', () => {
    goShow('gscreen-lobby');
  });

  $g('gclose-btn')?.addEventListener('click', () => {
    stopAllGames();
    goHide();
  });

  document.querySelectorAll('.game-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (myRole !== 'owner') {
        addSystemMessage('⚠️ Only the host can pick a game!');
        goHide(); return;
      }
      startGameLobby(btn.dataset.game);
    });
  });

  // Legacy modal close
  document.getElementById('close-minigame-btn')?.addEventListener('click', goHide);

  const GAME_NAMES = { football:'⚽ Football', skribbl:'🎨 Skribbl', quiz:'📚 Quiz Battle', wordbomb:'💣 Word Bomb', pixelduel:'🔫 Pixel Duel', pong:'🏓 Pong', snake:'🐍 Snake Race', typing:'⌨️ Typing Sprint' };

  function startGameLobby(type) {
    activeGame = {
      type, state: 'lobby',
      players: [myUsername],
      scores: { [myUsername]: 0 },
      streaks: { [myUsername]: 0 },
    };
    const gameName = GAME_NAMES[type] || type;
    $g('gwait-title').textContent = gameName;
    renderWaitList();
    // Send invite popup to everyone else in the room via socket
    socket.emit('gameInvite', { roomName: currentRoom, game: type, gameName, hostUsername: myUsername });
    addSystemMessage('🎮 Invite sent! Waiting for players to join…');
    goShow('gscreen-wait');
  }

  function renderWaitList() {
    const el = $g('gwait-players');
    if (!el || !activeGame) return;
    el.innerHTML = '';
    activeGame.players.forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'gwait-chip' + (p === myUsername ? ' me' : '');
      chip.textContent = (p === myUsername ? '★ ' : '· ') + p;
      el.appendChild(chip);
    });
    const info = $g('gwait-info');
    if (info) info.textContent = activeGame.players.length + ' player(s) in lobby';
    // Owner sees START button; others see a hint
    const startBtn = $g('gwait-start');
    const nonHostMsg = $g('gwait-nonhost-msg');
    if (startBtn) startBtn.style.display = myRole === 'owner' ? '' : 'none';
    if (nonHostMsg) nonHostMsg.style.display = myRole === 'owner' ? 'none' : '';
  }

  $g('gwait-start')?.addEventListener('click', () => {
    if (!activeGame) return;
    launchGame();
  });
  $g('gwait-back')?.addEventListener('click', () => {
    activeGame = null;
    goShow('gscreen-lobby');
  });

  function launchGame() {
    if (!activeGame) return;
    const t = activeGame.type;
    addSystemMessage('🎮 ' + (GAME_NAMES[t]||t.toUpperCase()) + ' — STARTING!');
    // Tell all joined players to launch via dedicated socket event
    if (myRole === 'owner') {
      socket.emit('gameLaunch', { roomName: currentRoom, game: t, players: activeGame.players });
    }
    _doLaunchGame(t);
  }

  const GAME_ICONS = { football:'⚽', quiz:'📚', skribbl:'🎨', wordbomb:'💣', pixelduel:'🔫', pong:'🏓', snake:'🐍', typing:'⌨️' };
  const GAME_HINTS = {
    football: 'WASD to move · SPACE to kick · Score goals!',
    quiz: '10 questions · 15 sec each · most points wins',
    skribbl: 'Draw the word · others guess · earn points',
    wordbomb: 'Type a word with the syllable · before the fuse blows!',
    pixelduel: 'WASD to move · Space/F to shoot · top-down arena',
    pong: 'W/S to move paddle · first to 7 wins',
    snake: 'WASD to steer · eat apples · don\'t crash',
    typing: 'Type as many words as you can in 60 seconds',
  };

  function _doLaunchGame(t) {
    const icon = GAME_ICONS[t] || '🎮';
    const hint = GAME_HINTS[t] || 'Get ready!';
    const el_icon  = document.getElementById('gloading-icon');
    const el_title = document.getElementById('gloading-title');
    const el_hint  = document.getElementById('gloading-hint');
    const el_bar   = document.getElementById('gloading-bar');
    if (el_icon)  el_icon.textContent  = icon;
    if (el_title) el_title.textContent = t.toUpperCase() + ' — GET READY!';
    if (el_hint)  el_hint.textContent  = hint;
    if (el_bar)   el_bar.style.width   = '0%';
    goShow('gscreen-loading');
    // Animate loading bar then launch
    let pct = 0;
    const loadInt = setInterval(() => {
      pct += 5;
      if (el_bar) el_bar.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(loadInt);
        _launchImmediate(t);
      }
    }, 40); // 800ms total
  }

  function _launchImmediate(t) {
    if (t === 'football')       launchFootball();
    else if (t === 'quiz')      launchQuiz();
    else if (t === 'skribbl')   launchSkribbl();
    else if (t === 'wordbomb')  launchWordBomb();
    else if (t === 'pixelduel') launchPixelDuel();
    else if (t === 'pong')      launchPong();
    else if (t === 'snake')     launchSnake();
    else if (t === 'typing')    launchTyping();
  }

  function stopAllGames() {
    if (fbRAF)     { cancelAnimationFrame(fbRAF);     fbRAF = null; }
    if (pdRAF)     { cancelAnimationFrame(pdRAF);     pdRAF = null; }
    if (pongRAF)   { cancelAnimationFrame(pongRAF);   pongRAF = null; }
    if (snakeRAF)  { cancelAnimationFrame(snakeRAF);  snakeRAF = null; }
    clearTimeout(skTimer); clearInterval(skBarInt);
    clearTimeout(qzTimer); clearInterval(qzBarInt);
    clearTimeout(wbTimer); clearInterval(wbFuseInt);
    activeGame = null;
  }

  // Route incoming chat messages into active games
  // Incoming game messages (quiz/skribbl/wordbomb answers)
  function handleIncomingGameMsg(username, message) {
    if (!activeGame) return;
    if (activeGame.state === 'question') handleQuizIncoming(username, message);
    if (activeGame.state === 'drawing')  handleSkribblIncoming(username, message);
    if (activeGame.state === 'wordbomb' && activeGame.currentPlayer === username) wbHandleWord(username, message);
  }

  // Local messages (wordbomb only now — no more !join/!start)
  function handleLocalGameMsg(message) {
    if (!activeGame) return;
    if (activeGame.state === 'wordbomb' && activeGame.currentPlayer === myUsername) wbHandleWord(myUsername, message);
  }

  // ── Game invite popup (shown when host starts a game) ──────────────────
  function showGameInvitePopup(game, gameName, hostUsername) {
    // Remove any existing popup
    const existing = document.getElementById('game-invite-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'game-invite-popup';
    popup.className = 'game-invite-popup';
    popup.innerHTML =
      '<div class="gip-icon">' + (GAME_ICONS[game]||'🎮') + '</div>' +
      '<div class="gip-body">' +
        '<div class="gip-title">' + gameName + '</div>' +
        '<div class="gip-host">' + hostUsername + ' is hosting</div>' +
      '</div>' +
      '<button class="gip-btn yes" id="gip-yes">▶ JOIN</button>' +
      '<button class="gip-btn no"  id="gip-no">✕</button>';
    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => popup.classList.add('visible'));

    let autoTimeout = setTimeout(() => dismissInvite(popup, false, game), 20000);

    document.getElementById('gip-yes').onclick = () => {
      clearTimeout(autoTimeout);
      dismissInvite(popup, true, game);
    };
    document.getElementById('gip-no').onclick = () => {
      clearTimeout(autoTimeout);
      dismissInvite(popup, false, game);
    };
  }

  function dismissInvite(popup, accepted, game) {
    popup.classList.remove('visible');
    setTimeout(() => popup.remove(), 400);
    if (accepted) {
      // Tell server we're joining
      socket.emit('gameJoinResponse', { roomName: currentRoom, username: myUsername, accepted: true, game });
      // Build local activeGame state so we're ready to receive launch
      if (!activeGame || activeGame.type !== game) {
        activeGame = { type: game, state: 'lobby', players: [myUsername],
          scores: { [myUsername]: 0 }, streaks: { [myUsername]: 0 } };
      } else if (!activeGame.players.includes(myUsername)) {
        activeGame.players.push(myUsername);
        activeGame.scores[myUsername] = 0;
        activeGame.streaks[myUsername] = 0;
      }
      addSystemMessage('✅ You joined the ' + (GAME_NAMES[game]||game) + ' lobby!');
    }
  }


  // ═══════════════════════════════════════════════════════════
  //  ⚽  FOOTBALL  (physics canvas, WASD/arrows to move)
  //  Inspired by HaxBall — real-time multiplayer via socket
  // ═══════════════════════════════════════════════════════════
  let fbRAF = null;

  // Virtual field dimensions (logical coords, canvas scales to fit)
// ─────────────────────────────────────────────────────────
  //  ⚽  FOOTBALL  —  Improved physics + art
  //  Virtual pitch: 880×580 logical units, drawn with
  //  letterboxing so the whole field always fits on screen.
  // ─────────────────────────────────────────────────────────
  const FB_VW = 880, FB_VH = 580;   // logical pitch size
  const FB_PAD = 24;                 // padding inside canvas around field
  const FB_PRAD = 11;                // player radius (logical)
  const FB_BRAD = 9;                 // ball radius (logical)
  const FB_GOAL_H = 110;             // goal mouth height
  const FB_GOAL_D = 28;              // goal depth
  const FB_GOAL_POST = 5;            // goal post width
  const FB_MATCH_TIME = 240;

  // Physics constants (tuned per-frame at 60fps)
  const FB_FRICTION   = 0.982;   // grass friction on ball
  const FB_WALL_DAMP  = 0.72;    // energy lost on wall bounce
  const FB_KICK_BASE  = 3.8;     // reduced kick force
  const FB_PLAYER_ACC = 0.55;    // player acceleration (unused with lerp)
  const FB_PLAYER_MAX = 3.2;     // slower max speed (was 4.8)
  const FB_PLAYER_DEC = 0.80;    // player deceleration (no input)

  function launchFootball() {
    goShow('gscreen-football');
    activeGame.state = 'playing';
    activeGame.score = [0, 0];
    activeGame.timer = FB_MATCH_TIME;

    const half = Math.ceil(activeGame.players.length / 2);
    activeGame.teamBlue = activeGame.players.slice(0, half);
    activeGame.teamRed  = activeGame.players.slice(half);

    const BCOLORS = ['#4cc9f0','#7bed9f','#a29bfe','#ffd700','#fd79a8'];
    const RCOLORS = ['#e94560','#ff7043','#ff9ff3','#ff6b81','#ffb700'];

    fbState = {
      ball: { x: FB_VW/2, y: FB_VH/2, vx: 1.8, vy: 0.6, spin: 0, spinAngle: 0 },
      players: activeGame.players.map((name, i) => {
        const isBlue = i < half;
        const slot   = isBlue ? i : i - half;
        const slots  = isBlue ? half : activeGame.players.length - half;
        return {
          name, isMe: name === myUsername,
          team: isBlue ? 0 : 1,
          jersey: i + 1,
          color: isBlue ? (BCOLORS[slot % BCOLORS.length]) : (RCOLORS[slot % RCOLORS.length]),
          // stagger start positions nicely
          x: isBlue
            ? FB_VW * 0.22 + (slot % 2) * 70
            : FB_VW * 0.78 - (slot % 2) * 70,
          y: FB_VH * (0.25 + slot * (0.5 / Math.max(1, slots-1))),
          vx: 0, vy: 0,
          angle: isBlue ? 0 : Math.PI, // facing direction
          kickCooldown: 0,
        };
      }),
      keys: {},
      goalFlash: 0,
      goalMsg: '',
      over: false,
      isAuthority: myRole === 'owner',  // only host runs ball physics
      // letterbox transform (set by resizeFB)
      ox: 0, oy: 0, scale: 1,
    };

    const canvas = $g('fb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    $g('fb-blue-label').textContent = activeGame.teamBlue.join(' + ');
    $g('fb-red-label').textContent  = activeGame.teamRed.join(' + ');
    $g('fb-score').textContent      = '0 — 0';
    $g('fb-timer-disp').textContent = '4:00';

    // Letterbox: keep field aspect ratio, add padding
    const wrap = canvas.parentElement;
    function resizeFB() {
      // Use getBoundingClientRect for accurate size after flex layout
      const rect = canvas.getBoundingClientRect();
      const ww = rect.width  || wrap.clientWidth  || window.innerWidth;
      const wh = rect.height || wrap.clientHeight || (window.innerHeight - 60);
      canvas.width  = ww;
      canvas.height = wh;
      const availW = ww - FB_PAD * 2;
      const availH = wh - FB_PAD * 2;
      const s = Math.min(availW / FB_VW, availH / FB_VH);
      fbState.scale = s;
      fbState.ox    = (ww - FB_VW * s) / 2;
      fbState.oy    = (wh - FB_VH * s) / 2;
    }
    // Double-RAF to ensure layout is fully painted before measuring canvas
    requestAnimationFrame(() => requestAnimationFrame(() => { resizeFB(); }));
    window.addEventListener('resize', resizeFB);

    // Input
    const onKD = e => {
      fbState.keys[e.key] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    };
    const onKU = e => { delete fbState.keys[e.key]; };
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup',   onKU);

    // Match clock
    const timerInt = setInterval(() => {
      if (!activeGame || fbState.over) { clearInterval(timerInt); return; }
      activeGame.timer = Math.max(0, activeGame.timer - 1);
      const m = Math.floor(activeGame.timer / 60), s = activeGame.timer % 60;
      $g('fb-timer-disp').textContent = m + ':' + String(s).padStart(2,'0');
      if (activeGame.timer <= 0) { clearInterval(timerInt); endFootball(onKD, onKU); }
    }, 1000);

    // Position broadcast
    const bcInt = setInterval(() => {
      if (!activeGame || fbState.over) { clearInterval(bcInt); return; }
      const me = fbState.players.find(p => p.isMe);
      if (me) {
        const payload = { username: myUsername, x: me.x, y: me.y };
        // Host also broadcasts ball state so all clients stay in sync
        if (myRole === 'owner' && fbState.ball) {
          payload.ball = { x: fbState.ball.x, y: fbState.ball.y, vx: fbState.ball.vx, vy: fbState.ball.vy };
        }
        socket.emit('gameState', { roomName: currentRoom, game: 'football', payload });
      }
    }, 50);

    $g('fb-quit')?.addEventListener('click', () => {
      clearInterval(timerInt); clearInterval(bcInt);
      cleanupFB(onKD, onKU);
    });

    let lastFbTime = 0;
    function fbLoop(now) {
      if (fbState.over || !activeGame) return;
      // Resize canvas every frame if dimensions changed (handles post-loading-screen reveal)
      const cw = canvas.getBoundingClientRect().width;
      if (cw > 0 && Math.abs(canvas.width - cw) > 2) resizeFB();
      // Delta-time capped at 50ms (avoids spiral of death on tab-blur)
      const dt = Math.min((now - lastFbTime) / 16.667, 3); // normalised to 60fps units
      lastFbTime = now;
      fbTick(dt);
      fbDraw(ctx, canvas);
      fbRAF = requestAnimationFrame(fbLoop);
    }
    // Start loop — resizeFB will happen on first frame when canvas is actually visible
    fbRAF = requestAnimationFrame(t => { lastFbTime = t; fbRAF = requestAnimationFrame(fbLoop); });
  }

  let fbState = null;

  // ── Physics tick ────────────────────────────────────────────
  function fbTick(dt) {
    if (!fbState) return;
    if (dt === undefined) dt = 1;

    // ── My player input — smooth lerp toward target velocity ──
    const me = fbState.players.find(p => p.isMe);
    if (me) {
      const k = fbState.keys;
      const left  = k['a'] || k['A'] || k['ArrowLeft'];
      const right = k['d'] || k['D'] || k['ArrowRight'];
      const up    = k['w'] || k['W'] || k['ArrowUp'];
      const down  = k['s'] || k['S'] || k['ArrowDown'];

      let tx = 0, ty = 0;
      if (left)  tx -= 1;
      if (right) tx += 1;
      if (up)    ty -= 1;
      if (down)  ty += 1;
      const tlen = Math.hypot(tx, ty);
      if (tlen > 0) { tx = tx/tlen * FB_PLAYER_MAX; ty = ty/tlen * FB_PLAYER_MAX; }

      // Exponential lerp — lower values = more inertia/momentum
      const accel  = tlen > 0 ? 0.09 : 0.07;  // sluggish with drift
      const factor = 1 - Math.pow(1 - accel, dt);
      me.vx += (tx - me.vx) * factor;
      me.vy += (ty - me.vy) * factor;

      const spd = Math.hypot(me.vx, me.vy);
      if (spd > 0.3) me.angle = Math.atan2(me.vy, me.vx);

      // ── SPACE KICK ──
      const spaceNow = k[' '];
      if (spaceNow && !me.spaceWas && me.kickCooldown <= 0) {
        const b = fbState.ball;
        const kdx = b.x - me.x, kdy = b.y - me.y;
        const kdist = Math.hypot(kdx, kdy);
        const kickRange = FB_PRAD + FB_BRAD + 22;
        if (kdist < kickRange && kdist > 0.1) {
          const knx = kdx / kdist, kny = kdy / kdist;
          const proximity = 1 - kdist / kickRange;
          const power = FB_KICK_BASE * (1.1 + proximity * 0.9);
          b.vx = knx * power + me.vx * 0.3;
          b.vy = kny * power + me.vy * 0.3;
          const tangent = knx * me.vy - kny * me.vx;
          b.spin = tangent * 0.05; // minimal spin on kick
          me.kickCooldown = 22;
          b.x = me.x + knx * (FB_PRAD + FB_BRAD + 1.5);
          b.y = me.y + kny * (FB_PRAD + FB_BRAD + 1.5);
        }
      }
      me.spaceWas = spaceNow;
    }

    // Move all players
    fbState.players.forEach(p => {
      p.x = Math.max(FB_PRAD, Math.min(FB_VW - FB_PRAD, p.x + p.vx * dt));
      p.y = Math.max(FB_PRAD, Math.min(FB_VH - FB_PRAD, p.y + p.vy * dt));
      if (p.kickCooldown > 0) p.kickCooldown -= dt;
    });

    // ── Ball physics — only authority (host) runs these ──
    if (!fbState.isAuthority) return;
    const b = fbState.ball;
    const steps = Math.max(1, Math.ceil(dt));
    const dts   = dt / steps;
    for (let s = 0; s < steps; s++) {
      b.x  += b.vx * dts;
      b.y  += b.vy * dts;
      b.vx *= Math.pow(FB_FRICTION, dts);
      b.vy *= Math.pow(FB_FRICTION, dts);
    }
    b.spin     *= Math.pow(0.88, dt);  // spin decays fast
    b.spinAngle = (b.spinAngle + b.spin * 0.06 * dt) % (Math.PI * 2);
    // Zero spin when ball is nearly stopped (prevents spiral dribbling)
    const bSpeedNow = Math.hypot(b.vx, b.vy);
    if (bSpeedNow < 0.5) b.spin = 0;

    // ── Wall / goal collisions ──
    const gTop = (FB_VH - FB_GOAL_H) / 2;
    const gBot = gTop + FB_GOAL_H;
    const bMinX = FB_BRAD, bMaxX = FB_VW - FB_BRAD;
    const bMinY = FB_BRAD, bMaxY = FB_VH - FB_BRAD;

    if (b.y < bMinY) { b.y = bMinY; b.vy = Math.abs(b.vy) * FB_WALL_DAMP; b.spin *= -0.45; }
    if (b.y > bMaxY) { b.y = bMaxY; b.vy = -Math.abs(b.vy) * FB_WALL_DAMP; b.spin *= -0.45; }

    if (b.x < bMinX) {
      if (b.y >= gTop && b.y <= gBot) {
        if (b.x < -FB_GOAL_D) { fbScoreGoal(1); return; }
        if (b.x < FB_BRAD - FB_GOAL_D + 2) { b.vx = Math.abs(b.vx) * 0.5; b.vy *= 0.6; }
      } else { b.x = bMinX; b.vx = Math.abs(b.vx) * FB_WALL_DAMP; }
    }
    if (b.x > bMaxX) {
      if (b.y >= gTop && b.y <= gBot) {
        if (b.x > FB_VW + FB_GOAL_D) { fbScoreGoal(0); return; }
        if (b.x > bMaxX + FB_GOAL_D - 2) { b.vx = -Math.abs(b.vx) * 0.5; b.vy *= 0.6; }
      } else { b.x = bMaxX; b.vx = -Math.abs(b.vx) * FB_WALL_DAMP; }
    }

    const postBounce = (px, py) => {
      const dx = b.x - px, dy = b.y - py;
      const d = Math.hypot(dx, dy);
      if (d < FB_BRAD + FB_GOAL_POST) {
        const nx = dx/d, ny = dy/d;
        const dot = b.vx*nx + b.vy*ny;
        if (dot < 0) { b.vx -= 2*dot*nx * 0.85; b.vy -= 2*dot*ny * 0.85; }  // no spin on post
        b.x = px + nx*(FB_BRAD + FB_GOAL_POST + 0.5);
        b.y = py + ny*(FB_BRAD + FB_GOAL_POST + 0.5);
      }
    };
    postBounce(0, gTop); postBounce(0, gBot);
    postBounce(FB_VW, gTop); postBounce(FB_VW, gBot);

    // ── Player–ball collision ──
    fbState.players.forEach(p => {
      const dx = b.x - p.x, dy = b.y - p.y;
      const dist = Math.hypot(dx, dy);
      const minD  = FB_PRAD + FB_BRAD;
      if (dist < minD && dist > 0.01) {
        const nx = dx/dist, ny = dy/dist;
        const relVn = (b.vx - p.vx)*nx + (b.vy - p.vy)*ny;
        if (relVn < 0) {
          const e = 0.82;
          const j = -(1+e) * relVn / (1 + 0.4);
          b.vx += j * nx; b.vy += j * ny;
          // No spin added from body contact (prevents spiral dribbling)
          const bSpd = Math.hypot(b.vx, b.vy);
          const minPush = FB_KICK_BASE * 0.7;
          if (bSpd < minPush) { const boost = minPush / Math.max(0.1, bSpd); b.vx *= boost; b.vy *= boost; }
        }
        const overlap = minD - dist + 0.5;
        b.x += nx * overlap; b.y += ny * overlap;
      }
    });

    // ── Player–player separation ──
    for (let i = 0; i < fbState.players.length; i++) {
      for (let j2 = i+1; j2 < fbState.players.length; j2++) {
        const a = fbState.players[i], bb2 = fbState.players[j2];
        const dx = bb2.x - a.x, dy = bb2.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minD = FB_PRAD * 2;
        if (dist < minD && dist > 0.01) {
          const nx = dx/dist, ny = dy/dist;
          const overlap = (minD - dist) / 2;
          a.x -= nx*overlap; a.y -= ny*overlap;
          bb2.x += nx*overlap; bb2.y += ny*overlap;
          const relVn = (a.vx - bb2.vx)*nx + (a.vy - bb2.vy)*ny;
          if (relVn > 0) {
            a.vx   -= relVn*nx*0.7; a.vy   -= relVn*ny*0.7;
            bb2.vx += relVn*nx*0.7; bb2.vy += relVn*ny*0.7;
          }
        }
      }
    }

    if (fbState.goalFlash > 0) fbState.goalFlash -= dt;
  }

  // ── Goal scored ─────────────────────────────────────────────
  function fbScoreGoal(scoringTeam) {
    if (!activeGame || !fbState) return;
    activeGame.score[scoringTeam]++;
    const [blueScore, redScore] = activeGame.score;
    $g('fb-score').textContent = blueScore + ' — ' + redScore;
    const scorer    = scoringTeam === 0 ? activeGame.teamBlue : activeGame.teamRed;
    const scorerName = scorer[Math.floor(Math.random() * scorer.length)];
    fbState.goalMsg  = '⚽  GOAL!  ' + scorerName;
    fbState.goalFlash = 150;
    addSystemMessage('⚽ GOAL! ' + scorerName + '! Score: ' + blueScore + ' — ' + redScore);

    // Reset ball + players with brief pause
    fbState.ball = { x: FB_VW/2, y: FB_VH/2, vx: (Math.random()>.5?1:-1)*2, vy: (Math.random()-.5)*1.5, spin: 0, spinAngle: 0 };
    fbState.players.forEach((p, i) => {
      const half = Math.ceil(activeGame.players.length / 2);
      const slot  = p.team === 0 ? i : i - half;
      const slots  = p.team === 0 ? half : activeGame.players.length - half;
      p.x = p.team === 0
        ? FB_VW * 0.22 + (slot % 2) * 70
        : FB_VW * 0.78 - (slot % 2) * 70;
      p.y = FB_VH * (0.25 + slot * (0.5 / Math.max(1, slots-1)));
      p.vx = 0; p.vy = 0;
    });
  }

  // ── Drawing ─────────────────────────────────────────────────
  function fbDraw(ctx, canvas) {
    if (!fbState) return;
    const cw = canvas.width, ch = canvas.height;
    const s  = fbState.scale, ox = fbState.ox, oy = fbState.oy;
    // Helpers: logical → canvas
    const cx = x => ox + x * s;
    const cy = y => oy + y * s;
    const cs = v => v * s;

    // ── Canvas background (outside field) ──
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, cw, ch);

    // ── Grass stripes ──
    const stripes = 10;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2a7a2a' : '#277027';
      ctx.fillRect(cx(i * FB_VW/stripes), cy(0), cs(FB_VW/stripes)+1, cs(FB_VH));
    }

    // ── Field border (thick) ──
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth   = cs(2.5);
    ctx.strokeRect(cx(0)+ctx.lineWidth/2, cy(0)+ctx.lineWidth/2,
                   cs(FB_VW)-ctx.lineWidth, cs(FB_VH)-ctx.lineWidth);

    const lw = cs(1.8);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth   = lw;

    // Centre line
    ctx.beginPath();
    ctx.moveTo(cx(FB_VW/2), cy(0));
    ctx.lineTo(cx(FB_VW/2), cy(FB_VH));
    ctx.stroke();

    // Centre circle
    ctx.beginPath();
    ctx.arc(cx(FB_VW/2), cy(FB_VH/2), cs(70), 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(cx(FB_VW/2), cy(FB_VH/2), cs(3.5), 0, Math.PI*2); ctx.fill();

    // Penalty areas (left & right)
    const penW = 130, penH = 240;
    const penY = (FB_VH - penH) / 2;
    // Left
    ctx.strokeRect(cx(0), cy(penY), cs(penW), cs(penH));
    // Right
    ctx.strokeRect(cx(FB_VW - penW), cy(penY), cs(penW), cs(penH));

    // Small boxes (6-yard box)
    const sboxW = 52, sboxH = 150, sboxY = (FB_VH - sboxH) / 2;
    ctx.strokeRect(cx(0), cy(sboxY), cs(sboxW), cs(sboxH));
    ctx.strokeRect(cx(FB_VW - sboxW), cy(sboxY), cs(sboxW), cs(sboxH));

    // Penalty spots
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(cx(88), cy(FB_VH/2), cs(3), 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx(FB_VW-88), cy(FB_VH/2), cs(3), 0, Math.PI*2); ctx.fill();

    // Penalty arc
    ctx.beginPath();
    ctx.arc(cx(88), cy(FB_VH/2), cs(70), -Math.PI*0.58, Math.PI*0.58);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx(FB_VW-88), cy(FB_VH/2), cs(70), Math.PI*0.42, Math.PI*1.58);
    ctx.stroke();

    // Corner arcs
    const crn = cs(16);
    [[0,0,0,Math.PI/2],[FB_VW,0,Math.PI/2,Math.PI],[FB_VW,FB_VH,Math.PI,Math.PI*1.5],[0,FB_VH,Math.PI*1.5,Math.PI*2]]
      .forEach(([px,py,a1,a2]) => {
        ctx.beginPath(); ctx.arc(cx(px),cy(py),crn,a1,a2); ctx.stroke();
      });

    // ── Goals (net + posts) ──
    const gTop  = (FB_VH - FB_GOAL_H) / 2;
    const gBot  = gTop + FB_GOAL_H;
    const postR = cs(FB_GOAL_POST);

    function drawGoal(isLeft) {
      const gx = isLeft ? 0 : FB_VW;
      const dir = isLeft ? 1 : -1;
      const netColor = isLeft ? 'rgba(76,201,240,0.18)' : 'rgba(233,69,96,0.18)';
      const postColor= isLeft ? '#4cc9f0' : '#e94560';

      // Net fill
      ctx.fillStyle = netColor;
      const nx = isLeft ? cx(0) : cx(FB_VW) - cs(FB_GOAL_D);
      ctx.fillRect(nx, cy(gTop), cs(FB_GOAL_D), cs(FB_GOAL_H));

      // Net grid lines
      ctx.strokeStyle = isLeft ? 'rgba(76,201,240,0.35)' : 'rgba(233,69,96,0.35)';
      ctx.lineWidth   = cs(0.7);
      const cells = 6;
      for (let r = 1; r < cells; r++) {
        const gy = cy(gTop) + cs(FB_GOAL_H) * r / cells;
        ctx.beginPath();
        ctx.moveTo(nx, gy);
        ctx.lineTo(nx + cs(FB_GOAL_D), gy);
        ctx.stroke();
      }
      const cols = 4;
      for (let c = 1; c < cols; c++) {
        const gxx = nx + cs(FB_GOAL_D) * c / cols;
        ctx.beginPath();
        ctx.moveTo(gxx, cy(gTop));
        ctx.lineTo(gxx, cy(gBot));
        ctx.stroke();
      }

      // Posts
      ctx.fillStyle = postColor;
      ctx.shadowBlur = cs(8); ctx.shadowColor = postColor;
      // Top post
      ctx.beginPath(); ctx.arc(cx(gx), cy(gTop), postR, 0, Math.PI*2); ctx.fill();
      // Bottom post
      ctx.beginPath(); ctx.arc(cx(gx), cy(gBot), postR, 0, Math.PI*2); ctx.fill();
      // Crossbar line
      ctx.strokeStyle = postColor;
      ctx.lineWidth   = postR * 2;
      ctx.beginPath();
      ctx.moveTo(cx(gx), cy(gTop));
      ctx.lineTo(cx(gx), cy(gBot));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    drawGoal(true);
    drawGoal(false);

    // ── Players ──
    fbState.players.forEach(p => {
      const px = cx(p.x), py = cy(p.y);
      const r  = cs(FB_PRAD);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(px + cs(2), py + r*0.55, r*0.85, r*0.28, 0, 0, Math.PI*2);
      ctx.fill();

      // Glow for "me"
      if (p.isMe) {
        ctx.shadowBlur  = cs(18);
        ctx.shadowColor = '#fff';
      }

      // Jersey body (circle)
      const grad = ctx.createRadialGradient(px - r*0.3, py - r*0.35, r*0.05, px, py, r);
      grad.addColorStop(0, fbLighten(p.color, 55));
      grad.addColorStop(0.6, p.color);
      grad.addColorStop(1,   fbDarken(p.color, 40));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // Border ring
      ctx.strokeStyle = p.isMe ? '#fff' : 'rgba(0,0,0,0.5)';
      ctx.lineWidth   = p.isMe ? cs(2.2) : cs(1);
      ctx.stroke();

      // Direction indicator (small triangle pointing movement dir)
      const da = p.angle || 0;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(da);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(r * 0.62, 0);
      ctx.lineTo(r * 0.22, -r * 0.22);
      ctx.lineTo(r * 0.22,  r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Jersey number
      ctx.fillStyle = '#fff';
      ctx.font      = `bold ${Math.round(r*0.72)}px 'Press Start 2P', monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(p.jersey), px, py + r*0.08);

      // Name tag above
      ctx.fillStyle    = p.isMe ? '#fff' : 'rgba(255,255,255,0.75)';
      ctx.font         = `${Math.round(r*0.55)}px 'Press Start 2P', monospace`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.name.slice(0,6), px, py - r - cs(2));
    });

    // ── Ball ──
    const bx = cx(fbState.ball.x), by = cy(fbState.ball.y);
    const br = cs(FB_BRAD);

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(fbState.ball.spinAngle);

    // Drop shadow
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cs(2), br*0.6, br*0.9, br*0.32, 0, 0, Math.PI*2);
    ctx.fill();

    // Ball white base
    ctx.shadowBlur  = cs(10);
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.fillStyle   = '#f0f0f0';
    ctx.beginPath(); ctx.arc(0, 0, br, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Classic football hexagon patches (5 visible)
    ctx.fillStyle = '#1a1a1a';
    // Centre patch
    fbDrawPatch(ctx, 0, 0, br * 0.38);
    // 5 surrounding patches at angles
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI/2;
      fbDrawPatch(ctx, Math.cos(a)*br*0.68, Math.sin(a)*br*0.68, br*0.30);
    }

    // Specular highlight
    const hl = ctx.createRadialGradient(-br*0.3, -br*0.35, 0, -br*0.2, -br*0.2, br*0.55);
    hl.addColorStop(0, 'rgba(255,255,255,0.45)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.beginPath(); ctx.arc(0, 0, br, 0, Math.PI*2); ctx.fill();

    ctx.restore();

    // ── Goal flash overlay ──
    if (fbState.goalFlash > 0) {
      const t     = fbState.goalFlash / 150;
      const alpha = Math.sin(t * Math.PI) * 0.55;
      ctx.fillStyle = `rgba(255,210,0,${alpha})`;
      ctx.fillRect(0, 0, cw, ch);

      const fontSize = Math.round(cw / 10);
      ctx.save();
      ctx.font      = `bold ${fontSize}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Text shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillText(fbState.goalMsg, cw/2 + 3, ch/2 + 3);
      ctx.fillStyle = '#fff';
      ctx.fillText(fbState.goalMsg, cw/2, ch/2);
      ctx.restore();
    }
    // Pixel-art scanline pass
    drawScanlines(ctx, cw, ch);
  }

  // Draw a rounded pentagon patch on the ball
  function fbDrawPatch(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i/6) * Math.PI*2 - Math.PI/6;
      if (i===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function fbLighten(hex, amt) {
    const r=Math.min(255,parseInt(hex.slice(1,3),16)+amt);
    const g=Math.min(255,parseInt(hex.slice(3,5),16)+amt);
    const b=Math.min(255,parseInt(hex.slice(5,7),16)+amt);
    return `rgb(${r},${g},${b})`;
  }
  function fbDarken(hex, amt) {
    const r=Math.max(0,parseInt(hex.slice(1,3),16)-amt);
    const g=Math.max(0,parseInt(hex.slice(3,5),16)-amt);
    const b=Math.max(0,parseInt(hex.slice(5,7),16)-amt);
    return `rgb(${r},${g},${b})`;
  }

  function endFootball(onKD, onKU) {
    if (!fbState) return;
    fbState.over = true;
    cancelAnimationFrame(fbRAF); fbRAF = null;
    window.removeEventListener('keydown', onKD);
    window.removeEventListener('keyup',   onKU);
    const [bl, rd] = activeGame.score;
    const winner = bl > rd ? activeGame.teamBlue.join('+') + ' WIN 🏆'
                 : rd > bl ? activeGame.teamRed.join('+') + ' WIN 🏆' : 'DRAW 🤝';
    addSystemMessage('🏁 FULL TIME: Blue ' + bl + ' — ' + rd + ' Red  |  ' + winner);
    const canvas = $g('fb-canvas'), ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const s = fbState.scale;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffd700';
      ctx.font      = `bold ${Math.round(s*38)}px 'Press Start 2P', monospace`;
      ctx.fillText('FULL TIME', canvas.width/2, canvas.height/2 - s*26);
      ctx.fillStyle = '#fff';
      ctx.font      = `${Math.round(s*26)}px 'Press Start 2P', monospace`;
      ctx.fillText('Blue ' + bl + ' — ' + rd + ' Red', canvas.width/2, canvas.height/2 + s*16);
      ctx.font      = `${Math.round(s*20)}px 'Press Start 2P', monospace`;
      ctx.fillStyle = '#ffd700';
      ctx.fillText(winner, canvas.width/2, canvas.height/2 + s*52);
    }
    activeGame = null;
    setTimeout(goHide, 5500);
  }

  function cleanupFB(onKD, onKU) {
    fbState = null;
    cancelAnimationFrame(fbRAF); fbRAF = null;
    window.removeEventListener('keydown', onKD);
    window.removeEventListener('keyup',   onKU);
    activeGame = null;
    goHide();
  }

  // ── Socket: receive game invite popup ───────────────────────────────────
  socket.on('gameInvite', ({ game, gameName, hostUsername }) => {
    showGameInvitePopup(game, gameName, hostUsername);
  });

  // ── Socket: a player accepted/declined the invite ───────────────────────
  socket.on('gameJoinResponse', ({ username, accepted, game }) => {
    if (!activeGame || activeGame.type !== game || myRole !== 'owner') return;
    if (accepted) {
      if (!activeGame.players.includes(username)) {
        activeGame.players.push(username);
        activeGame.scores[username]  = 0;
        activeGame.streaks[username] = 0;
        renderWaitList();
        addSystemMessage('✅ ' + username + ' joined! (' + activeGame.players.length + ')');
      }
    }
  });

  // ── Socket: host launched the game — all joined players start ───────────
  socket.on('gameLaunch', ({ game, players }) => {
    if (!players.includes(myUsername)) return;  // we didn't join, ignore
    if (!activeGame) {
      activeGame = { type: game, state: 'lobby', players,
        scores: Object.fromEntries(players.map(p=>[p,0])),
        streaks: Object.fromEntries(players.map(p=>[p,0])) };
    } else {
      activeGame.type    = game;
      activeGame.players = players;
      players.forEach(p => { activeGame.scores[p]  = activeGame.scores[p]  || 0; });
      players.forEach(p => { activeGame.streaks[p] = activeGame.streaks[p] || 0; });
    }
    // Close invite popup if still open
    const popup = document.getElementById('game-invite-popup');
    if (popup) popup.remove();
    addSystemMessage('🎮 ' + (GAME_NAMES[game]||game.toUpperCase()) + ' — STARTING!');
    _doLaunchGame(game);
  });

  // Receive opponents' positions
  socket.on('gameState', data => {
    if (data.game === 'football' && fbState) {
      const p = fbState.players.find(p => p.name === data.payload.username && !p.isMe);
      if (p) { p.x = data.payload.x; p.y = data.payload.y; }
      // Non-hosts apply ball state from host
      if (data.payload.ball && myRole !== 'owner') {
        const b = data.payload.ball;
        fbState.ball.x = b.x; fbState.ball.y = b.y;
        fbState.ball.vx = b.vx; fbState.ball.vy = b.vy;
      }
    }
    if (data.game === 'pixelduel' && pdState) {
      const p = pdState.players.find(p => p.name === data.payload.username && !p.isMe);
      if (p) { p.x=data.payload.x; p.y=data.payload.y; p.hp=data.payload.hp??p.hp; p.angle=data.payload.angle??p.angle; }
    }
    if (data.game === 'pong' && pongState) {
      const pad = pongState.paddles.find(p => p.name === data.payload.username && !p.isMe);
      if (pad) pad.pos = data.payload.pos;
    }
    if (data.game === 'snake' && snakeState) {
      // Snake direction updates from remote players
      const sIdx = snakeState.snakes.findIndex(s => s.playerName === data.payload.username && !s.isMe);
      if (sIdx >= 0) snakeState.snakes[sIdx].nextDir = data.payload.dir;
    }
  });


  // ═══════════════════════════════════════════════════════════
  //  🎨  SKRIBBL  (full canvas draw + guess UI)
  // ═══════════════════════════════════════════════════════════
  const SK_COLORS = [
    '#000000','#3d3d3d','#7a7a7a','#c8c8c8','#ffffff',
    '#e94560','#ff6b35','#ffb700','#ffe066','#7bed9f',
    '#4cc9f0','#0077ff','#6c5ce7','#fd79a8','#a29bfe',
    '#00b894','#55efc4','#6d4c41','#ff9ff3','#ffeaa7',
  ];
  const SK_WORDS_BY_CAT = {
    '🐾 Animals':  ['cat','dog','shark','elephant','penguin','dragon','spider','jellyfish','giraffe','octopus','parrot','rhino','scorpion','platypus','narwhal'],
    '🏠 Objects':  ['guitar','telescope','umbrella','scissors','lighthouse','hourglass','compass','lantern','anchor','trophy','backpack','microscope','parachute','magnifying glass'],
    '🌍 Places':   ['volcano','castle','pyramid','igloo','treehouse','submarine','spaceship','windmill','skyscraper','cave','colosseum','great wall','eiffel tower'],
    '🍕 Food':     ['pizza','sushi','burger','taco','waffle','spaghetti','dumpling','pretzel','cupcake','hotdog','baguette','churro','fondue','pineapple'],
    '🏃 Actions':  ['dancing','surfing','climbing','juggling','swimming','flying','boxing','fishing','painting','skateboarding','diving','sneezing','yawning'],
    '⚡ Tech':     ['robot','keyboard','satellite','microchip','drone','virtual reality','laser','radar','calculator','3D printer','smartwatch'],
  };

  let skTool='pen', skColor='#000000', skSize=6, skIsDrawing=false;
  let skTimer=null, skBarInt=null, skTimeLeft=60, skCtx=null, skCanvas=null;

  function launchSkribbl() {
    goShow('gscreen-skribbl');
    activeGame.drawers = [...activeGame.players].sort(() => Math.random()-0.5);
    activeGame.drawerIdx = 0;
    activeGame.round = 0;
    activeGame.guessedThisRound = new Set();
    activeGame.players.forEach(p => { activeGame.scores[p]=0; });

    skCanvas = $g('sk-canvas');
    skCtx    = skCanvas?.getContext('2d');
    if (!skCanvas || !skCtx) return;

    buildSkPalette();
    setupSkToolbar();
    setupSkCanvas();
    setupSkGuessInput();
    renderSkScores();

    if (activeGame.players.length >= 2) {
      skNextRound();
    } else {
      // Solo practice
      addSystemMessage('⚠️ Solo mode — others will get an invite popup when you start!');
      skNextRound();
    }
  }

  function buildSkPalette() {
    const pal = $g('sk-palette');
    if (!pal) return;
    pal.innerHTML = '';
    SK_COLORS.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'sk-swatch' + (c === skColor ? ' active' : '');
      sw.style.background = c;
      sw.addEventListener('click', () => {
        skColor = c; skTool = 'pen';
        pal.querySelectorAll('.sk-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        setSkTool('pen');
      });
      pal.appendChild(sw);
    });
  }

  function setSkTool(t) {
    skTool = t;
    document.querySelectorAll('.sk-tool-btn').forEach(b => b.classList.remove('active'));
    $g('sk-tool-' + t)?.classList.add('active');
  }

  function setupSkToolbar() {
    $g('sk-tool-pen')?.addEventListener('click',    () => setSkTool('pen'));
    $g('sk-tool-eraser')?.addEventListener('click', () => setSkTool('eraser'));
    $g('sk-tool-fill')?.addEventListener('click',   () => setSkTool('fill'));
    $g('sk-size-range')?.addEventListener('input', e => { skSize = parseInt(e.target.value); });
    $g('sk-clear-btn')?.addEventListener('click', () => {
      if (skCtx && skCanvas) {
        skCtx.fillStyle = '#ffffff';
        skCtx.fillRect(0, 0, skCanvas.width, skCanvas.height);
      }
    });
  }

  function setupSkCanvas() {
    if (!skCanvas || !skCtx) return;
    const wrap = skCanvas.parentElement;
    function resizeSk() {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      // preserve drawing
      const tmp = document.createElement('canvas');
      tmp.width = skCanvas.width; tmp.height = skCanvas.height;
      tmp.getContext('2d').drawImage(skCanvas, 0, 0);
      skCanvas.width = w; skCanvas.height = h;
      skCtx.fillStyle = '#fff'; skCtx.fillRect(0,0,w,h);
      skCtx.drawImage(tmp, 0, 0, w, h);
    }
    resizeSk();
    window.addEventListener('resize', resizeSk);
    skCtx.fillStyle = '#fff'; skCtx.fillRect(0,0,skCanvas.width,skCanvas.height);

    let lx=0, ly=0;
    const isDrawer = () => activeGame?.drawerName === myUsername;
    const getPos = e => {
      const r = skCanvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x:(src.clientX-r.left)*(skCanvas.width/r.width), y:(src.clientY-r.top)*(skCanvas.height/r.height) };
    };
    const startDraw = e => {
      if (!isDrawer()) return;
      skIsDrawing = true;
      const p = getPos(e);
      if (skTool === 'fill') {
        skFloodFill(Math.round(p.x), Math.round(p.y), skColor);
        skIsDrawing = false; return;
      }
      lx = p.x; ly = p.y;
      skCtx.beginPath(); skCtx.moveTo(lx,ly);
    };
    const doDraw = e => {
      if (!skIsDrawing || !isDrawer()) return;
      e.preventDefault();
      const p = getPos(e);
      skCtx.globalCompositeOperation = skTool==='eraser' ? 'destination-out' : 'source-over';
      skCtx.strokeStyle = skTool==='eraser' ? 'rgba(0,0,0,1)' : skColor;
      skCtx.lineWidth   = skTool==='eraser' ? skSize*3 : skSize;
      skCtx.lineCap = 'round'; skCtx.lineJoin = 'round';
      skCtx.lineTo(p.x,p.y); skCtx.stroke();
      skCtx.beginPath(); skCtx.moveTo(p.x,p.y);
      lx=p.x; ly=p.y;
      skCtx.globalCompositeOperation = 'source-over';
    };
    const stopDraw = () => { skIsDrawing=false; };
    skCanvas.addEventListener('mousedown',  startDraw);
    skCanvas.addEventListener('mousemove',  doDraw);
    skCanvas.addEventListener('mouseup',    stopDraw);
    skCanvas.addEventListener('mouseleave', stopDraw);
    skCanvas.addEventListener('touchstart', e=>{e.preventDefault();startDraw(e);},{passive:false});
    skCanvas.addEventListener('touchmove',  e=>{e.preventDefault();doDraw(e);},{passive:false});
    skCanvas.addEventListener('touchend',   stopDraw);
  }

  function skFloodFill(sx, sy, fillColor) {
    const w = skCanvas.width, h = skCanvas.height;
    const img = skCtx.getImageData(0,0,w,h), d = img.data;
    const fi = (x,y)=>(y*w+x)*4;
    const tr=d[fi(sx,sy)],tg=d[fi(sx,sy)+1],tb=d[fi(sx,sy)+2];
    const fc = parseInt(fillColor.replace('#',''),16);
    const fr=(fc>>16)&255,fg=(fc>>8)&255,fb2=fc&255;
    if(tr===fr&&tg===fg&&tb===fb2)return;
    const stack=[[sx,sy]];
    const seen=new Uint8Array(w*h);
    const match=(x,y)=>{
      const i=fi(x,y);
      return Math.abs(d[i]-tr)<40&&Math.abs(d[i+1]-tg)<40&&Math.abs(d[i+2]-tb)<40;
    };
    while(stack.length){
      const [x,y]=stack.pop();
      if(x<0||x>=w||y<0||y>=h||seen[y*w+x]||!match(x,y))continue;
      seen[y*w+x]=1;
      const i=fi(x,y); d[i]=fr;d[i+1]=fg;d[i+2]=fb2;d[i+3]=255;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    skCtx.putImageData(img,0,0);
  }

  function setupSkGuessInput() {
    const input = $g('sk-guess-input'), btn = $g('sk-guess-btn');
    if (!input || !btn) return;
    const submit = () => {
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      addSkGuessLine(myUsername, val, 'normal');
      socket.emit('chatMessage',{roomName:currentRoom,username:myUsername,message:val,avatar:myAvatar});
      handleSkribblIncoming(myUsername, val);
    };
    btn.onclick = submit;
    input.addEventListener('keypress', e => { if(e.key==='Enter') submit(); });
  }

  function skNextRound() {
    if (!activeGame) return;
    clearTimeout(skTimer); clearInterval(skBarInt);
    if (activeGame.drawerIdx >= activeGame.drawers.length) { endSkribbl(); return; }

    // Clear canvas
    if (skCtx && skCanvas) {
      skCtx.fillStyle='#fff'; skCtx.fillRect(0,0,skCanvas.width,skCanvas.height);
    }

    activeGame.drawerName = activeGame.drawers[activeGame.drawerIdx];
    activeGame.round++;
    activeGame.guessedThisRound = new Set();
    activeGame.state = 'drawing';

    // Pick word
    const cats = Object.keys(SK_WORDS_BY_CAT);
    const cat  = cats[Math.floor(Math.random()*cats.length)];
    activeGame.currentWord = SK_WORDS_BY_CAT[cat][Math.floor(Math.random()*SK_WORDS_BY_CAT[cat].length)];
    activeGame.roundStart  = Date.now();

    const isMe = activeGame.drawerName === myUsername;
    $g('sk-round-info').textContent = 'Round ' + activeGame.round + '/' + activeGame.drawers.length;
    $g('sk-drawer-label').textContent = (isMe ? '✏️ You are drawing!' : '👀 ' + activeGame.drawerName + ' is drawing!');

    const toolbar = $g('sk-toolbar');
    const guessArea = $g('sk-guess-area');
    if (toolbar)   toolbar.style.display  = isMe ? 'flex' : 'none';
    if (guessArea) guessArea.style.display = isMe ? 'none' : 'flex';
    const guessInput = $g('sk-guess-input');
    if (guessInput) { guessInput.disabled = isMe; guessInput.placeholder = isMe ? 'You are drawing!' : 'Type your guess…'; }

    renderSkWordDisplay(activeGame.currentWord, isMe);

    if (isMe) {
      addSkGuessLine('🎮', 'Your word: ' + activeGame.currentWord.toUpperCase() + ' | Category: ' + cat, 'system');
    } else {
      addSkGuessLine('🎮', activeGame.drawerName + ' is drawing! Guess in the box below.', 'system');
    }
    renderSkScores();

    // Timer
    skTimeLeft = 60;
    $g('sk-time-left').textContent = '60';
    const bar = $g('sk-bar');
    if (bar) { bar.style.transition='none'; bar.style.width='100%'; bar.style.background='#4cc9f0'; }
    setTimeout(()=>{ if(bar){bar.style.transition='width 60s linear';bar.style.width='0%';} },80);

    clearInterval(skBarInt);
    skBarInt = setInterval(()=>{
      skTimeLeft--;
      $g('sk-time-left').textContent = skTimeLeft;
      if (bar) {
        if(skTimeLeft<=10) bar.style.background='#e94560';
        else if(skTimeLeft<=20) bar.style.background='#ffb700';
      }
      if(skTimeLeft<=0){ clearInterval(skBarInt); skTimeUp(); }
    },1000);
    clearTimeout(skTimer);
    skTimer = setTimeout(skTimeUp, 62000);
  }

  function renderSkWordDisplay(word, reveal) {
    const row = $g('sk-word-display');
    if (!row) return;
    row.innerHTML = '';
    word.split('').forEach(ch => {
      const el = document.createElement('div');
      if (ch === ' ') {
        el.className = 'sk-blank space'; el.textContent = ' ';
      } else {
        el.className = 'sk-blank';
        el.textContent = reveal ? ch.toUpperCase() : '';
      }
      row.appendChild(el);
    });
  }

  function revealSkWord() {
    const row = $g('sk-word-display');
    if (!row || !activeGame?.currentWord) return;
    const blanks = row.querySelectorAll('.sk-blank:not(.space)');
    activeGame.currentWord.replace(/ /g,'').split('').forEach((ch,i)=>{
      if(blanks[i]) blanks[i].textContent=ch.toUpperCase();
    });
  }

  function addSkGuessLine(user, text, type) {
    const el = $g('sk-guess-log');
    if (!el) return;
    const d = document.createElement('div');
    d.className = 'sk-guess-line ' + type;
    d.innerHTML = `<span class="sk-guess-user">${escapeHtml(user)}</span> ${escapeHtml(text)}`;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  }

  function renderSkScores() {
    const el = $g('sk-scores');
    if (!el || !activeGame) return;
    el.innerHTML = '<div class="sk-scores-title">🏆 Scores</div>';
    const medals = ['🥇','🥈','🥉'];
    Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]).forEach(([p,s],i)=>{
      const row = document.createElement('div');
      row.className = 'sk-score-row' + (p===myUsername?' me':'');
      row.innerHTML = `<span>${medals[i]||''} ${escapeHtml(p)}</span><span class="sk-score-pts">${s}</span>`;
      el.appendChild(row);
    });
  }

  function handleSkribblIncoming(username, msg) {
    if (!activeGame||activeGame.state!=='drawing'||username===activeGame.drawerName) return;
    if (activeGame.guessedThisRound?.has(username)) return;
    const guess = msg.toLowerCase().trim();
    const word  = activeGame.currentWord.toLowerCase();
    const exact = guess === word;
    const close = !exact && word.length>=4 && levenshtein(guess,word)===1;
    if (exact) {
      activeGame.guessedThisRound.add(username);
      const elapsed = Math.floor((Date.now()-activeGame.roundStart)/1000);
      const pts = Math.max(1, Math.floor((60-elapsed)/10)+2);
      activeGame.scores[username]=(activeGame.scores[username]||0)+pts;
      activeGame.scores[activeGame.drawerName]=(activeGame.scores[activeGame.drawerName]||0)+1;
      addSkGuessLine(username,'✅ GUESSED IT! (+'+pts+' pts)','correct');
      revealSkWord();
      renderSkScores();
      const guessers = activeGame.players.filter(p=>p!==activeGame.drawerName);
      if(guessers.every(p=>activeGame.guessedThisRound.has(p))){
        addSkGuessLine('🎮','Everyone guessed! Next round…','system');
        activeGame.drawerIdx++;
        clearTimeout(skTimer);clearInterval(skBarInt);
        setTimeout(skNextRound,2200);
      }
    } else if (close) {
      addSkGuessLine(username, '"'+msg+'" — so close! 🔥','close');
    } else {
      addSkGuessLine(username, msg, 'normal');
    }
  }

  function skTimeUp() {
    clearTimeout(skTimer); clearInterval(skBarInt);
    if(!activeGame||activeGame.state!=='drawing') return;
    addSkGuessLine('⏰','Time\'s up! Word was: '+activeGame.currentWord.toUpperCase(),'system');
    revealSkWord();
    renderSkScores();
    activeGame.drawerIdx++;
    setTimeout(skNextRound, 2500);
  }

  function endSkribbl() {
    clearTimeout(skTimer); clearInterval(skBarInt);
    if(!activeGame)return;
    const sorted=Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]);
    addSystemMessage('🎨 Skribbl over! Winner: '+(sorted[0]?.[0]||'?')+' with '+(sorted[0]?.[1]||0)+' pts!');
    renderSkScores();
    activeGame=null;
    setTimeout(goHide,5000);
  }

  $g('sk-quit')?.addEventListener('click',()=>{ stopAllGames(); goHide(); });


  // ═══════════════════════════════════════════════════════════
  //  📚  QUIZ BATTLE  (fullscreen with visible answer input)
  // ═══════════════════════════════════════════════════════════
  const QZ_BANK = [
    {q:'What is 7 × 8?',                          a:['56'],              cat:'🔢 Maths',     mc:['42','54','56','64']},
    {q:'What is √144?',                            a:['12'],              cat:'🔢 Maths',     mc:['11','12','13','14']},
    {q:'How many sides does a hexagon have?',      a:['6'],               cat:'🔢 Maths',     mc:['5','6','7','8']},
    {q:'What is 15% of 200?',                      a:['30'],              cat:'🔢 Maths',     mc:['20','25','30','35']},
    {q:'What is 2 to the power of 10?',            a:['1024'],            cat:'🔢 Maths',     mc:['512','1000','1024','2048']},
    {q:'Capital of France?',                       a:['paris'],           cat:'🌍 Geography', mc:['Lyon','Nice','Paris','Bordeaux']},
    {q:'Capital of Japan?',                        a:['tokyo'],           cat:'🌍 Geography', mc:['Osaka','Kyoto','Nagoya','Tokyo']},
    {q:'Capital of Australia?',                    a:['canberra'],        cat:'🌍 Geography', mc:['Sydney','Melbourne','Brisbane','Canberra']},
    {q:'Longest river in the world?',              a:['nile'],            cat:'🌍 Geography', mc:['Amazon','Nile','Yangtze','Mississippi']},
    {q:'How many continents?',                     a:['7'],               cat:'🌍 Geography', mc:['5','6','7','8']},
    {q:'What gas do plants absorb?',               a:['co2','carbon dioxide'], cat:'🔬 Science', mc:['O₂','N₂','CO₂','H₂']},
    {q:'The powerhouse of the cell?',              a:['mitochondria'],    cat:'🔬 Science',   mc:['Nucleus','Ribosome','Mitochondria','Golgi']},
    {q:'H₂O is the chemical formula for?',         a:['water'],           cat:'🔬 Science',   mc:['Hydrogen','Water','Salt','Oxygen']},
    {q:'Speed of sound in air (m/s approx)?',      a:['343'],             cat:'🔬 Science',   mc:['220','343','450','670']},
    {q:'Bones in the human body?',                 a:['206'],             cat:'🔬 Science',   mc:['196','206','216','226']},
    {q:'Chemical symbol for Gold?',                a:['au'],              cat:'🔬 Science',   mc:['Go','Gd','Au','Gl']},
    {q:'What year did WW2 end?',                   a:['1945'],            cat:'📜 History',   mc:['1943','1944','1945','1946']},
    {q:'Who invented the telephone?',              a:['bell','alexander graham bell'], cat:'📜 History', mc:['Edison','Bell','Tesla','Marconi']},
    {q:'Titanic sank in what year?',               a:['1912'],            cat:'📜 History',   mc:['1908','1910','1912','1914']},
    {q:'Who wrote Romeo and Juliet?',              a:['shakespeare'],     cat:'📖 Literature',mc:['Dickens','Shakespeare','Austen','Milton']},
    {q:'Strings on a standard guitar?',            a:['6'],               cat:'🎵 Music',     mc:['4','5','6','7']},
    {q:'Keys on a standard piano?',                a:['88'],              cat:'🎵 Music',     mc:['76','82','88','92']},
    {q:'What sport uses a shuttlecock?',           a:['badminton'],       cat:'⚽ Sport',     mc:['Tennis','Squash','Badminton','Pickleball']},
    {q:'Players in a rugby union team?',           a:['15'],              cat:'⚽ Sport',     mc:['11','13','15','16']},
    {q:'Largest planet in our solar system?',      a:['jupiter'],         cat:'🔭 Space',     mc:['Saturn','Jupiter','Neptune','Uranus']},
    {q:'Planet closest to the Sun?',               a:['mercury'],         cat:'🔭 Space',     mc:['Venus','Mercury','Earth','Mars']},
    {q:'How many moons does Mars have?',           a:['2'],               cat:'🔭 Space',     mc:['0','1','2','4']},
  ];

  let qzTimer=null, qzBarInt=null, qzTimeLeft=15, qzMyAnswered=false;
  const QZ_TIME=15;

  function launchQuiz() {
    goShow('gscreen-quiz');
    activeGame.state   = 'quiz-idle';
    activeGame.qBank   = [...QZ_BANK].sort(()=>Math.random()-.5).slice(0,10);
    activeGame.qIdx    = 0;
    activeGame.players.forEach(p=>{activeGame.scores[p]=0;activeGame.streaks[p]=0;});
    setupQzInput();
    renderQzScores();
    $g('qz-question-text').textContent='Get ready…';
    $g('qz-options').innerHTML='';
    $g('qz-feedback').textContent='';
    $g('qz-feedback').className='qz-feedback';
    setTimeout(qzNextQuestion, 1200);
  }

  function setupQzInput() {
    const input=$g('qz-text-input'), btn=$g('qz-submit-btn');
    if(!input||!btn)return;
    input.value=''; input.disabled=false; input.focus();
    const submit=()=>{
      const val=input.value.trim();
      if(!val||qzMyAnswered||activeGame?.state!=='question')return;
      input.value='';
      handleQuizIncoming(myUsername,val);
    };
    btn.onclick=submit;
    input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit();}};
  }

  function qzNextQuestion() {
    if(!activeGame||activeGame.qIdx>=activeGame.qBank.length){endQuiz();return;}
    clearTimeout(qzTimer);clearInterval(qzBarInt);
    const q=activeGame.qBank[activeGame.qIdx];
    activeGame.state='question';
    activeGame.currentAnswers=q.a.map(a=>a.toLowerCase().replace(/\s+/g,''));
    activeGame.qStart=Date.now();
    qzMyAnswered=false;
    qzTimeLeft=QZ_TIME;

    $g('qz-cat-label').textContent=q.cat;
    $g('qz-prog').textContent='Q '+(activeGame.qIdx+1)+'/'+activeGame.qBank.length;
    $g('qz-question-text').textContent=q.q;
    const fb=$g('qz-feedback');fb.textContent='';fb.className='qz-feedback';
    const inp=$g('qz-text-input');if(inp){inp.disabled=false;inp.value='';inp.focus();}

    // Multiple choice buttons
    const optsEl=$g('qz-options');
    optsEl.innerHTML='';
    if(q.mc){
      const shuffled=[...q.mc].sort(()=>Math.random()-.5);
      shuffled.forEach(opt=>{
        const btn=document.createElement('button');
        btn.className='qz-opt-btn';
        btn.textContent=opt;
        btn.onclick=()=>{
          if(qzMyAnswered||activeGame?.state!=='question')return;
          document.querySelectorAll('.qz-opt-btn').forEach(b=>b.classList.add('disabled'));
          btn.classList.add('selected');
          const inp=$g('qz-text-input');if(inp)inp.value=opt;
          handleQuizIncoming(myUsername,opt);
        };
        optsEl.appendChild(btn);
      });
    }

    // Timer bar
    const bar=$g('qz-bar');
    $g('qz-secs').textContent=QZ_TIME;
    if(bar){bar.style.transition='none';bar.style.width='100%';bar.style.background='#4cc9f0';}
    setTimeout(()=>{ if(bar){bar.style.transition='width '+QZ_TIME+'s linear';bar.style.width='0%';} },60);

    clearInterval(qzBarInt);
    qzBarInt=setInterval(()=>{
      qzTimeLeft--;
      $g('qz-secs').textContent=qzTimeLeft;
      if(bar){ if(qzTimeLeft<=4)bar.style.background='#e94560';else if(qzTimeLeft<=8)bar.style.background='#ffb700'; }
      if(qzTimeLeft<=0){clearInterval(qzBarInt);qzTimeUp();}
    },1000);
    clearTimeout(qzTimer);
    qzTimer=setTimeout(qzTimeUp,(QZ_TIME+1)*1000);
  }

  function qzTimeUp(){
    clearTimeout(qzTimer);clearInterval(qzBarInt);
    if(!activeGame||activeGame.state!=='question')return;
    const q=activeGame.qBank[activeGame.qIdx];
    const fb=$g('qz-feedback');
    if(fb){fb.className='qz-feedback wrong';fb.textContent='⏰ Time\'s up! Answer was: '+q.a[0].toUpperCase();}
    const inp=$g('qz-text-input');if(inp)inp.disabled=true;
    document.querySelectorAll('.qz-opt-btn').forEach(btn=>{
      if(q.a.some(a=>btn.textContent.toLowerCase()===a.toLowerCase()))btn.classList.add('correct');
    });
    activeGame.players.forEach(p=>{activeGame.streaks[p]=0;});
    renderQzScores();
    activeGame.qIdx++;
    setTimeout(qzNextQuestion,2600);
  }

  function handleQuizIncoming(username,msg){
    if(!activeGame||activeGame.state!=='question')return;
    const norm=msg.toLowerCase().replace(/\s+/g,'');
    const hit=activeGame.currentAnswers?.some(a=>norm===a||(a.length>=4&&levenshtein(norm,a)<=1));
    if(!hit)return;
    const isMe=username===myUsername;
    if(isMe&&qzMyAnswered)return;
    if(isMe)qzMyAnswered=true;

    const elapsed=Math.floor((Date.now()-activeGame.qStart)/1000);
    const speed=Math.max(0,QZ_TIME-elapsed);
    const streak=(activeGame.streaks[username]||0)+1;
    activeGame.streaks[username]=streak;
    const pts=1+Math.floor(speed/5)+Math.min(streak-1,3);
    activeGame.scores[username]=(activeGame.scores[username]||0)+pts;
    activeGame.players.forEach(p=>{if(p!==username)activeGame.streaks[p]=0;});

    if(isMe){
      clearTimeout(qzTimer);clearInterval(qzBarInt);
      const fb=$g('qz-feedback');
      if(fb){fb.className='qz-feedback correct';fb.textContent='✅ Correct! +'+pts+' pts'+(streak>1?' 🔥 Streak ×'+streak:'');}
      const inp=$g('qz-text-input');if(inp)inp.disabled=true;
      // highlight correct MC option
      const q=activeGame.qBank[activeGame.qIdx];
      document.querySelectorAll('.qz-opt-btn').forEach(btn=>{
        if(q.a.some(a=>btn.textContent.toLowerCase()===a.toLowerCase()))btn.classList.add('correct');
        else if(btn.classList.contains('selected'))btn.classList.add('wrong');
      });
      renderQzScores();
      activeGame.qIdx++;
      setTimeout(qzNextQuestion,2200);
    } else {
      // Another player got it first — show in log
      const fb=$g('qz-feedback');
      if(fb&&!qzMyAnswered){fb.className='qz-feedback info';fb.textContent=username+' got it first! +'+pts+' pts';}
      renderQzScores();
    }
  }

  function renderQzScores(){
    const el=$g('qz-scores');if(!el||!activeGame)return;
    el.innerHTML='';
    const medals=['🥇','🥈','🥉'];
    Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]).forEach(([p,s],i)=>{
      const row=document.createElement('div');
      row.className='qz-score-row'+(p===myUsername?' me':'');
      row.innerHTML=`<span>${medals[i]||'  '} ${escapeHtml(p)}</span><span class="qz-pts">${s}${activeGame.streaks[p]>1?' 🔥':''}`;
      el.appendChild(row);
    });
  }

  function endQuiz(){
    clearTimeout(qzTimer);clearInterval(qzBarInt);
    if(!activeGame)return;
    const sorted=Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]);
    $g('qz-question-text').textContent='🏁 Game Over!';
    $g('qz-options').innerHTML='';
    const fb=$g('qz-feedback');if(fb){fb.className='qz-feedback correct';fb.textContent='Winner: '+(sorted[0]?.[0]||'?')+' with '+(sorted[0]?.[1]||0)+' pts!';}
    addSystemMessage('📚 Quiz done! Winner: '+(sorted[0]?.[0]||'?')+' — '+(sorted[0]?.[1]||0)+' pts');
    activeGame=null;
    setTimeout(goHide,6000);
  }

  $g('qz-quit')?.addEventListener('click',()=>{stopAllGames();goHide();});


  // ═══════════════════════════════════════════════════════════
  //  💣  WORD BOMB
  // ═══════════════════════════════════════════════════════════
  const WB_SYLS=['ab','ac','ad','al','an','ap','ar','as','at','ba','be','bi','bl','bo','br','bu','ca','ch','cl','co','cr','da','de','di','do','dr','ea','ed','el','en','er','es','ex','fa','fi','fl','fo','fr','ga','gl','go','gr','ha','he','hi','ho','hu','ic','id','im','in','ir','is','it','jo','ju','ka','ke','ki','la','le','li','lo','lu','ma','me','mi','mo','mu','na','ne','ni','no','ob','od','of','om','on','op','or','os','ov','pa','pe','pi','pl','po','pr','pu','ra','re','ri','ro','ru','sa','sc','se','sh','si','sk','sl','sm','sn','so','sp','st','su','sw','ta','te','th','ti','to','tr','tu','un','up','ur','us','va','vi','vo','wa','we','wh','wi','wo','ya','ye','yo'];
  const WB_DICT=new Set('absolute abandon about above accept across action active actual add admit adopt advance after again against age agree ahead aim air allow almost alone along already also among amount and another any appeal apple apply area argue arm around arrive ask assist attack attempt attend avoid baby back bad ball band bank base basis battle beach bear beat become before begin behind believe below bench between beyond block blood blow board book both bring build burn buy call calm camp care carry case cause certain chance change charge check child city claim class clear climb close code cold common continue copy create crime cross crowd current cycle daily dance dark deal death deep define describe design detail develop direct distance done doubt down draft draw dream drink drive drop each early earth easy edge even event ever examine exist expect extra face fact fail fair fall family fame fast feel field fight file final find fire first flat flow focus food force form found free front full gain game give glad goal good grab grade grand great green grow guide half hand happen hard have head heat help high hill home hope host hour house huge human hunt idea image include indicate input join judge jump keep kind king know land large later lead learn leave less level life light link list live long look lord lose love lucky main make many mark match matter mean mind miss model money month more most move much name nation natural need never next nice night note number object occur offer often open order other over page part path people phone pick plan play point policy post power press print problem process program prove pull push quick race raise reach read ready real reason receive record reflect rely remain report rest result right ring road rock role round rule save scale seek sell send sense series service show sign size skill small smart social some sort space speak spend start state store study system table take task team tell test text time tool total town train trust truth type under unit until upon user usual valid value very view visit voice wait want work world write year zone'.split(' '));

  let wbTimer=null,wbFuseInt=null;

  function launchWordBomb(){
    goShow('gscreen-wordbomb');
    activeGame.state='wordbomb';
    activeGame.lives={};
    activeGame.usedWords=new Set();
    activeGame.playerIdx=0;
    activeGame.players.forEach(p=>{activeGame.lives[p]=3;});
    renderWbLives();
    wbNextTurn();
  }

  function wbNextTurn(){
    if(!activeGame||activeGame.state!=='wordbomb')return;
    // skip eliminated players
    let tries=0;
    while(activeGame.lives[activeGame.players[activeGame.playerIdx]]<=0&&tries<activeGame.players.length){
      activeGame.playerIdx=(activeGame.playerIdx+1)%activeGame.players.length; tries++;
    }
    activeGame.currentPlayer=activeGame.players[activeGame.playerIdx];
    activeGame.currentSyl=WB_SYLS[Math.floor(Math.random()*WB_SYLS.length)].toUpperCase();

    $g('wb-syl').textContent=activeGame.currentSyl;
    const isMe=activeGame.currentPlayer===myUsername;
    $g('wb-whose-turn').textContent=isMe?'YOUR TURN! 💥':activeGame.currentPlayer+"'s turn";
    const inputRow=$g('wb-input-row');
    if(inputRow)inputRow.style.display=isMe?'flex':'none';
    const inp=$g('wb-text-input');if(inp){inp.value='';if(isMe)setTimeout(()=>inp.focus(),50);}
    $g('wb-bomb-emoji').className='wb-bomb-anim';

    // Fuse
    clearTimeout(wbTimer);clearInterval(wbFuseInt);
    let fuseLeft=100;
    const fuseEl=$g('wb-fuse-fill');
    if(fuseEl){fuseEl.style.transition='none';fuseEl.style.width='100%';fuseEl.style.background='#7bed9f';}
    setTimeout(()=>{ if(fuseEl){fuseEl.style.transition='width 8s linear';fuseEl.style.width='0%';} },60);
    wbFuseInt=setInterval(()=>{
      fuseLeft-=12.5;
      if(fuseLeft<=30&&fuseEl)fuseEl.style.background='#e94560';
      else if(fuseLeft<=60&&fuseEl)fuseEl.style.background='#ffb700';
      if(fuseLeft<=0){clearInterval(wbFuseInt);wbExplode();}
    },1000);
    wbTimer=setTimeout(wbExplode,9500);
  }

  function wbExplode(){
    clearTimeout(wbTimer);clearInterval(wbFuseInt);
    if(!activeGame||activeGame.state!=='wordbomb')return;
    const p=activeGame.currentPlayer;
    activeGame.lives[p]=Math.max(0,(activeGame.lives[p]||0)-1);
    wbLog('💥 '+p+' exploded! '+(activeGame.lives[p]>0?activeGame.lives[p]+' ❤️ left':'ELIMINATED! 💀'));
    $g('wb-bomb-emoji').className='wb-bomb-explode';
    setTimeout(()=>{ if($g('wb-bomb-emoji'))$g('wb-bomb-emoji').className='wb-bomb-anim'; },600);
    renderWbLives();
    const alive=activeGame.players.filter(p2=>(activeGame.lives[p2]||0)>0);
    if(alive.length<=1){endWordBomb(alive[0]);return;}
    activeGame.playerIdx=(activeGame.playerIdx+1)%activeGame.players.length;
    setTimeout(wbNextTurn,1400);
  }

  function wbHandleWord(username,word){
    if(!activeGame||activeGame.state!=='wordbomb')return;
    if(username!==activeGame.currentPlayer)return;
    const lower=word.toLowerCase().trim();
    const syl=activeGame.currentSyl.toLowerCase();
    if(!lower.includes(syl)){wbLog('❌ "'+word+'" doesn\'t contain '+activeGame.currentSyl);return;}
    if(activeGame.usedWords.has(lower)){wbLog('❌ "'+word+'" already used!');return;}
    if(lower.length<3){wbLog('❌ Too short!');return;}
    if(lower.length>=3&&lower.length<5&&!WB_DICT.has(lower)){wbLog('❓ "'+word+'" — not recognized, try again');return;}
    clearTimeout(wbTimer);clearInterval(wbFuseInt);
    activeGame.usedWords.add(lower);
    wbLog('✅ '+username+': "'+word.toUpperCase()+'"');
    activeGame.playerIdx=(activeGame.playerIdx+1)%activeGame.players.length;
    setTimeout(wbNextTurn,700);
  }

  $g('wb-submit-btn')?.addEventListener('click',()=>{
    const inp=$g('wb-text-input');if(!inp)return;
    const val=inp.value.trim();if(!val)return;
    inp.value='';
    socket.emit('chatMessage',{roomName:currentRoom,username:myUsername,message:val,avatar:myAvatar});
    wbHandleWord(myUsername,val);
  });
  $g('wb-text-input')?.addEventListener('keypress',e=>{if(e.key==='Enter')$g('wb-submit-btn')?.click();});

  function renderWbLives(){
    const el=$g('wb-lives-display');if(!el||!activeGame)return;
    el.innerHTML='';
    activeGame.players.forEach(p=>{
      const lives=activeGame.lives[p]||0;
      const chip=document.createElement('div');
      chip.className='wb-player-chip'+(lives<=0?' dead':p===myUsername?' me':'');
      chip.innerHTML=escapeHtml(p)+' '+'❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));
      el.appendChild(chip);
    });
  }

  function wbLog(msg){
    const el=$g('wb-log');if(!el)return;
    const d=document.createElement('div');d.className='wb-log-line';d.textContent=msg;
    el.appendChild(d);el.scrollTop=el.scrollHeight;
  }

  function endWordBomb(winner){
    clearTimeout(wbTimer);clearInterval(wbFuseInt);
    wbLog(winner?'🏆 '+winner+' WINS!':'💣 Everyone exploded!');
    addSystemMessage('💣 Word Bomb: '+(winner?winner+' wins!':'Draw!'));
    const inputRow=$g('wb-input-row');if(inputRow)inputRow.style.display='none';
    activeGame=null;
    setTimeout(goHide,4000);
  }

  $g('wb-quit')?.addEventListener('click',()=>{stopAllGames();goHide();});


  // ═══════════════════════════════════════════════════════════
  //  🔫  PIXEL DUEL  — Top-down arena shooter
  //  WASD to move, mouse/facing to aim, SPACE/F to shoot
  //  Best of 5 rounds, 100 HP each
  // ═══════════════════════════════════════════════════════════
  let pdRAF=null, pdState=null;

  // Top-down arena dimensions
  const PD_VW=800, PD_VH=600, PD_PRAD=14, PD_BSPD=10, PD_PSPD=3.2;

  // Arena obstacles (pixel-art pillars/walls)
  const PD_WALLS=[
    {x:180,y:140,w:60,h:60},{x:560,y:140,w:60,h:60},
    {x:360,y:80,w:80,h:30},
    {x:180,y:400,w:60,h:60},{x:560,y:400,w:60,h:60},
    {x:360,y:490,w:80,h:30},
    {x:340,y:270,w:120,h:60},  // center cover
  ];

  function launchPixelDuel(){
    if(activeGame.players.length<2){addSystemMessage('⚠️ Pixel Duel needs 2 players. Wait for someone to accept the invite!');return;}
    goShow('gscreen-pixelduel');
    const p1n=activeGame.players[0],p2n=activeGame.players[1];

    pdState={
      over:false,roundOver:false,
      round:1,maxRounds:5,
      players:[
        {name:p1n,isMe:p1n===myUsername,color:'#4cc9f0',x:120,y:300,vx:0,vy:0,hp:100,score:0,angle:0,reloadT:0,flashT:0},
        {name:p2n,isMe:p2n===myUsername,color:'#e94560',x:680,y:300,vx:0,vy:0,hp:100,score:0,angle:Math.PI,reloadT:0,flashT:0},
      ],
      bullets:[],keys:{},particles:[],
    };
    $g('pd-p1-name').textContent=p1n; $g('pd-p2-name').textContent=p2n;
    $g('pd-p1-score').textContent='0'; $g('pd-p2-score').textContent='0';
    $g('pd-round-label').textContent='Round 1/'+pdState.maxRounds;
    updatePdHP();

    const canvas=$g('pd-canvas');if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const wrap=canvas.parentElement;
    function resizePD(){
      const r=canvas.getBoundingClientRect();
      canvas.width=r.width||wrap.clientWidth||window.innerWidth;
      canvas.height=r.height||wrap.clientHeight||(window.innerHeight-60);
    }
    requestAnimationFrame(()=>resizePD());window.addEventListener('resize',resizePD);

    const onKD=e=>{ pdState.keys[e.key]=true; if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault(); };
    const onKU=e=>{delete pdState.keys[e.key];};
    window.addEventListener('keydown',onKD);window.addEventListener('keyup',onKU);

    // Mouse aiming for local player
    canvas.onmousemove=e=>{
      if(!pdState)return;
      const me=pdState.players.find(p=>p.isMe);
      if(!me)return;
      const rect=canvas.getBoundingClientRect();
      const scaleX=canvas.width/rect.width, scaleY=canvas.height/rect.height;
      const mx=(e.clientX-rect.left)*scaleX, my=(e.clientY-rect.top)*scaleY;
      // Convert canvas coords to world coords
      const cw=canvas.width,ch=canvas.height;
      const s=Math.min(cw/PD_VW,ch/PD_VH);
      const ox=(cw-PD_VW*s)/2, oy=(ch-PD_VH*s)/2;
      const wx=(mx-ox)/s, wy=(my-oy)/s;
      me.angle=Math.atan2(wy-me.y, wx-me.x);
    };

    const bcInt=setInterval(()=>{
      if(!pdState||pdState.over){clearInterval(bcInt);return;}
      const me=pdState.players.find(p=>p.isMe);
      if(me)socket.emit('gameState',{roomName:currentRoom,game:'pixelduel',payload:{username:me.name,x:me.x,y:me.y,hp:me.hp,angle:me.angle}});
    },50);

    function pdLoop(){
      if(!pdState||pdState.over)return;
      const cwr=canvas.getBoundingClientRect().width;
      if(cwr>0&&Math.abs(canvas.width-cwr)>2)resizePD();
      pdTick();
      pdDraw(ctx,canvas);
      pdRAF=requestAnimationFrame(pdLoop);
    }
    pdRAF=requestAnimationFrame(pdLoop);

    $g('pd-quit')?.addEventListener('click',()=>{
      cancelAnimationFrame(pdRAF);pdRAF=null;clearInterval(bcInt);
      window.removeEventListener('keydown',onKD);window.removeEventListener('keyup',onKU);
      canvas.onmousemove=null;
      activeGame=null;goHide();
    });
  }

  function pdWallCollide(x,y,r){
    // Returns true if circle (x,y,r) overlaps any wall
    for(const w of PD_WALLS){
      const cx=Math.max(w.x,Math.min(w.x+w.w,x));
      const cy=Math.max(w.y,Math.min(w.y+w.h,y));
      if(Math.hypot(x-cx,y-cy)<r)return w;
    }
    return null;
  }

  function pdTick(){
    if(!pdState||pdState.roundOver)return;
    const k=pdState.keys;

    pdState.players.forEach((p,idx)=>{
      if(!p.isMe)return;

      // WASD movement (top-down — no gravity)
      const left =k['a']||k['A']||k['ArrowLeft'];
      const right=k['d']||k['D']||k['ArrowRight'];
      const up   =k['w']||k['W']||k['ArrowUp'];
      const down =k['s']||k['S']||k['ArrowDown'];

      let ax=0,ay=0;
      if(left)ax-=1; if(right)ax+=1;
      if(up)ay-=1;   if(down)ay+=1;
      if(ax&&ay){ax*=0.707;ay*=0.707;}

      const lerp=0.18;
      p.vx+=(ax*PD_PSPD-p.vx)*lerp;
      p.vy+=(ay*PD_PSPD-p.vy)*lerp;

      // Move X then Y with wall separation
      let nx=p.x+p.vx, ny=p.y+p.vy;
      if(!pdWallCollide(nx,p.y,PD_PRAD))p.x=nx; else p.vx=0;
      if(!pdWallCollide(p.x,ny,PD_PRAD))p.y=ny; else p.vy=0;
      p.x=Math.max(PD_PRAD,Math.min(PD_VW-PD_PRAD,p.x));
      p.y=Math.max(PD_PRAD,Math.min(PD_VH-PD_PRAD,p.y));

      // Keyboard aiming fallback (when no mouse)
      if(left||right||up||down){
        if(ax||ay) p.angle=Math.atan2(ay,ax);
      }

      if(p.flashT>0)p.flashT--;

      // Shoot — SPACE or F
      const shootKey=k[' ']||k['f']||k['F'];
      if(shootKey&&p.reloadT<=0){
        const bx=p.x+Math.cos(p.angle)*(PD_PRAD+6);
        const by=p.y+Math.sin(p.angle)*(PD_PRAD+6);
        pdState.bullets.push({x:bx,y:by,vx:Math.cos(p.angle)*PD_BSPD,vy:Math.sin(p.angle)*PD_BSPD,owner:idx,life:70});
        p.reloadT=18;
        // Recoil
        p.vx-=Math.cos(p.angle)*0.8;
        p.vy-=Math.sin(p.angle)*0.8;
      }
      if(p.reloadT>0)p.reloadT--;
    });

    // Bullets
    pdState.bullets=pdState.bullets.filter(b=>{
      b.x+=b.vx; b.y+=b.vy; b.life--;
      if(b.life<=0||b.x<0||b.x>PD_VW||b.y<0||b.y>PD_VH)return false;
      if(pdWallCollide(b.x,b.y,4))return false;  // bullet hits wall
      let hit=false;
      pdState.players.forEach((p,idx)=>{
        if(idx===b.owner||hit)return;
        if(Math.hypot(b.x-p.x,b.y-p.y)<PD_PRAD+4){
          p.hp=Math.max(0,p.hp-20); p.flashT=8; hit=true;
          pdSpawnHit(b.x,b.y,pdState.players[b.owner]?.color||'#fff');
          updatePdHP();
          if(p.hp<=0)pdRoundOver(b.owner);
        }
      });
      return !hit;
    });

    // Particles
    if(pdState.particles){
      pdState.particles=pdState.particles.filter(pt=>{
        pt.x+=pt.vx;pt.y+=pt.vy;pt.life--;pt.vx*=0.92;pt.vy*=0.92;
        return pt.life>0;
      });
    }
  }

  function updatePdHP(){
    if(!pdState)return;
    const h1=$g('pd-p1-hp'),h2=$g('pd-p2-hp');
    if(h1)h1.style.width=pdState.players[0].hp+'%';
    if(h2)h2.style.width=pdState.players[1].hp+'%';
    const hpColor=hp=>hp>50?'#7bed9f':hp>25?'#ffb700':'#e94560';
    if(h1)h1.style.background=hpColor(pdState.players[0].hp);
    if(h2)h2.style.background=hpColor(pdState.players[1].hp);
  }

  function pdSpawnHit(x,y,color){
    if(!pdState.particles)pdState.particles=[];
    for(let i=0;i<10;i++){
      const a=Math.random()*Math.PI*2,sp=Math.random()*3+1;
      pdState.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:Math.floor(Math.random()*18+10),color});
    }
  }

  function pdRoundOver(winnerIdx){
    if(!pdState||pdState.roundOver)return;
    pdState.roundOver=true;
    pdState.players[winnerIdx].score++;
    $g('pd-p1-score').textContent=pdState.players[0].score;
    $g('pd-p2-score').textContent=pdState.players[1].score;
    addSystemMessage('🔫 Round '+pdState.round+': '+pdState.players[winnerIdx].name+' wins!');
    if(pdState.players[winnerIdx].score>=Math.ceil(pdState.maxRounds/2)){pdGameOver(winnerIdx);return;}
    pdState.round++;
    $g('pd-round-label').textContent='Round '+pdState.round+'/'+pdState.maxRounds;
    setTimeout(()=>{
      if(!pdState)return;
      pdState.players[0].x=120;pdState.players[0].y=300;pdState.players[0].angle=0;
      pdState.players[1].x=680;pdState.players[1].y=300;pdState.players[1].angle=Math.PI;
      pdState.players.forEach(p=>{p.vx=0;p.vy=0;p.hp=100;p.reloadT=0;p.flashT=0;});
      pdState.bullets=[];pdState.particles=[];pdState.roundOver=false;
      updatePdHP();
    },2200);
  }

  function pdGameOver(winnerIdx){
    cancelAnimationFrame(pdRAF);pdRAF=null;
    if(pdState)pdState.over=true;
    addSystemMessage('🏆 '+pdState.players[winnerIdx].name+' wins the Pixel Duel!');
    activeGame=null;
    setTimeout(goHide,4000);
  }

  function pdDraw(ctx,canvas){
    if(!pdState)return;
    const cw=canvas.width,ch=canvas.height;
    const s=Math.min(cw/PD_VW,ch/PD_VH);
    const ox=(cw-PD_VW*s)/2, oy=(ch-PD_VH*s)/2;
    const lx=x=>ox+x*s, ly=y=>oy+y*s, ls=v=>v*s;

    // Background — dark tiled floor
    ctx.fillStyle='#0a0a14'; ctx.fillRect(0,0,cw,ch);
    const tileS=ls(40);
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
    for(let x=ox%tileS;x<cw;x+=tileS){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ch);ctx.stroke();}
    for(let y=oy%tileS;y<ch;y+=tileS){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cw,y);ctx.stroke();}

    // Arena border
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=ls(3);
    ctx.strokeRect(lx(0),ly(0),ls(PD_VW),ls(PD_VH));

    // Walls / obstacles
    PD_WALLS.forEach(w=>{
      // Shadow
      ctx.fillStyle='rgba(0,0,0,0.4)';
      ctx.fillRect(lx(w.x+4),ly(w.y+4),ls(w.w),ls(w.h));
      // Main block
      ctx.fillStyle='#2a2a4a';
      ctx.fillRect(lx(w.x),ly(w.y),ls(w.w),ls(w.h));
      // Top highlight
      ctx.fillStyle='rgba(255,255,255,0.08)';
      ctx.fillRect(lx(w.x),ly(w.y),ls(w.w),ls(4));
      // Pixel border
      ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=ls(2);
      ctx.strokeRect(lx(w.x),ly(w.y),ls(w.w),ls(w.h));
    });

    // Bullets
    pdState.bullets.forEach(b=>{
      ctx.shadowColor='#fff7a0'; ctx.shadowBlur=ls(6);
      ctx.fillStyle='#ffffa0';
      ctx.fillRect(lx(b.x-3),ly(b.y-3),ls(6),ls(6));
      ctx.shadowBlur=0;
    });

    // Particles
    (pdState.particles||[]).forEach(pt=>{
      ctx.globalAlpha=pt.life/25;
      ctx.fillStyle=pt.color;
      ctx.fillRect(lx(pt.x-2),ly(pt.y-2),ls(4),ls(4));
    });
    ctx.globalAlpha=1;

    // Players
    pdState.players.forEach(p=>{
      const flash=p.flashT>0&&(p.flashT%2===0);
      ctx.shadowColor=flash?'#fff':p.color; ctx.shadowBlur=ls(flash?20:10);

      // Body circle
      ctx.fillStyle=flash?'#fff':p.color;
      ctx.beginPath(); ctx.arc(lx(p.x),ly(p.y),ls(PD_PRAD),0,Math.PI*2); ctx.fill();

      // Inner circle (darker centre)
      ctx.fillStyle='rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.arc(lx(p.x),ly(p.y),ls(PD_PRAD*0.55),0,Math.PI*2); ctx.fill();

      // Aim direction indicator
      ctx.strokeStyle=flash?'#fff':p.color; ctx.lineWidth=ls(3);
      ctx.shadowBlur=ls(6);
      ctx.beginPath();
      ctx.moveTo(lx(p.x+Math.cos(p.angle)*PD_PRAD),ly(p.y+Math.sin(p.angle)*PD_PRAD));
      ctx.lineTo(lx(p.x+Math.cos(p.angle)*(PD_PRAD+12)),ly(p.y+Math.sin(p.angle)*(PD_PRAD+12)));
      ctx.stroke();
      ctx.shadowBlur=0;

      // Name tag
      ctx.fillStyle=p.color; ctx.font=`${ls(8)}px 'Press Start 2P',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText(p.name.substring(0,8),lx(p.x),ly(p.y-PD_PRAD-4));
    });

    // Round over overlay
    if(pdState.roundOver&&!pdState.over){
      ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(lx(0),ly(0),ls(PD_VW),ls(PD_VH));
      ctx.fillStyle='#ffd700'; ctx.font=`${ls(22)}px 'Press Start 2P',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('ROUND OVER',lx(PD_VW/2),ly(PD_VH/2));
      ctx.font=`${ls(11)}px 'Press Start 2P',monospace`;
      ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.fillText('Next round starting…',lx(PD_VW/2),ly(PD_VH/2)+ls(34));
    }

    drawScanlines(ctx,cw,ch);
  }

  let pongRAF = null, pongState = null;

  function launchPong() {
    goShow('gscreen-pong');
    activeGame.state = 'playing';
    const players = activeGame.players;
    const canvas = $g('pong-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;

    const PW = 900, PH = 600, WIN = 7;
    const BALL_R = 9;
    // Wall assignments by player count:
    // 1p: left(P0) vs CPU right
    // 2p: left(P0) vs right(P1)
    // 3p: left(P0) right(P1) top(P2)
    // 4p: left(P0) right(P1) top(P2) bottom(P3)
    const SIDES = ['left','right','top','bottom'];
    const cpuMode = players.length === 1;
    const allPlayers = cpuMode ? [...players, '🤖 CPU'] : players;
    const numPaddles = Math.min(allPlayers.length, 4);

    // Paddle config: pos along their wall (0..1), thickness, length
    const PAD_THICK = 14, PAD_LEN = 100;
    const mkPad = (side, name, idx) => ({
      side, name, idx,
      pos: 0.5,       // normalised position along the wall
      vel: 0,
      score: 0,
      isMe: name === myUsername,
      isCpu: name === '🤖 CPU',
      color: ['#4cc9f0','#e94560','#7bed9f','#ffd700'][idx % 4],
    });
    const paddles = allPlayers.slice(0, 4).map((n, i) => mkPad(SIDES[i], n, i));

    // If only 2 paddles: only left/right walls are active, top/bottom bounce
    // If 3+: active walls = paddle sides, others bounce

    pongState = {
      paddles, numPaddles,
      ball: { x: PW/2, y: PH/2, vx: (Math.random()>.5?1:-1)*5.5, vy: (Math.random()-.5)*5, speed: 5.5 },
      keys: {}, over: false, flash: 0, flashMsg: '',
      scale: 1, ox: 0, oy: 0, cpuMode,
    };

    // Update score display
    const nameEl = $g('pong-p1-name'); if (nameEl) nameEl.textContent = allPlayers[0] || '';
    const name2El = $g('pong-p2-name'); if (name2El) name2El.textContent = allPlayers[1] || '';
    $g('pong-score').textContent = '0 — 0';

    function resize() {
      const r=canvas.getBoundingClientRect();
      canvas.width  = r.width  || wrap.clientWidth  || window.innerWidth;
      canvas.height = r.height || wrap.clientHeight || (window.innerHeight - 60);
      const s = Math.min((canvas.width-20)/PW, (canvas.height-20)/PH);
      pongState.scale = s; pongState.ox = (canvas.width-PW*s)/2; pongState.oy = (canvas.height-PH*s)/2;
    }
    requestAnimationFrame(()=>resize()); window.addEventListener('resize', resize);

    const KEYS = {
      left:  { up: ['w','W'],         down: ['s','S'] },
      right: { up: ['ArrowUp'],        down: ['ArrowDown'] },
      top:   { up: ['ArrowLeft'],      down: ['ArrowRight'] },  // left=up means toward top-left
      bottom:{ up: ['j','J'],          down: ['l','L'] },
    };

    const onKD = e => { pongState.keys[e.key] = true; if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault(); };
    const onKU = e => { delete pongState.keys[e.key]; };
    window.addEventListener('keydown', onKD); window.addEventListener('keyup', onKU);

    // Broadcast my paddle position
    const bcInt = setInterval(() => {
      if (!pongState || pongState.over) { clearInterval(bcInt); return; }
      const me = pongState.paddles.find(p => p.isMe);
      if (me) socket.emit('gameState', { roomName: currentRoom, game: 'pong',
        payload: { username: me.name, pos: me.pos } });
    }, 50);

    let lastT = 0;
    function pongLoop(now) {
      if (!pongState || pongState.over) return;
      const cw2 = canvas.getBoundingClientRect().width;
      if (cw2 > 0 && Math.abs(canvas.width - cw2) > 2) resize();
      const dt = Math.min((now - lastT) / 16.667, 3); lastT = now;
      pongTick(dt);
      pongDraw(ctx, canvas);
      pongRAF = requestAnimationFrame(pongLoop);
    }
    pongRAF = requestAnimationFrame(t => { lastT = t; pongRAF = requestAnimationFrame(pongLoop); });

    $g('pong-quit')?.addEventListener('click', () => {
      cancelAnimationFrame(pongRAF); pongRAF = null; clearInterval(bcInt);
      window.removeEventListener('keydown', onKD); window.removeEventListener('keyup', onKU);
      activeGame = null; goHide();
    });
  }

  function pongTick(dt) {
    const st = pongState; if (!st) return;
    const k = st.keys;
    const PW = 900, PH = 600, BALL_R = 9, PAD_THICK = 14, PAD_LEN = 100, WIN = 7;
    const SPEED = 6;

    // Move paddles
    st.paddles.forEach(pad => {
      if (pad.isCpu) {
        // CPU: track ball position on its wall
        const target = pad.side === 'left' || pad.side === 'right'
          ? st.ball.y / PH
          : st.ball.x / PW;
        pad.vel += (target - pad.pos) * 0.08 * dt;
        pad.vel *= 0.75;
      } else if (pad.isMe) {
        const cfg = { left:{u:['w','W'],d:['s','S']}, right:{u:['ArrowUp'],d:['ArrowDown']}, top:{u:['q','Q'],d:['e','E']}, bottom:{u:['z','Z'],d:['x','X']} }[pad.side];
        const up   = cfg && cfg.u.some(k2 => k[k2]);
        const down = cfg && cfg.d.some(k2 => k[k2]);
        const tgt  = up ? -SPEED : down ? SPEED : 0;
        pad.vel += (tgt - pad.vel) * (1 - Math.pow(0.7, dt));
      }
      pad.pos = Math.max(PAD_LEN/2/PH, Math.min(1 - PAD_LEN/2/PH, pad.pos + pad.vel/PH * dt));
    });

    // Ball movement
    const b = st.ball;
    b.x += b.vx * dt; b.y += b.vy * dt;

    // Helper: check paddle on a side
    const padAt = side => st.paddles.find(p => p.side === side);

    // Check each wall
    const wallBounce = (side) => {
      const pad = padAt(side);
      const isHorizontal = side === 'top' || side === 'bottom';
      const perpVal = side === 'left' ? b.x : side === 'right' ? b.x : side === 'top' ? b.y : b.y;
      const perpLimit = side === 'left' ? BALL_R + PAD_THICK : side === 'right' ? PW - BALL_R - PAD_THICK : side === 'top' ? BALL_R + PAD_THICK : PH - BALL_R - PAD_THICK;
      const approaching = (side==='left'&&b.vx<0)||(side==='right'&&b.vx>0)||(side==='top'&&b.vy<0)||(side==='bottom'&&b.vy>0);
      const pastWall = (side==='left'&&b.x<=perpLimit)||(side==='right'&&b.x>=perpLimit)||(side==='top'&&b.y<=perpLimit)||(side==='bottom'&&b.y>=perpLimit);
      if (!pastWall) return;

      if (!pad) {
        // No paddle on this side — just bounce
        if (side==='left'||side==='right') { b.vx=-b.vx; b.x=side==='left'?perpLimit+1:perpLimit-1; }
        else { b.vy=-b.vy; b.y=side==='top'?perpLimit+1:perpLimit-1; }
        return;
      }

      // Has paddle — check hit
      const ballAlongWall = isHorizontal ? b.x/PW : b.y/PH;
      const hit = Math.abs(ballAlongWall - pad.pos) < (PAD_LEN/2)/(isHorizontal?PW:PH) + BALL_R/(isHorizontal?PW:PH);
      if (hit && approaching) {
        const relHit = (ballAlongWall - pad.pos) / ((PAD_LEN/2)/(isHorizontal?PW:PH));
        if (side==='left'||side==='right') {
          b.vx = side==='left' ? Math.abs(b.vx) : -Math.abs(b.vx);
          b.vy = relHit * 7 + pad.vel * 0.4;
          b.x  = side==='left' ? perpLimit+1 : perpLimit-1;
        } else {
          b.vy = side==='top' ? Math.abs(b.vy) : -Math.abs(b.vy);
          b.vx = relHit * 7 + pad.vel * 0.4;
          b.y  = side==='top' ? perpLimit+1 : perpLimit-1;
        }
        b.speed = Math.min(b.speed + 0.3, 18);
        const tot = Math.hypot(b.vx, b.vy);
        b.vx = b.vx/tot * b.speed; b.vy = b.vy/tot * b.speed;
      } else if (!hit) {
        // Scored! The side opposite to this pad scores
        const scorer = st.paddles.find(p => {
          if (side==='left') return p.side==='right';
          if (side==='right') return p.side==='left';
          if (side==='top') return p.side==='bottom';
          return p.side==='top';
        }) || st.paddles[(st.paddles.indexOf(pad)+1) % st.paddles.length];
        if (scorer) scorer.score++;
        const scoreStr = st.paddles.map(p => p.score).join(' – ');
        $g('pong-score').textContent = scoreStr;
        addSystemMessage('🏓 Point to ' + (scorer?.name||'?') + '! Score: ' + scoreStr);
        st.flash = 60; st.flashMsg = (scorer?.name||'?') + ' SCORES!';
        // Reset ball
        const dir = (side==='left'||side==='top') ? 1 : -1;
        st.ball = { x:PW/2, y:PH/2, vx: dir*5.5, vy:(Math.random()-.5)*4, speed:5.5 };
        // Win check
        if (scorer && scorer.score >= WIN) {
          addSystemMessage('🏓 ' + scorer.name + ' wins Pong!');
          st.over = true; st.flash = 180; st.flashMsg = scorer.name + ' WINS!';
          activeGame = null;
          setTimeout(() => { cancelAnimationFrame(pongRAF); goHide(); }, 4000);
        }
      }
    };

    ['left','right','top','bottom'].forEach(wallBounce);
  }

  function pongDraw(ctx, canvas) {
    const st = pongState; if (!st) return;
    const PW=900,PH=600,PAD_THICK=14,PAD_LEN=100,BALL_R=9;
    const cw=canvas.width,ch=canvas.height,s=st.scale,ox=st.ox,oy=st.oy;
    const lx=x=>ox+x*s, ly=y=>oy+y*s, ls=v=>v*s;

    ctx.fillStyle='#000'; ctx.fillRect(0,0,cw,ch);
    // Arena border
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=ls(2);
    ctx.strokeRect(lx(0),ly(0),ls(PW),ls(PH));

    // Paddles
    st.paddles.forEach(pad => {
      const { side, pos, color } = pad;
      ctx.shadowColor=color; ctx.shadowBlur=ls(10);
      ctx.fillStyle=color;
      if (side==='left') {
        const py = pos*PH - PAD_LEN/2;
        ctx.fillRect(lx(0), ly(py), ls(PAD_THICK), ls(PAD_LEN));
      } else if (side==='right') {
        const py = pos*PH - PAD_LEN/2;
        ctx.fillRect(lx(PW-PAD_THICK), ly(py), ls(PAD_THICK), ls(PAD_LEN));
      } else if (side==='top') {
        const px = pos*PW - PAD_LEN/2;
        ctx.fillRect(lx(px), ly(0), ls(PAD_LEN), ls(PAD_THICK));
      } else {
        const px = pos*PW - PAD_LEN/2;
        ctx.fillRect(lx(px), ly(PH-PAD_THICK), ls(PAD_LEN), ls(PAD_THICK));
      }
      ctx.shadowBlur=0;
      // Name label
      ctx.fillStyle=color; ctx.font=`${ls(7)}px 'Press Start 2P',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const lbx = side==='left'?lx(PAD_THICK+20): side==='right'?lx(PW-PAD_THICK-20): side==='top'?lx(pos*PW): lx(pos*PW);
      const lby = side==='left'?ly(pos*PH): side==='right'?ly(pos*PH): side==='top'?ly(PAD_THICK+16): ly(PH-PAD_THICK-16);
      ctx.fillText(pad.name.substring(0,8), lbx, lby);
      // Score
      const sbx = side==='left'?lx(PAD_THICK+32): side==='right'?lx(PW-PAD_THICK-32): lbx;
      const sby = side==='left'?ly(pos*PH)+ls(14): side==='right'?ly(pos*PH)+ls(14): lby+ls(14);
      ctx.font=`${ls(10)}px 'Press Start 2P',monospace`;
      ctx.fillText(pad.score, sbx, sby);
    });

    // Ball with trail
    const b=st.ball;
    for(let t=4;t>=0;t--){ ctx.fillStyle=`rgba(255,255,180,${((5-t)/5)*0.22})`; ctx.fillRect(lx(b.x-b.vx*t*0.4-BALL_R),ly(b.y-b.vy*t*0.4-BALL_R),ls(BALL_R*2),ls(BALL_R*2)); }
    ctx.shadowColor='#ffffaa'; ctx.shadowBlur=ls(8); ctx.fillStyle='#fff';
    ctx.fillRect(lx(b.x-BALL_R),ly(b.y-BALL_R),ls(BALL_R*2),ls(BALL_R*2));
    ctx.shadowBlur=0;

    // Flash
    if(st.flash>0){
      st.flash--;
      ctx.globalAlpha=Math.min(1,st.flash/30);
      ctx.fillStyle='#ffd700'; ctx.font=`${ls(26)}px 'Press Start 2P',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(st.flashMsg,lx(PW/2),ly(PH/2));
      ctx.globalAlpha=1;
    }
    drawScanlines(ctx,cw,ch);
  }

  // ═══════════════════════════════════════════════════════════
  //  🐍  SNAKE RACE  (2-player grid snake)
  // ═══════════════════════════════════════════════════════════
  let snakeRAF=null,snakeState=null;

  function launchSnake(){
    goShow('gscreen-snake');activeGame.state='playing';
    const p1n=activeGame.players[0]||'P1',p2n=activeGame.players[1]||'CPU';
    $g('snake-p1-name').textContent=p1n;$g('snake-p2-name').textContent=p2n;
    const canvas=$g('snake-canvas');if(!canvas)return;
    const ctx=canvas.getContext('2d'),wrap=canvas.parentElement;
    const COLS=40,ROWS=28,TICK_MS=110;
    let cs=16;
    function resizeSN(){const r=canvas.getBoundingClientRect();canvas.width=r.width||wrap.clientWidth||window.innerWidth;canvas.height=r.height||wrap.clientHeight||(window.innerHeight-60);cs=Math.max(8,Math.min(Math.floor(canvas.width/COLS),Math.floor(canvas.height/ROWS)));}
    resizeSN();window.addEventListener('resize',resizeSN);
    const mkSnake=(x,y,d,c,name,isMe,isCpu)=>({body:[{x,y},{x:x-d.x,y:y-d.y},{x:x-d.x*2,y:y-d.y*2}],dir:d,nextDir:d,color:c,alive:true,score:0,playerName:name,isMe,isCpu:!!isCpu});
    const occ=snakes=>new Set(snakes.flatMap(s=>s.body.map(b=>b.x+','+b.y)));
    function spawnApple(snakes){let p;do{p={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}while(occ(snakes).has(p.x+','+p.y));return p;}
    const cpuMode2=activeGame.players.length<2;const p2name2=cpuMode2?'CPU':p2n;
    const s1=mkSnake(5,14,{x:1,y:0},'#7bed9f',p1n,p1n===myUsername,false);
    const s2=mkSnake(34,13,{x:-1,y:0},'#ffd700',p2name2,p2n===myUsername,cpuMode2);
    const cpuMode=cpuMode2;
    snakeState={snakes:[s1,s2],apples:[],keys:{},over:false,s1IsMe:p1n===myUsername,s2IsMe:p2n===myUsername,cpuMode};
    for(let i=0;i<5;i++)snakeState.apples.push(spawnApple(snakeState.snakes));
    const onKD=e=>{snakeState.keys[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();};
    const onKU=e=>{delete snakeState.keys[e.key];};
    window.addEventListener('keydown',onKD);window.addEventListener('keyup',onKU);
    const tickInt=setInterval(()=>{
      if(!snakeState||snakeState.over){clearInterval(tickInt);return;}
      const st=snakeState,k=st.keys,[sn1,sn2]=st.snakes;
      const chDir=(sn,d)=>{if(d.x!==0&&sn.dir.x===0||d.y!==0&&sn.dir.y===0)sn.nextDir=d;};
      if(st.s1IsMe){
        if(k['w']||k['W'])chDir(sn1,{x:0,y:-1});else if(k['s']||k['S'])chDir(sn1,{x:0,y:1});
        else if(k['a']||k['A'])chDir(sn1,{x:-1,y:0});else if(k['d']||k['D'])chDir(sn1,{x:1,y:0});
        socket.emit('gameState',{roomName:currentRoom,game:'snake',payload:{username:myUsername,dir:sn1.nextDir}});
      }
      if(!cpuMode&&st.s2IsMe){
        if(k['ArrowUp'])chDir(sn2,{x:0,y:-1});else if(k['ArrowDown'])chDir(sn2,{x:0,y:1});
        else if(k['ArrowLeft'])chDir(sn2,{x:-1,y:0});else if(k['ArrowRight'])chDir(sn2,{x:1,y:0});
        socket.emit('gameState',{roomName:currentRoom,game:'snake',payload:{username:myUsername,dir:sn2.nextDir}});
      }else if(cpuMode){
        const h=sn2.body[0],near=st.apples.length?st.apples.reduce((b,a)=>Math.abs(a.x-h.x)+Math.abs(a.y-h.y)<b.d?{a,d:Math.abs(a.x-h.x)+Math.abs(a.y-h.y)}:b,{a:st.apples[0],d:Infinity}).a:null;
        if(near){const dx=Math.sign(near.x-h.x),dy=Math.sign(near.y-h.y);if(dx&&sn2.dir.x!=-dx)chDir(sn2,{x:dx,y:0});else if(dy&&sn2.dir.y!=-dy)chDir(sn2,{x:0,y:dy});}
      }
      [sn1,sn2].forEach(sn=>{
        if(!sn.alive)return;
        sn.dir=sn.nextDir;
        const h=sn.body[0];const nh={x:(h.x+sn.dir.x+COLS)%COLS,y:(h.y+sn.dir.y+ROWS)%ROWS};
        sn.body.unshift(nh);
        const ai=st.apples.findIndex(a=>a.x===nh.x&&a.y===nh.y);
        if(ai>=0){sn.score++;st.apples.splice(ai,1);st.apples.push(spawnApple(st.snakes));}
        else sn.body.pop();
        if(sn.body.slice(1).some(b=>b.x===nh.x&&b.y===nh.y))sn.alive=false;
      });
      const h1=sn1.body[0],h2=sn2.body[0];
      if(sn1.alive&&sn2.alive&&h1.x===h2.x&&h1.y===h2.y){sn1.alive=false;sn2.alive=false;}
      if(sn1.alive&&sn2.body.slice(1).some(b=>b.x===h1.x&&b.y===h1.y))sn1.alive=false;
      if(sn2.alive&&sn1.body.slice(1).some(b=>b.x===h2.x&&b.y===h2.y))sn2.alive=false;
      $g('snake-p1-len').textContent=sn1.score;$g('snake-p2-len').textContent=sn2.score;
      if(!sn1.alive||!sn2.alive){
        st.over=true;
        const w=sn1.score>sn2.score?p1n:sn2.score>sn1.score?p2n:'TIE';
        addSystemMessage('🐍 Snake Race: '+(w==='TIE'?"It's a tie!":(w+' wins with '+Math.max(sn1.score,sn2.score)+' apples!')));
        activeGame=null;setTimeout(()=>{cancelAnimationFrame(snakeRAF);goHide();},4000);
      }
    },TICK_MS);
    function snakeLoop(){
      if(!snakeState)return;
      const st=snakeState,cw=canvas.width,ch=canvas.height;
      const offX=Math.floor((cw-COLS*cs)/2),offY=Math.floor((ch-ROWS*cs)/2);
      ctx.fillStyle='#020a02';ctx.fillRect(0,0,cw,ch);
      ctx.fillStyle='rgba(255,255,255,0.03)';
      for(let x=0;x<COLS;x++)for(let y=0;y<ROWS;y++)ctx.fillRect(offX+x*cs+cs/2-1,offY+y*cs+cs/2-1,2,2);
      ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=2;ctx.strokeRect(offX-1,offY-1,COLS*cs+2,ROWS*cs+2);
      st.apples.forEach(a=>{ctx.fillStyle='#e94560';ctx.shadowColor='#e94560';ctx.shadowBlur=cs*0.7;ctx.fillRect(offX+a.x*cs+2,offY+a.y*cs+2,cs-4,cs-4);ctx.shadowBlur=0;});
      st.snakes.forEach(sn=>{sn.body.forEach((seg,i)=>{ctx.globalAlpha=sn.alive?(1-i/sn.body.length*0.5):0.25;if(i===0){ctx.shadowColor=sn.color;ctx.shadowBlur=cs*0.7;}ctx.fillStyle=sn.color;ctx.fillRect(offX+seg.x*cs+1,offY+seg.y*cs+1,cs-2,cs-2);ctx.shadowBlur=0;});ctx.globalAlpha=1;});
      if(st.over){ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(offX,offY,COLS*cs,ROWS*cs);const [sn1,sn2]=st.snakes;const w=sn1.score>sn2.score?p1n:sn2.score>sn1.score?p2n:'TIE!';ctx.fillStyle='#ffd700';ctx.font=Math.max(10,cs*1.3)+"px 'Press Start 2P',monospace";ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(w==='TIE!'?'TIE!':(w+' WINS!'),offX+COLS*cs/2,offY+ROWS*cs/2);}
      drawScanlines(ctx,cw,ch);
      snakeRAF=requestAnimationFrame(snakeLoop);
    }
    snakeRAF=requestAnimationFrame(snakeLoop);
    $g('snake-quit')?.addEventListener('click',()=>{cancelAnimationFrame(snakeRAF);snakeRAF=null;clearInterval(tickInt);window.removeEventListener('keydown',onKD);window.removeEventListener('keyup',onKU);activeGame=null;goHide();});
  }

  // ═══════════════════════════════════════════════════════════
  //  ⌨️  TYPING SPRINT  (type the most words in 60 sec)
  // ═══════════════════════════════════════════════════════════
  let typingState=null;
  const TYPING_WORDS=['the','quick','brown','fox','jumps','over','lazy','dog','pixel','art','chat','room','game','code','type','fast','wave','fire','moon','star','blue','green','light','dark','space','blast','crash','ninja','ghost','neon','cyber','glitch','quest','power','ultra','hyper','retro','arcade','score','combo','turbo','spark','flame','storm','flash','blade','sword','shield','magic','potion','dungeon','castle','dragon','wizard','knight','arrow','forest','river','cloud','thunder','lightning','rainbow','crystal','diamond','keyboard','monitor','window','folder','server','client','socket','buffer','stream','cache','async','await','promise','fetch','render','export','import','module','class','function','variable','constant','boolean','integer','string','object','array','index','shift','splice','reduce','filter','while','loop','break','return'];

  function launchTyping(){
    goShow('gscreen-typing');activeGame.state='playing';
    const words=[];
    while(words.length<200)words.push(TYPING_WORDS[Math.floor(Math.random()*TYPING_WORDS.length)]);
    typingState={words,cursor:0,charIdx:0,scores:{},timeLeft:60,started:false,over:false};
    activeGame.players.forEach(p=>{typingState.scores[p]={wpm:0,words:0,errors:0};});
    const bar=$g('ty-scores-bar');
    if(bar){bar.innerHTML='';const cols=['#4cc9f0','#e94560','#7bed9f','#ffd700','#a29bfe'];activeGame.players.forEach((p,i)=>{const el=document.createElement('span');el.className='ty-player-stat';el.id='ty-stat-'+i;el.style.borderColor=cols[i%cols.length];el.style.color=cols[i%cols.length];el.textContent=p+': 0 WPM';bar.appendChild(el);});}
    renderTypingDisplay();
    const inp=$g('ty-input');
    if(inp){
      inp.value='';inp.disabled=false;inp.focus();
      inp.oninput=e=>{
        if(typingState.over)return;
        if(!typingState.started){typingState.started=true;startTypingTimer();}
        const val=e.target.value;
        if(val.endsWith(' ')){
          const typed=val.trim(),cur=typingState.words[typingState.cursor];
          if(typed===cur)typingState.scores[myUsername]&&typingState.scores[myUsername].words++;
          else typingState.scores[myUsername]&&typingState.scores[myUsername].errors++;
          typingState.cursor++;typingState.charIdx=0;inp.value='';
        }else{typingState.charIdx=val.length;}
        renderTypingDisplay();updateTypingScores();
      };
    }
    $g('ty-quit')?.addEventListener('click',()=>{if(typingState)typingState.over=true;activeGame=null;goHide();});
  }

  function renderTypingDisplay(){
    const st=typingState;if(!st)return;
    const el=$g('ty-text-display');if(!el)return;
    const start=Math.max(0,st.cursor-3),end=Math.min(st.words.length,st.cursor+30);
    el.innerHTML='';
    for(let w=start;w<end;w++){
      const wd=st.words[w],wEl=document.createElement('span');wEl.style.marginRight='6px';
      for(let c=0;c<wd.length;c++){const sp=document.createElement('span');sp.textContent=wd[c];sp.className='ty-char'+(w<st.cursor?' correct':w===st.cursor&&c===st.charIdx?' cursor':'');wEl.appendChild(sp);}
      const spc=document.createElement('span');spc.textContent=' ';spc.className='ty-char'+(w<st.cursor?' correct':'');wEl.appendChild(spc);
      el.appendChild(wEl);
    }
  }

  function startTypingTimer(){
    const iv=setInterval(()=>{
      if(!typingState||typingState.over){clearInterval(iv);return;}
      typingState.timeLeft--;
      const el=$g('ty-timer');if(el){el.textContent=typingState.timeLeft;el.style.color=typingState.timeLeft<=10?'#e94560':'#ffb700';}
      updateTypingScores();
      if(typingState.timeLeft<=0){
        clearInterval(iv);typingState.over=true;
        const inp=$g('ty-input');if(inp)inp.disabled=true;
        const ranked=Object.entries(typingState.scores).sort((a,b)=>b[1].words-a[1].words);
        const win=ranked[0];
        addSystemMessage('⌨️ Typing Sprint: '+win[0]+' wins with '+win[1].wpm+' WPM!');
        const fb=$g('ty-feedback');if(fb){fb.textContent='🏁 '+win[0].toUpperCase()+' WINS — '+win[1].wpm+' WPM!';fb.style.color='#ffd700';}
        activeGame=null;setTimeout(goHide,5000);
      }
    },1000);
  }

  function updateTypingScores(){
    if(!typingState)return;
    const elapsed=60-typingState.timeLeft;
    const my=typingState.scores[myUsername];
    if(my&&elapsed>0)my.wpm=Math.round(my.words/elapsed*60);
    activeGame?.players?.forEach((p,i)=>{const el=$g('ty-stat-'+i);if(!el)return;const sc=typingState.scores[p];if(sc)el.textContent=p+': '+sc.wpm+' WPM ('+sc.words+'w)';});
  }

  // ── Pixel-art scanline overlay (drawn over finished canvas frame) ──
  function drawScanlines(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, y, w, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    // Subtle vignette
    const vg = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.85);
    vg.addColorStop(0,'transparent');
    vg.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }

  // ── Levenshtein helper ──────────────────────────────────────
  function levenshtein(a,b){
    if(!a.length)return b.length;if(!b.length)return a.length;
    const m=a.length,n=b.length;
    const dp=[];
    for(let i=0;i<=m;i++){dp[i]=[i];for(let j=1;j<=n;j++)dp[i][j]=i?0:j;}
    for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
      dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return dp[m][n];
  }

    // ===== SOCKET EVENTS =====
  socket.on('connect',       () => { mySocketId = socket.id; });
  socket.on('connect_error', () => addSystemMessage('⚠️ Connection error. Check server.'));

  socket.on('joinedRoom', ({ roomName, users, socketId, isHost:hostStatus, role }) => {
    mySocketId = socketId; isHost = hostStatus; myRole = role || (isHost?'owner':'member');
    if (roomDisplay) roomDisplay.textContent = roomName;
    if (minigameBtn) minigameBtn.style.display = 'inline-flex';
    usersMap.clear();
    (users||[]).forEach(u => usersMap.set(u.id, u));
    updateUserList(users||[]);
    showScreen(chatScreen);
    showPanel('main-chat-panel');
    addSystemMessage('🎮 Joined ' + roomName + (myRole==='owner'?' (OWNER)':myRole==='mod'?' (MOD)':''));
    if (myRole==='owner') addSystemMessage('💡 /help for commands · 🎮 button for minigames · @bot for AI');
    else addSystemMessage('💡 /help for commands · @bot for AI');
    messageInput?.focus();
    playSystemSound('join');
    showServerURL();
  });

  socket.on('chatMessage', data => {
    if (data.avatar && usersMap.has(data.senderId)) usersMap.get(data.senderId).avatar = data.avatar;
    // Route incoming game messages from other players
    if (data.username !== myUsername) handleIncomingGameMsg(data.username, data.message);
    // Hide internal game protocol messages from chat UI
    // Skip server echo of our own messages — we already rendered them locally
    if (data.senderId === mySocketId || data.username === myUsername) return;
    addMessage(data, false);
    scrollToBottom();
    playSystemSound('receive');
  });

  socket.on('systemMessage', ({text}) => { addSystemMessage(text); scrollToBottom(); });
  socket.on('updateUsers', list => { usersMap.clear(); list.forEach(u=>usersMap.set(u.id,u)); updateUserList(list); });
  socket.on('userTyping', ({username, isTyping:t}) => {
    if (!typingIndicator) return;
    if (t && username!==myUsername) { typingIndicator.textContent=username+' is typing...'; typingIndicator.classList.remove('hidden'); }
    else typingIndicator.classList.add('hidden');
  });
  socket.on('error',       msg  => { addSystemMessage(msg); playSystemSound('error'); });
  socket.on('userKicked',  ()   => { addSystemMessage('👢 You were kicked.'); setTimeout(()=>{showScreen(startScreen);currentRoom=null;},1500); });
  socket.on('userBanned',  ()   => { addSystemMessage('🚫 You were banned.');  setTimeout(()=>{showScreen(startScreen);currentRoom=null;},1500); });
  socket.on('roomDeleted', ()   => { addSystemMessage('🗑️ Room deleted.');     setTimeout(()=>{showScreen(startScreen);currentRoom=null;},1500); });
  socket.on('bannedUsersList', ({bannedUsers}) => addSystemMessage('🚫 Banned: ' + (bannedUsers.join(', ')||'None')));
  socket.on('moderatorSet',    ({username})    => addSystemMessage('⭐ ' + username + ' is now a mod!'));

  socket.on('threadCreated', ({threadId,threadName,createdBy}) => {
    threads.set(threadId, {id:threadId,name:threadName,messages:[]});
    addSystemMessage('🧵 ' + createdBy + ' created thread: ' + threadName);
    updateThreadsList();
    if (threadsTab) threadsTab.classList.remove('hidden');
  });
  socket.on('threadMessage',  data => { if(currentThread?.id===data.threadId) addThreadMessage(data); });
  socket.on('threadMessages', ({threadId,messages}) => {
    if (currentThread?.id===threadId && threadMessagesEl) { threadMessagesEl.innerHTML=''; messages.forEach(m=>addThreadMessage(m)); }
  });
  socket.on('playSound',      ({soundId,username}) => { playSound(soundId); addSystemMessage('🔊 '+username+' played '+soundId); });
  socket.on('avatarUpdated',  ({userId,avatar})    => { if(usersMap.has(userId)){usersMap.get(userId).avatar=avatar;updateUserList(Array.from(usersMap.values()));} });

  socket.on('privateMessage', msg => {
    const otherId = msg.from===mySocketId ? msg.to : msg.from;
    if (!dmConversations.has(otherId)) dmConversations.set(otherId, []);
    const existing = dmConversations.get(otherId);
    if (!existing.some(m=>m.id===msg.id)) existing.push(msg);
    updateDmList();
    if (activeDmUserId===otherId) addDmMessageEl(msg);
  });

  socket.on('dmHistory', ({userId,messages}) => {
    if (!dmConversations.has(userId)) dmConversations.set(userId, []);
    const existing = dmConversations.get(userId);
    messages.forEach(m => { if(!existing.some(x=>x.id===m.id)) existing.push(m); });
    updateDmList();
    if (activeDmUserId===userId) renderDmMessages(userId);
  });

  // ===== HELPERS =====
  function parseMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,         '<em>$1</em>');
  }

  function addMessage(data, isSelf) {
    if (!messagesEl) return;
    if (!isSelf && data.username && mutedUsers.has(data.username.toUpperCase())) return;
    const msgEl = document.createElement('div');
    msgEl.className = 'message' + (data.isBot ? ' bot' : '');
    if (isSelf || data.senderId===mySocketId) msgEl.classList.add('self');
    msgEl.dataset.id = data.id||''; msgEl.dataset.username = data.username||''; msgEl.dataset.text = data.message||'';

    const user   = usersMap.get(data.senderId);
    const avatar = data.avatar || user?.avatar;
    const avatarHtml = avatar
      ? '<div class="avatar"><img src="'+avatar+'" alt="avatar"/></div>'
      : '<div class="avatar"><div class="avatar-placeholder">👤</div></div>';

    let content = '';
    if (data.replyTo) content += '<div class="quoted-message"><span class="username">@'+escapeHtml(data.replyTo.username)+'</span><span class="text">'+escapeHtml(data.replyTo.text)+'</span></div>';
    if (data.image) {
      const gif = data.image.includes('image/gif');
      content += '<div class="image-container'+(gif?' gif':'')+'" onclick="openLightbox(this)"><img src="'+data.image+'" alt="image"/><div class="image-overlay">'+(gif?'🎬 GIF':'[ZOOM]')+'</div></div>';
    }
    if (data.message) content += '<span class="text">'+parseMarkdown(escapeHtml(data.message))+'</span>';

    msgEl.innerHTML = avatarHtml + '<div class="content"><span class="meta"><span class="username" onclick="openProfileFromMsg(\''+escapeHtml(data.username)+'\',\''+data.senderId+'\')">'+escapeHtml(data.username)+'</span><span class="time">['+data.timestamp+']</span></span>'+content+'<span class="add-reaction-btn" title="React">😊</span><span class="create-thread-btn" title="Thread">🧵</span></div>';

    msgEl.querySelector('.create-thread-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      const name = prompt('Thread name:', 'Thread: "'+(data.message||'').substring(0,30)+'"');
      if (name && currentRoom) socket.emit('createThread',{roomName:currentRoom,parentMessageId:data.id,threadName:name,username:myUsername});
    });
    msgEl.querySelector('.add-reaction-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      socket.emit('addReaction',{roomName:currentRoom,messageId:data.id,emoji:'👍',username:myUsername});
    });

    messagesEl.appendChild(msgEl);
  }

  window.openProfileFromMsg = function(username, userId) {
    openProfileModal(usersMap.get(userId) || {username, id:userId});
  };

  function addSystemMessage(text) {
    if (!messagesEl) return;
    const el = document.createElement('div');
    el.className = 'message system';
    el.innerHTML = '<span class="text">'+escapeHtml(text)+'</span>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function updateUserList(list) {
    if (!userListEl) return;
    userListEl.innerHTML = '';
    const seen = new Set();
    list.forEach(user => {
      if (seen.has(user.username)) return; seen.add(user.username);
      const li = document.createElement('li');
      li.dataset.userId = user.id;
      const av = user.avatar ? '<div class="user-avatar"><img src="'+user.avatar+'" alt="av"/></div>' : '<div class="user-avatar"><div class="user-avatar-placeholder">👤</div></div>';
      li.innerHTML = av+'<span class="username-text">'+escapeHtml(user.username)+'</span>'+(user.role==='owner'?'<span class="user-role owner">👑</span>':'')+(user.role==='mod'?'<span class="user-role mod">🛡️</span>':'')+(user.isBanned?'<span class="user-role banned">🚫</span>':'');
      li.addEventListener('click',    () => { if(user.id!==mySocketId) openProfileModal(user); else uploadAvatar(); });
      li.addEventListener('dblclick', e => { e.stopPropagation(); if(user.id!==mySocketId) openDM(user.id, user.username); });
      userListEl.appendChild(li);
    });
    if (userCountEl) userCountEl.textContent = list.length;
  }

  function updateThreadsList() {
    if (!threadsList) return; threadsList.innerHTML='';
    threads.forEach((thread, id) => {
      const item = document.createElement('div'); item.className='thread-item';
      item.textContent = '🧵 '+thread.name;
      item.addEventListener('click', () => { currentThread={id,name:thread.name}; if(threadNameEl) threadNameEl.textContent=thread.name; if(threadView) threadView.classList.remove('hidden'); if(threadsList) threadsList.classList.add('hidden'); socket.emit('joinThread',{threadId:id}); });
      threadsList.appendChild(item);
    });
  }

  function addThreadMessage(data) {
    if (!threadMessagesEl) return;
    const el = document.createElement('div');
    el.className = 'message'+(data.senderId===socket.id?' self':'');
    el.innerHTML = '<div class="content"><span class="meta"><span class="username">'+escapeHtml(data.username)+'</span><span class="time">['+data.timestamp+']</span></span><span class="text">'+escapeHtml(data.message)+'</span></div>';
    threadMessagesEl.appendChild(el);
    threadMessagesEl.scrollTop = threadMessagesEl.scrollHeight;
  }

  function scrollToBottom() { if(messagesEl) messagesEl.scrollTop=messagesEl.scrollHeight; }

  function escapeHtml(str) {
    if (!str) return ''; const d=document.createElement('div'); d.textContent=str; return d.innerHTML;
  }

  window.openLightbox = function(container) {
    const img = container.querySelector('img'); if(!img) return;
    const lb = document.createElement('div'); lb.className='lightbox';
    lb.innerHTML='<img src="'+img.src+'" alt="zoomed"/>';
    lb.onclick = () => lb.remove(); document.body.appendChild(lb);
    const onKey = e => { if(e.key==='Escape'){lb.remove();document.removeEventListener('keydown',onKey);} };
    document.addEventListener('keydown', onKey);
  };

  function showServerURL() {
    if (serverUrlEl && window.location.hostname!=='localhost' && window.location.hostname!=='127.0.0.1')
      serverUrlEl.textContent = '🌐 ' + window.location.origin;
  }

  // ===== INIT =====
  showServerURL();
  usernameInput?.focus();
  ['dragenter','dragover','dragleave','drop'].forEach(ev =>
    document.body.addEventListener(ev, e => {e.preventDefault();e.stopPropagation();}, false)
  );
});