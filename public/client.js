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

  const GAME_NAMES = { football:'⚽ Football', pixelduel:'🔫 Pixel Duel', pong:'🏓 Pong' };

  // ── Football match options state (host only) ─────────────
  const fbOpts = { pitch: 'classic', weather: 'clear', time: 'day' };

  function startGameLobby(type) {
    activeGame = {
      type, state: 'lobby',
      players: [myUsername],
      scores: { [myUsername]: 0 },
      streaks: { [myUsername]: 0 },
    };
    const gameName = GAME_NAMES[type] || type;
    $g('gwait-title').textContent = gameName;
    // Show football options only for host on football
    const optPanel = $g('gwait-fb-options');
    if (optPanel) {
      optPanel.style.display = (type === 'football') ? '' : 'none';
      // Non-hosts see settings read-only
      optPanel.querySelectorAll('.fb-opt-btn').forEach(b => {
        b.style.pointerEvents = myRole === 'owner' ? '' : 'none';
        b.style.opacity = myRole === 'owner' ? '' : '0.6';
      });
    }
    // Reset to defaults
    fbOpts.pitch = 'classic'; fbOpts.weather = 'clear'; fbOpts.time = 'day';
    ['fb-opt-pitch','fb-opt-weather','fb-opt-time'].forEach(id => {
      $g(id)?.querySelectorAll('.fb-opt-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === fbOpts[id.replace('fb-opt-','')]);
      });
    });
    renderWaitList();
    // Send invite popup to everyone else in the room via socket
    socket.emit('gameInvite', { roomName: currentRoom, game: type, gameName, hostUsername: myUsername });
    addSystemMessage('🎮 Invite sent! Waiting for players to join…');
    goShow('gscreen-wait');
  }

  // Option button clicks — host only, broadcast change to all
  ['fb-opt-pitch','fb-opt-weather','fb-opt-time'].forEach(id => {
    $g(id)?.addEventListener('click', e => {
      const btn = e.target.closest('.fb-opt-btn'); if (!btn) return;
      if (myRole !== 'owner') return;
      const key = id.replace('fb-opt-','');
      fbOpts[key] = btn.dataset.val;
      $g(id).querySelectorAll('.fb-opt-btn').forEach(b => b.classList.toggle('active', b === btn));
      // Broadcast updated settings so all players see the change live
      socket.emit('gameSettings', { roomName: currentRoom, opts: { ...fbOpts } });
    });
  });

  // Apply incoming settings update (from host)
  function applyFbOpts(opts) {
    if (!opts) return;
    ['pitch','weather','time'].forEach(key => {
      if (opts[key]) {
        fbOpts[key] = opts[key];
        const id = 'fb-opt-' + key;
        $g(id)?.querySelectorAll('.fb-opt-btn').forEach(b => b.classList.toggle('active', b.dataset.val === opts[key]));
      }
    });
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
    if (myRole === 'owner') {
      const opts = t === 'football' ? { ...fbOpts } : null;
      socket.emit('gameLaunch', { roomName: currentRoom, game: t, players: activeGame.players, opts });
      if (opts) activeGame.matchOpts = opts; // store locally too
    }
    _doLaunchGame(t);
  }

  const GAME_ICONS = { football:'⚽', pixelduel:'🔫', pong:'🏓' };
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
    else if (t === 'pixelduel') launchPixelDuel();
    else if (t === 'pong')      launchPong();
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
      // Show wait screen with options panel (read-only for non-host)
      const optPanel = $g('gwait-fb-options');
      if (optPanel) {
        optPanel.style.display = game === 'football' ? '' : 'none';
        optPanel.querySelectorAll('.fb-opt-btn').forEach(b => { b.style.pointerEvents='none'; b.style.opacity='0.6'; });
      }
      if ($g('gwait-title')) $g('gwait-title').textContent = GAME_NAMES[game] || game;
      renderWaitList();
      goShow('gscreen-wait');
    }
  }


  // ═══════════════════════════════════════════════════════════
  //  ⚽  FOOTBALL  (physics canvas, WASD/arrows to move)
  //  Inspired by HaxBall — real-time multiplayer via socket
  // ═══════════════════════════════════════════════════════════
  let fbRAF = null;
  // Cached scanline overlay canvas for performance
  let _scanlineCache = null, _scanlineCacheW = 0, _scanlineCacheH = 0;

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
      isAuthority: myRole === 'owner',
      // Match settings
      opts: activeGame.matchOpts || { pitch: 'classic', weather: 'clear', time: 'day' },
      weatherParticles: [],
      windAngle: Math.random() * Math.PI * 2, // randomise wind direction each match
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
    // Weather HUD
    const wIcons = { clear:'☀️', rain:'🌧️', storm:'⛈️', snow:'❄️', wind:'💨', fog:'🌫️' };
    const tIcons = { day:'', dusk:'🌆', night:'🌙' };
    const opts = fbState.opts;
    const wHud = $g('fb-weather-disp');
    if (wHud) wHud.textContent = (tIcons[opts.time]||'') + ' ' + (wIcons[opts.weather]||'');

    // Letterbox: keep field aspect ratio, add padding
    const wrap = canvas.parentElement;
    function resizeFB() {
      const ww = canvas.offsetWidth  || window.innerWidth;
      const wh = canvas.offsetHeight || (window.innerHeight - 60);
      if (ww < 10 || wh < 10) return; // not laid out yet
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
    // Player position broadcast — 20Hz
    const bcInt = setInterval(() => {
      if (!activeGame || fbState.over) { clearInterval(bcInt); return; }
      const me = fbState.players.find(p => p.isMe);
      if (!me) return;
      const payload = { username: myUsername, x: me.x, y: me.y, vx: me.vx, vy: me.vy };
      // Flush pending kick from non-host (sent to host on next tick)
      if (fbState._pendingKick) {
        payload.kick = fbState._pendingKick;
        fbState._pendingKick = null;
      }
      socket.emit('gameState', { roomName: currentRoom, game: 'football', payload });
    }, 50);

    // Ball broadcast — host only, 30Hz (faster than player pos)
    const ballBcInt = setInterval(() => {
      if (!activeGame || fbState.over) { clearInterval(ballBcInt); return; }
      if (myRole === 'owner' && fbState.ball) {
        const b = fbState.ball;
        socket.emit('gameState', { roomName: currentRoom, game: 'football',
          payload: { ballUpdate: true, x: b.x, y: b.y, vx: b.vx, vy: b.vy } });
      }
    }, 33);

    $g('fb-quit')?.addEventListener('click', () => {
      clearInterval(timerInt); clearInterval(bcInt);
      cleanupFB(onKD, onKU);
    });

    let lastFbTime = 0;
    function fbLoop(now) {
      if (fbState.over || !activeGame) return;
      // Resize canvas every frame if dimensions changed (handles post-loading-screen reveal)
      const cw = canvas.offsetWidth;
      if (cw > 10 && Math.abs(canvas.width - cw) > 2) resizeFB();
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
      // Weather makes it more slippery (lower accel = more drift)
      const wo2 = fbState.opts;
      const slipFactor = wo2.weather==='rain'?0.55 : wo2.weather==='storm'?0.42 : wo2.weather==='snow'?0.38 : wo2.pitch==='mud'?0.30 : wo2.pitch==='snow'?0.60 : 1.0;
      const accel  = (tlen > 0 ? 0.09 : 0.07) * slipFactor;
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
          // Non-hosts store kick so it gets forwarded to host on next broadcast
          if (myRole !== 'owner') {
            fbState._pendingKick = { vx: b.vx, vy: b.vy, bx: b.x, by: b.y };
          }
        }
      }
      me.spaceWas = spaceNow;
    }

    // ── Weather effects on player movement ──
    const wo = fbState.opts;
    let playerFriction = 1; // multiplier on player deceleration (>1 = more slippery)
    if (wo.weather === 'rain')  playerFriction = 0.55;
    if (wo.weather === 'storm') playerFriction = 0.42;
    if (wo.weather === 'snow')  playerFriction = 0.38;
    if (wo.weather === 'mud' || wo.pitch === 'mud') playerFriction = 0.28;

    // Move all players
    fbState.players.forEach(p => {
      if (!p.isMe) {
        if (p._tx !== undefined) {
          // Predict forward using last-known velocity, then blend toward target
          p.x += p._tvx * dt;
          p.y += p._tvy * dt;
          const ex = p._tx - p.x, ey = p._ty - p.y;
          const dist = Math.hypot(ex, ey);
          const alpha = dist > 60 ? 0.4 : dist > 15 ? 0.2 : 0.1;
          p.x += ex * alpha;
          p.y += ey * alpha;
        }
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      p.x = Math.max(FB_PRAD, Math.min(FB_VW - FB_PRAD, p.x));
      p.y = Math.max(FB_PRAD, Math.min(FB_VH - FB_PRAD, p.y));
      if (p.kickCooldown > 0) p.kickCooldown -= dt;
    });

    // ── Ball physics — everyone predicts locally (host is authoritative) ──
    const b = fbState.ball;

    // ── Ball physics: ALL clients run identical deterministic simulation ──
    let ballFriction = FB_FRICTION;
    if (wo.weather === 'rain')  ballFriction = 0.990;
    if (wo.weather === 'storm') ballFriction = 0.993;
    if (wo.weather === 'snow')  ballFriction = 0.988;
    if (wo.pitch === 'astro')   ballFriction = 0.978;
    if (wo.pitch === 'sand')    ballFriction = 0.965;
    if (wo.pitch === 'mud')     ballFriction = 0.955;
    if (wo.pitch === 'snow')    ballFriction = 0.985;
    let windX = 0, windY = 0;
    if (wo.weather === 'wind' || wo.weather === 'storm') {
      const windStr = wo.weather === 'storm' ? 0.10 : 0.06;
      windX = Math.cos(fbState.windAngle) * windStr;
      windY = Math.sin(fbState.windAngle) * windStr;
    }
    const steps = Math.max(1, Math.ceil(dt));
    const dts   = dt / steps;
    for (let s = 0; s < steps; s++) {
      b.vx += windX * dts; b.vy += windY * dts;
      b.x  += b.vx * dts; b.y  += b.vy * dts;
      b.vx *= Math.pow(ballFriction, dts);
      b.vy *= Math.pow(ballFriction, dts);
    }
    b.spin     *= Math.pow(0.88, dt);
    b.spinAngle = (b.spinAngle + b.spin * 0.06 * dt) % (Math.PI * 2);
    if (Math.hypot(b.vx, b.vy) < 0.5) b.spin = 0;

    // ── Wall / goal collisions — all clients run identical simulation ──
    {
    const gTop = (FB_VH - FB_GOAL_H) / 2;
    const gBot = gTop + FB_GOAL_H;
    const bMinX = FB_BRAD, bMaxX = FB_VW - FB_BRAD;
    const bMinY = FB_BRAD, bMaxY = FB_VH - FB_BRAD;

    let _wallHit = false;
    if (b.y < bMinY) { b.y = bMinY; b.vy = Math.abs(b.vy) * FB_WALL_DAMP; b.spin *= -0.45; _wallHit=true; }
    if (b.y > bMaxY) { b.y = bMaxY; b.vy = -Math.abs(b.vy) * FB_WALL_DAMP; b.spin *= -0.45; _wallHit=true; }

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
      } else { b.x = bMaxX; b.vx = -Math.abs(b.vx) * FB_WALL_DAMP; _wallHit=true; }
    }
    if (_wallHit && myRole === 'owner') {
      socket.emit('gameState', { roomName: currentRoom, game: 'football',
        payload: { ballSync: true, x: b.x, y: b.y, vx: b.vx, vy: b.vy } });
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
    let _ballHit = false;
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
          const bSpd = Math.hypot(b.vx, b.vy);
          const minPush = FB_KICK_BASE * 0.7;
          if (bSpd < minPush) { const boost = minPush / Math.max(0.1, bSpd); b.vx *= boost; b.vy *= boost; }
          _ballHit = true;
        }
        const overlap = minD - dist + 0.5;
        b.x += nx * overlap; b.y += ny * overlap;
      }
    });
    // Host broadcasts exact ball state the instant a player touches it
    if (_ballHit && myRole === 'owner') {
      socket.emit('gameState', { roomName: currentRoom, game: 'football',
        payload: { ballSync: true, x: b.x, y: b.y, vx: b.vx, vy: b.vy } });
    }

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

    }

    // ── Weather particle update (in tick, not draw) ──
    const wopt2 = fbState.opts || {};
    const wp2 = fbState.weatherParticles;
    if (wopt2.weather === 'rain' || wopt2.weather === 'storm') {
      const spawnN = wopt2.weather === 'storm' ? 4 : 2;
      const canvas2 = $g('fb-canvas');
      const cw2 = canvas2 ? canvas2.width : 800, ch2 = canvas2 ? canvas2.height : 600;
      for (let i = 0; i < spawnN; i++) {
        if (wp2.length < 120) wp2.push({ x: Math.random()*cw2, y: -8, vx: wopt2.weather==='storm'?-1.5:-0.4, vy: 8+Math.random()*4 });
      }
      for (let i = wp2.length-1; i >= 0; i--) {
        wp2[i].x += wp2[i].vx; wp2[i].y += wp2[i].vy;
        if (wp2[i].y > ch2 + 10) wp2.splice(i, 1);
      }
    } else if (wopt2.weather === 'snow') {
      const canvas2 = $g('fb-canvas');
      const cw2 = canvas2 ? canvas2.width : 800, ch2 = canvas2 ? canvas2.height : 600;
      if (wp2.length < 60) wp2.push({ x: Math.random()*cw2, y: -4, vx: (Math.random()-0.5)*0.6, vy: 1+Math.random(), r: 2+Math.random()*2 });
      for (let i = wp2.length-1; i >= 0; i--) {
        wp2[i].x += wp2[i].vx; wp2[i].y += wp2[i].vy;
        if (wp2[i].y > ch2 + 8) wp2.splice(i, 1);
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

    const wo = fbState.opts || {};

    // ── Time of day: canvas background ──
    const bgColors = { day: '#111', dusk: '#1a0e05', night: '#050510' };
    ctx.fillStyle = bgColors[wo.time] || '#111';
    ctx.fillRect(0, 0, cw, ch);

    // Night: draw stars in margins
    if (wo.time === 'night') {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i*137.5)*0.5+0.5)*cw, sy = (Math.sin(i*89.3)*0.5+0.5)*ch;
        // only draw stars outside the field
        if (sx < ox || sx > ox+cs(FB_VW) || sy < oy || sy > oy+cs(FB_VH)) {
          ctx.fillRect(sx, sy, cs(1.2), cs(1.2));
        }
      }
    }

    // ── Pitch surface: pick colours based on pitch type ──
    const pitchColors = {
      classic: ['#2a7a2a','#277027'],
      astro:   ['#1a8a30','#178028'],
      sand:    ['#c8a96e','#b89858'],
      snow:    ['#d8e8f0','#c8d8e0'],
      mud:     ['#5a3a1a','#4a3010'],
    };
    const [pC1, pC2] = pitchColors[wo.pitch] || pitchColors.classic;

    // ── Grass stripes ──
    const stripes = 10;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? pC1 : pC2;
      ctx.fillRect(cx(i * FB_VW/stripes), cy(0), cs(FB_VW/stripes)+1, cs(FB_VH));
    }

    // Night/dusk: darken pitch with overlay
    if (wo.time === 'night') {
      ctx.fillStyle = 'rgba(0,0,20,0.42)';
      ctx.fillRect(cx(0), cy(0), cs(FB_VW), cs(FB_VH));
    } else if (wo.time === 'dusk') {
      ctx.fillStyle = 'rgba(80,30,0,0.22)';
      ctx.fillRect(cx(0), cy(0), cs(FB_VW), cs(FB_VH));
    }

    // Fog overlay
    if (wo.weather === 'fog') {
      ctx.fillStyle = 'rgba(200,210,220,0.28)';
      ctx.fillRect(cx(0), cy(0), cs(FB_VW), cs(FB_VH));
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

    // ── Weather particles ──
    const wp = fbState.weatherParticles;
    const wopt = fbState.opts || {};

    // Draw rain
    if (wopt.weather === 'rain' || wopt.weather === 'storm') {
      ctx.strokeStyle = 'rgba(140,200,255,0.4)'; ctx.lineWidth = cs(0.8);
      ctx.beginPath();
      for (let i = 0; i < wp.length; i++) {
        const p = wp[i];
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx*2, p.y + p.vy*2);
      }
      ctx.stroke();
    } else if (wopt.weather === 'snow') {
      ctx.fillStyle = 'rgba(220,235,255,0.75)';
      for (let i = 0; i < wp.length; i++) {
        const p = wp[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      }
    }

    // Wind indicator (small, top-right corner)
    if (wopt.weather === 'wind' || wopt.weather === 'storm') {
      const wa = fbState.windAngle;
      ctx.save(); ctx.translate(cw - 44, 32);
      ctx.strokeStyle = 'rgba(180,220,255,0.65)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(wa)*18, Math.sin(wa)*18); ctx.stroke();
      const ax=Math.cos(wa)*18, ay=Math.sin(wa)*18;
      ctx.fillStyle='rgba(180,220,255,0.65)';
      ctx.beginPath(); ctx.moveTo(ax,ay);
      ctx.lineTo(ax+Math.cos(wa+2.4)*6,ay+Math.sin(wa+2.4)*6);
      ctx.lineTo(ax+Math.cos(wa-2.4)*6,ay+Math.sin(wa-2.4)*6);
      ctx.fill();
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
  // ── Socket: host updates match settings ─────────────────────────────────
  socket.on('gameSettings', ({ opts }) => {
    applyFbOpts(opts);
    // Make sure panel is visible for football lobbies
    const optPanel = $g('gwait-fb-options');
    if (optPanel && activeGame?.type === 'football') optPanel.style.display = '';
  });

  socket.on('gameLaunch', ({ game, players, opts }) => {
    if (!players.includes(myUsername)) return;
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
    if (opts) activeGame.matchOpts = opts; // store match settings
    const popup = document.getElementById('game-invite-popup');
    if (popup) popup.remove();
    addSystemMessage('🎮 ' + (GAME_NAMES[game]||game.toUpperCase()) + ' — STARTING!');
    _doLaunchGame(game);
  });

  // Receive opponents' positions
  socket.on('gameState', data => {
    if (data.game === 'football' && fbState) {
      const pl = data.payload;
      if (pl.ballSync && myRole !== 'owner') {
        // Hard snap ball to authoritative state from host — no lerp, instant correction
        fbState.ball.x = pl.x; fbState.ball.y = pl.y;
        fbState.ball.vx = pl.vx; fbState.ball.vy = pl.vy;
      } else if (!pl.ballSync) {
        // Player position update
        const p = fbState.players.find(p => p.name === pl.username && !p.isMe);
        if (p) { p._tx = pl.x; p._ty = pl.y; p._tvx = pl.vx||0; p._tvy = pl.vy||0; }
        // Kick intent from non-host → host applies + immediately broadcasts result
        if (pl.kick && myRole === 'owner') {
          const b = fbState.ball;
          b.vx = pl.kick.vx; b.vy = pl.kick.vy;
          b.x  = pl.kick.bx; b.y  = pl.kick.by;
          socket.emit('gameState', { roomName: currentRoom, game: 'football',
            payload: { ballSync: true, x: b.x, y: b.y, vx: b.vx, vy: b.vy } });
        }
      }
    }
    if (data.game === 'pixelduel' && pdState) {
      const pl = data.payload;
      if (pl.fullState && myRole !== 'owner') {
        // Non-host applies authoritative state from host
        pl.players.forEach(sp => {
          const p = pdState.players.find(p => p.name === sp.name);
          if (!p) return;
          if (!p.isMe) {
            p._tx = sp.x; p._ty = sp.y;
            p._tangle = sp.angle;
          }
          // HP and score always authoritative from host
          p.hp = sp.hp; p.score = sp.score;
          if (sp.flashT > p.flashT) p.flashT = sp.flashT;
        });
        pdState.bullets = pl.bullets || [];
        // Update HUD
        updatePdHP();
        $g('pd-p1-score').textContent = pdState.players[0].score;
        $g('pd-p2-score').textContent = pdState.players[1].score;
        // Sync round state
        if (pl.roundOver && !pdState.roundOver) pdState.roundOver = true;
        if (pl.round && pl.round !== pdState.round) {
          pdState.round = pl.round;
          $g('pd-round-label').textContent = 'Round '+pdState.round+'/'+pdState.maxRounds;
        }
        if (pl.over && !pdState.over) {
          pdState.over = true;
          cancelAnimationFrame(pdRAF); pdRAF = null;
          setTimeout(goHide, 4000);
        }
      } else if (pl.input && myRole === 'owner') {
        // Host receives movement + shoot intent from non-host
        const p = pdState.players.find(p => p.name === pl.username && !p.isMe);
        if (p) {
          p._tx = pl.x; p._ty = pl.y;
          p._tangle = pl.angle;
        }
        if (pl.shoot) pdState._remoteShoot = { username: pl.username };
      }
    }
    if (data.game === 'pong' && pongState) {
      const pad = pongState.paddles.find(p => p.name === data.payload.username && !p.isMe);
      if (pad) {
        // Store as interpolation target, not instant snap
        pad._tpos = data.payload.pos;
        if (data.payload.vel !== undefined) pad._tvel = data.payload.vel;
      }
      // Non-hosts reconcile ball with host snapshot
      if (data.payload.ball && myRole !== 'owner') {
        const b = pongState.ball, ab = data.payload.ball;
        const d = Math.hypot(b.x-ab.x, b.y-ab.y);
        const blend = d > 80 ? 1 : d > 25 ? 0.4 : 0.12;
        b.x += (ab.x-b.x)*blend; b.y += (ab.y-b.y)*blend;
        b.vx += (ab.vx-b.vx)*blend; b.vy += (ab.vy-b.vy)*blend;
        if (ab.speed) b.speed = ab.speed;
      }
    }

  });


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

    // Mouse aiming — convert screen to world coordinates properly
    const onMouseMove=e=>{
      if(!pdState)return;
      const me=pdState.players.find(p=>p.isMe);
      if(!me)return;
      const rect=canvas.getBoundingClientRect();
      // Map mouse to canvas pixel, then canvas pixel to world coords
      const cx2=canvas.width, cy2=canvas.height;
      const s2=Math.min(cx2/PD_VW,cy2/PD_VH);
      const ox2=(cx2-PD_VW*s2)/2, oy2=(cy2-PD_VH*s2)/2;
      const mx=((e.clientX-rect.left)/rect.width)*cx2;
      const my=((e.clientY-rect.top)/rect.height)*cy2;
      const wx=(mx-ox2)/s2, wy=(my-oy2)/s2;
      me.angle=Math.atan2(wy-me.y,wx-me.x);
    };
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mousemove',()=>{ if(pdState)pdState._mouseMoved=true; },{once:true});
    // Left-click to shoot too
    const onMouseClick=e=>{
      if(e.button===0&&pdState&&!pdState.roundOver){
        const me=pdState.players.find(p=>p.isMe);
        if(me)pdState._clickShoot=true;
      }
    };
    canvas.addEventListener('mousedown',onMouseClick);

    const bcInt=setInterval(()=>{
      if(!pdState||pdState.over){clearInterval(bcInt);return;}
      const me=pdState.players.find(p=>p.isMe);
      if(!me)return;
      if(myRole==='owner'){
        // Host broadcasts full authoritative state every 33ms
        socket.emit('gameState',{roomName:currentRoom,game:'pixelduel',payload:{
          fullState:true,
          players:pdState.players.map(p=>({name:p.name,x:p.x,y:p.y,hp:p.hp,angle:p.angle,score:p.score,flashT:p.flashT})),
          bullets:pdState.bullets.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,owner:b.owner,life:b.life})),
          roundOver:pdState.roundOver,round:pdState.round,over:pdState.over
        }});
      } else {
        // Non-host sends only movement + aim + shoot intent
        socket.emit('gameState',{roomName:currentRoom,game:'pixelduel',payload:{
          input:true,username:me.name,x:me.x,y:me.y,angle:me.angle,
          shoot:pdState._wantsShoot||false
        }});
        pdState._wantsShoot=false;
      }
    },33);

    function pdLoop(){
      if(!pdState||pdState.over)return;
      if(canvas.offsetWidth>10&&Math.abs(canvas.width-canvas.offsetWidth)>2)resizePD();
      pdTick();
      pdDraw(ctx,canvas);
      pdRAF=requestAnimationFrame(pdLoop);
    }
    pdRAF=requestAnimationFrame(pdLoop);

    $g('pd-quit')?.addEventListener('click',()=>{
      cancelAnimationFrame(pdRAF);pdRAF=null;clearInterval(bcInt);
      window.removeEventListener('keydown',onKD);window.removeEventListener('keyup',onKU);
      canvas.removeEventListener('mousemove',onMouseMove);
      canvas.removeEventListener('mousedown',onMouseClick);
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
    if(!pdState)return;

    // ── Every client: move local player, send inputs ──
    const k=pdState.keys;
    const me=pdState.players.find(p=>p.isMe);
    if(me&&!pdState.roundOver){
      const left =k['a']||k['A']||k['ArrowLeft'];
      const right=k['d']||k['D']||k['ArrowRight'];
      const up   =k['w']||k['W']||k['ArrowUp'];
      const down =k['s']||k['S']||k['ArrowDown'];
      let ax=0,ay=0;
      if(left)ax-=1; if(right)ax+=1;
      if(up)ay-=1;   if(down)ay+=1;
      if(ax&&ay){ax*=0.707;ay*=0.707;}
      me.vx+=(ax*PD_PSPD-me.vx)*0.18;
      me.vy+=(ay*PD_PSPD-me.vy)*0.18;
      let nx=me.x+me.vx, ny=me.y+me.vy;
      if(!pdWallCollide(nx,me.y,PD_PRAD))me.x=nx; else me.vx=0;
      if(!pdWallCollide(me.x,ny,PD_PRAD))me.y=ny; else me.vy=0;
      me.x=Math.max(PD_PRAD,Math.min(PD_VW-PD_PRAD,me.x));
      me.y=Math.max(PD_PRAD,Math.min(PD_VH-PD_PRAD,me.y));
      // Keyboard aim fallback
      if((ax||ay)&&!pdState._mouseMoved)me.angle=Math.atan2(ay,ax);
      if(me.flashT>0)me.flashT--;
      // Shoot intent — key or click
      const shootKey=k[' ']||k['f']||k['F']||pdState._clickShoot;
      pdState._clickShoot=false;
      if(shootKey&&me.reloadT<=0){
        me.reloadT=18;
        if(myRole==='owner'){
          // Host fires bullet immediately
          const meIdx=pdState.players.indexOf(me);
          pdState.bullets.push({x:me.x+Math.cos(me.angle)*(PD_PRAD+6),y:me.y+Math.sin(me.angle)*(PD_PRAD+6),vx:Math.cos(me.angle)*PD_BSPD,vy:Math.sin(me.angle)*PD_BSPD,owner:meIdx,life:70});
          me.vx-=Math.cos(me.angle)*0.8; me.vy-=Math.sin(me.angle)*0.8;
        } else {
          // Non-host flags shoot intent — sent to host in next broadcast
          pdState._wantsShoot=true;
          // Local muzzle flash only
          me.vx-=Math.cos(me.angle)*0.8; me.vy-=Math.sin(me.angle)*0.8;
        }
      }
      if(me.reloadT>0)me.reloadT--;
    }

    // ── Interpolate remote player toward received position ──
    pdState.players.forEach(p=>{
      if(p.isMe)return;
      if(p._tx!==undefined){
        const dx=p._tx-p.x,dy=p._ty-p.y;
        const dist=Math.hypot(dx,dy);
        p.x+=dx*(dist>30?0.35:0.2);
        p.y+=dy*(dist>30?0.35:0.2);
      }
      if(p._tangle!==undefined){
        let da=p._tangle-p.angle;
        while(da>Math.PI)da-=Math.PI*2;
        while(da<-Math.PI)da+=Math.PI*2;
        p.angle+=da*0.35;
      }
      if(p.flashT>0)p.flashT--;
    });

    // ── Particles (all clients) ──
    if(pdState.particles){
      pdState.particles=pdState.particles.filter(pt=>{
        pt.x+=pt.vx;pt.y+=pt.vy;pt.life--;pt.vx*=0.92;pt.vy*=0.92;
        return pt.life>0;
      });
    }

    // ── HOST ONLY: bullets, hit detection, HP, round logic ──
    if(myRole!=='owner')return;

    // Apply shoot intent from remote player
    if(pdState._remoteShoot){
      const rs=pdState._remoteShoot; pdState._remoteShoot=null;
      const remP=pdState.players.find(p=>p.name===rs.username&&!p.isMe);
      if(remP&&remP.reloadT<=0){
        const ridx=pdState.players.indexOf(remP);
        pdState.bullets.push({x:remP.x+Math.cos(remP.angle)*(PD_PRAD+6),y:remP.y+Math.sin(remP.angle)*(PD_PRAD+6),vx:Math.cos(remP.angle)*PD_BSPD,vy:Math.sin(remP.angle)*PD_BSPD,owner:ridx,life:70});
        remP.reloadT=18;
        remP.vx-=Math.cos(remP.angle)*0.8; remP.vy-=Math.sin(remP.angle)*0.8;
      }
    }

    pdState.bullets=pdState.bullets.filter(b=>{
      b.x+=b.vx; b.y+=b.vy; b.life--;
      if(b.life<=0||b.x<0||b.x>PD_VW||b.y<0||b.y>PD_VH)return false;
      if(pdWallCollide(b.x,b.y,4))return false;
      let hit=false;
      pdState.players.forEach((p,idx)=>{
        if(idx===b.owner||hit)return;
        if(Math.hypot(b.x-p.x,b.y-p.y)<PD_PRAD+4){
          p.hp=Math.max(0,p.hp-20); p.flashT=8; hit=true;
          pdSpawnHit(b.x,b.y,pdState.players[b.owner]?.color||'#fff');
          updatePdHP();
          if(p.hp<=0)pdRoundOver(pdState.players.indexOf(pdState.players[b.owner]));
        }
      });
      return !hit;
    });
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

    // Broadcast my paddle + host broadcasts ball
    const bcInt = setInterval(() => {
      if (!pongState || pongState.over) { clearInterval(bcInt); return; }
      const me = pongState.paddles.find(p => p.isMe);
      if (!me) return;
      const payload = { username: me.name, pos: me.pos, vel: me.vel };
      if (myRole === 'owner') {
        payload.ball = { x: pongState.ball.x, y: pongState.ball.y, vx: pongState.ball.vx, vy: pongState.ball.vy, speed: pongState.ball.speed };
      }
      socket.emit('gameState', { roomName: currentRoom, game: 'pong', payload });
    }, 33); // ~30hz for pong

    let lastT = 0;
    function pongLoop(now) {
      if (!pongState || pongState.over) return;
      if (Math.abs(canvas.width - canvas.offsetWidth) > 2 && canvas.offsetWidth > 10) resize();
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
    for (const pad of st.paddles) {
      if (pad.isCpu) {
        const target = pad.side === 'left' || pad.side === 'right'
          ? st.ball.y / PH : st.ball.x / PW;
        pad.vel += (target - pad.pos) * 0.08 * dt;
        pad.vel *= 0.75;
        pad.pos = Math.max(PAD_LEN/2/PH, Math.min(1 - PAD_LEN/2/PH, pad.pos + pad.vel/PH * dt));
      } else if (pad.isMe) {
        const cfg = { left:{u:['w','W'],d:['s','S']}, right:{u:['ArrowUp'],d:['ArrowDown']}, top:{u:['q','Q'],d:['e','E']}, bottom:{u:['z','Z'],d:['x','X']} }[pad.side];
        const up   = cfg && cfg.u.some(k2 => k[k2]);
        const down = cfg && cfg.d.some(k2 => k[k2]);
        const tgt  = up ? -SPEED : down ? SPEED : 0;
        pad.vel += (tgt - pad.vel) * (1 - Math.pow(0.7, dt));
        pad.pos = Math.max(PAD_LEN/2/PH, Math.min(1 - PAD_LEN/2/PH, pad.pos + pad.vel/PH * dt));
      } else {
        // Remote player: interpolate smoothly toward received target each frame
        if (pad._tpos !== undefined) {
          const diff = pad._tpos - pad.pos;
          pad.pos += diff * Math.min(1, 0.25 * dt * 3);
          pad.pos = Math.max(PAD_LEN/2/PH, Math.min(1 - PAD_LEN/2/PH, pad.pos));
        }
      }
    }

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

  function drawScanlines(ctx, w, h) {
    // Rebuild cache only when size changes
    if (!_scanlineCache || _scanlineCacheW !== w || _scanlineCacheH !== h) {
      _scanlineCache = document.createElement('canvas');
      _scanlineCache.width = w; _scanlineCache.height = h;
      const sc = _scanlineCache.getContext('2d');
      for (let y = 0; y < h; y += 4) {
        sc.fillStyle = 'rgba(0,0,0,0.14)';
        sc.fillRect(0, y, w, 2);
      }
      _scanlineCacheW = w; _scanlineCacheH = h;
    }
    ctx.drawImage(_scanlineCache, 0, 0);
    ctx.save();
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