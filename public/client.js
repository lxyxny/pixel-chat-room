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
  if (openDmsBtn)   openDmsBtn.addEventListener('click',   () => { initAudio(); if(currentRoom){showScreen(chatScreen);showPanel('dms-panel');} });
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
          '• In minigame lobby: !join to enter, !start to begin',
        ].forEach(l => addSystemMessage(l));
        return;
      }
      addSystemMessage('⚠️ Unknown command: /' + cmd + '  — type /help');
      return;
    }

    // --- @BOT MENTION ---
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
      // fall through — still send the original message to the room
    }

    // --- MINIGAME CHAT COMMANDS (!join, !start) ---
    if (message === '!join' && activeGame && activeGame.state === 'lobby') {
      if (!activeGame.players.includes(myUsername)) {
        activeGame.players.push(myUsername);
        addSystemMessage('✅ You joined the game! (' + activeGame.players.length + ' players)');
      }
    }
    if (message === '!start' && activeGame && activeGame.state === 'lobby' && myRole === 'owner') {
      startGameRound();
    }
    if (activeGame && activeGame.state === 'question') handleQuizAnswer(myUsername, message);
    if (activeGame && activeGame.state === 'drawing')  handleSkribblGuess(myUsername, message);

    // --- EMIT TO SERVER ---
    socket.emit('chatMessage', { roomName:currentRoom, username:myUsername, message, image, replyTo:pendingReply, avatar:myAvatar });
    addMessage({ username:myUsername, message, image, replyTo:pendingReply, id:Date.now()+'-local', timestamp:new Date().toLocaleTimeString(), senderId:socket.id, reactions:{}, avatar:myAvatar }, true);

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
    const msgData = { id:Date.now()+'-dm', from:mySocketId, fromUsername:myUsername, to:activeDmUserId, message, timestamp:new Date().toLocaleTimeString() };
    socket.emit('privateMessage',{toUserId:activeDmUserId,fromUsername:myUsername,message,messageId:msgData.id});
    if (!dmConversations.has(activeDmUserId)) dmConversations.set(activeDmUserId, []);
    dmConversations.get(activeDmUserId).push(msgData);
    addDmMessageEl(msgData);
    updateDmList();
    dmInput.value = '';
  }

  // ===== MINIGAMES =====
  if (minigameBtn) minigameBtn.addEventListener('click', () => {
    if (myRole !== 'owner') { addSystemMessage('⚠️ Only the room host can start minigames.'); return; }
    showMinigameLobby();
  });
  document.getElementById('close-minigame-btn')?.addEventListener('click', () => {
    document.getElementById('minigame-modal')?.classList.add('hidden');
  });

  function mgModal() { return document.getElementById('minigame-modal'); }
  function mgBody()  { return document.getElementById('minigame-body'); }

  function showMinigameLobby() {
    if (!mgModal() || !mgBody()) return;
    mgBody().innerHTML = `
      <h3 style="text-align:center;margin-bottom:20px;font-size:10px;color:var(--pixel-accent);">🎮 CHOOSE A MINIGAME</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="pixel-btn rounded mg-pick" data-game="football" style="padding:14px 12px;">
          ⚽ <strong>FOOTBALL</strong><br/>
          <span style="font-size:7px;opacity:0.8;">2-6 players · simulated match with halftime &amp; penalties</span>
        </button>
        <button class="pixel-btn rounded mg-pick" data-game="quiz" style="padding:14px 12px;">
          📚 <strong>QUIZ BATTLE</strong><br/>
          <span style="font-size:7px;opacity:0.8;">1+ players · 10 questions · timer bar · streaks · categories</span>
        </button>
        <button class="pixel-btn rounded mg-pick" data-game="skribbl" style="padding:14px 12px;">
          🎨 <strong>SKRIBBL</strong><br/>
          <span style="font-size:7px;opacity:0.8;">2+ players · draw &amp; guess · colour palette · word choices</span>
        </button>
      </div>
      <p class="pixel-hint" style="margin-top:14px;text-align:center;">Players type <b>!join</b> in chat, host types <b>!start</b></p>`;
    mgModal().classList.remove('hidden');
    mgBody().querySelectorAll('.mg-pick').forEach(btn => btn.addEventListener('click', () => {
      pickMinigame(btn.dataset.game);
      mgModal().classList.add('hidden');
    }));
  }

  function pickMinigame(type) {
    activeGame = { type, state:'lobby', players:[myUsername], scores:{}, streaks:{} };
    activeGame.scores[myUsername]  = 0;
    activeGame.streaks[myUsername] = 0;
    addSystemMessage('🎮 ' + type.toUpperCase() + ' starting — type !join to enter, host types !start!');
    socket.emit('chatMessage',{roomName:currentRoom,username:myUsername,message:'🎮 Minigame: '+type+'! Type !join to play, host types !start.',avatar:myAvatar});
    if (type==='football') initFootball();
    else if (type==='quiz')    initQuiz();
    else if (type==='skribbl') initSkribbl();
    mgModal().classList.remove('hidden');
  }

  function startGameRound() {
    if (!activeGame) return;
    if (activeGame.type==='football') runFootball();
    else if (activeGame.type==='quiz')    runQuiz();
    else if (activeGame.type==='skribbl') runSkribbl();
  }

  function mgLog(msg, cls) {
    addSystemMessage(msg);
    const log = document.getElementById('mg-log');
    if (log) {
      const d = document.createElement('div');
      d.className = 'mg-event ' + (cls||'system');
      d.textContent = msg;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }
  }

  function mgUpdateScoreboard() {
    const board = document.getElementById('mg-scoreboard');
    if (!board || !activeGame) return;
    board.innerHTML = '';
    const sorted = Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]);
    sorted.forEach(([p,s]) => {
      const row = document.createElement('div');
      row.className = 'mg-lb-row';
      const rank = sorted.indexOf(sorted.find(x=>x[0]===p));
      const medal = rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':'  ';
      row.innerHTML = '<span class="mg-lb-rank">'+medal+'</span><span class="mg-lb-name">'+escapeHtml(p)+'</span><span class="mg-lb-pts">'+s+'</span>';
      board.appendChild(row);
    });
  }

  // ─── FOOTBALL ───────────────────────────────────────────────
  const FB_EVENTS = [
    {w:.25,text:'{p} GOAL! {action}',       cls:'goal',    goal:true},
    {w:.15,text:'{p} Shot saved! {save}',    cls:'save'},
    {w:.12,text:'{p} dribbles past two!',    cls:'save'},
    {w:.08,text:'{p} skies it over the bar.',cls:'save'},
    {w:.08,text:'Foul on {p}! Yellow card.', cls:'foul',    foul:true},
    {w:.06,text:'{p} PENALTY awarded!',      cls:'penalty', pen:true},
    {w:.06,text:'Corner to {team}.',         cls:'save'},
    {w:.05,text:'Offside! Play stops.',      cls:'system'},
    {w:.05,text:'{p} brilliant cross, cleared.',cls:'save'},
    {w:.10,text:'{p} long range effort, just wide.',cls:'save'},
  ];
  const FB_GOALS   = ['curls it in the top corner!','taps it home from close range!','thunderous volley!','chips the keeper beautifully!','headers it powerfully!','penalty kick — scores!'];
  const FB_SAVES   = ['the keeper tips it over!','blocked by the defender!','hits the post!','comfortable save.','cleared off the line!'];

  function weightedPick(arr) {
    const tot = arr.reduce((s,x)=>s+(x.w||1),0);
    let r = Math.random()*tot;
    for (const x of arr) { r -= (x.w||1); if (r<=0) return x; }
    return arr[arr.length-1];
  }

  function initFootball() {
    showGamePanel(`
      <div class="mg-game-header">
        <span style="font-size:10px;">⚽ FOOTBALL</span>
        <span id="mg-matchtime" style="font-size:8px;color:var(--pixel-dim);">Pre-match</span>
      </div>
      <div class="mg-score-board" id="mg-fb-scores">
        <div class="mg-score-card" id="fb-card-a"><div class="score-name" id="fb-name-a">Team A</div><div class="score-val" id="fb-sc-a">0</div></div>
        <div style="font-size:18px;align-self:center;">—</div>
        <div class="mg-score-card" id="fb-card-b"><div class="score-name" id="fb-name-b">Team B</div><div class="score-val" id="fb-sc-b">0</div></div>
      </div>
      <div class="football-field" id="mg-log" style="height:160px;overflow-y:auto;"></div>
      <p id="mg-joined" class="pixel-hint" style="margin-top:6px;">Players: <b>${myUsername}</b></p>
      <p class="pixel-hint">Type !join to enter · Host types !start (min 2)</p>`);
  }

  function runFootball() {
    if (!activeGame || activeGame.players.length < 2) { addSystemMessage('⚠️ Need at least 2 players.'); activeGame.state='lobby'; return; }
    const mid = Math.ceil(activeGame.players.length/2);
    activeGame.teamA    = activeGame.players.slice(0, mid);
    activeGame.teamB    = activeGame.players.slice(mid);
    activeGame.score    = {A:0, B:0};
    activeGame.minute   = 0;
    activeGame.cards    = {};
    activeGame.state    = 'playing';
    activeGame.half     = 1;
    const aN = activeGame.teamA.map(p=>p.split('')[0]+'XI').join('/');
    const bN = activeGame.teamB.map(p=>p.split('')[0]+'XI').join('/');
    if (document.getElementById('fb-name-a')) document.getElementById('fb-name-a').textContent = activeGame.teamA.join('+');
    if (document.getElementById('fb-name-b')) document.getElementById('fb-name-b').textContent = activeGame.teamB.join('+');
    mgLog('🟢 KICK OFF! ' + activeGame.teamA.join(', ') + ' vs ' + activeGame.teamB.join(', '), 'system');
    scheduleFootballEvent(0);
  }

  function scheduleFootballEvent(minute) {
    if (!activeGame || activeGame.type!=='football') return;
    const delay = 800 + Math.random()*600;
    setTimeout(()=>footballEvent(minute), delay);
  }

  function footballEvent(minute) {
    if (!activeGame || activeGame.type!=='football') return;
    activeGame.minute = minute;
    const el = document.getElementById('mg-matchtime');
    if (el) el.textContent = minute + "'";

    // Halftime at 45
    if (minute===45 && activeGame.half===1) {
      activeGame.half = 2;
      mgLog('--- HALF TIME: A '+activeGame.score.A+' - '+activeGame.score.B+' B ---','system');
      setTimeout(()=>{ mgLog('--- SECOND HALF BEGINS ---','system'); scheduleFootballEvent(46); }, 2000);
      return;
    }
    if (minute >= 90) { endFootball(); return; }

    const isA  = Math.random() < 0.5;
    const team = isA ? activeGame.teamA : activeGame.teamB;
    const key  = isA ? 'A' : 'B';
    const p    = team[Math.floor(Math.random()*team.length)];
    const ev   = weightedPick(FB_EVENTS);

    let msg = ev.text.replace('{p}', p).replace('{team}', 'Team '+key)
      .replace('{action}', FB_GOALS[Math.floor(Math.random()*FB_GOALS.length)])
      .replace('{save}', FB_SAVES[Math.floor(Math.random()*FB_SAVES.length)]);

    if (ev.goal) {
      activeGame.score[key]++;
      if (document.getElementById('fb-sc-'+key.toLowerCase())) document.getElementById('fb-sc-'+key.toLowerCase()).textContent = activeGame.score[key];
      // Highlight winning team card
      const cards = document.querySelectorAll('.mg-score-card');
      cards.forEach(c => c.classList.remove('winning'));
      if (activeGame.score.A !== activeGame.score.B) {
        const winner = activeGame.score.A > activeGame.score.B ? 'fb-card-a' : 'fb-card-b';
        document.getElementById(winner)?.classList.add('winning');
      }
    }
    if (ev.foul) { activeGame.cards[p] = (activeGame.cards[p]||0)+1; if(activeGame.cards[p]>=2){msg+=' '+p+' gets a RED card!';} }
    if (ev.pen) {
      // Penalty: 70% chance
      msg += Math.random()<.7 ? ' → SCORES from the spot!' : ' → Penalty MISSED!';
      if (msg.includes('SCORES')) { activeGame.score[key]++; if(document.getElementById('fb-sc-'+key.toLowerCase())) document.getElementById('fb-sc-'+key.toLowerCase()).textContent=activeGame.score[key]; }
    }

    mgLog(minute + "' " + msg, ev.cls);
    scheduleFootballEvent(minute + 2 + Math.floor(Math.random()*4));
  }

  function endFootball() {
    if (!activeGame) return;
    const {A,B} = activeGame.score;
    if (A===B) {
      mgLog('--- FULL TIME: A '+A+' - '+B+' B — DRAW! Going to penalties! ---','system');
      setTimeout(penaltyShootout, 1500);
    } else {
      const winner = A>B ? activeGame.teamA : activeGame.teamB;
      mgLog('🏁 FULL TIME: A '+A+' - '+B+' B  —  ' + winner.join('+') + ' WIN! 🏆','system');
      activeGame = null;
    }
  }

  function penaltyShootout() {
    if (!activeGame) return;
    mgLog('🥅 PENALTY SHOOTOUT begins!','system');
    let round=0, scA=0, scB=0;
    const maxRounds=5;
    function shoot() {
      if (!activeGame) return;
      round++;
      if (round>maxRounds) {
        if (scA===scB) { mgLog('Still level after 5 each — Sudden Death!','system'); }
        const wKey = scA>scB?'A':'B';
        const wTeam= wKey==='A'?activeGame.teamA:activeGame.teamB;
        mgLog('🏆 Penalty winner: ' + wTeam.join('+') + '! (' + scA + '-' + scB + ')','goal');
        activeGame=null; return;
      }
      const pA = activeGame.teamA[Math.floor(Math.random()*activeGame.teamA.length)];
      const pB = activeGame.teamB[Math.floor(Math.random()*activeGame.teamB.length)];
      const gA = Math.random()<.75; const gB = Math.random()<.75;
      if(gA) scA++; if(gB) scB++;
      mgLog(round+'. ' + pA+': '+(gA?'✅ SCORES!':'❌ Missed.')+'  '+pB+': '+(gB?'✅ SCORES!':'❌ Missed.')+'  ('+scA+'-'+scB+')', gA||gB?'goal':'save');
      setTimeout(shoot, 1400);
    }
    shoot();
  }

  // ─── QUIZ ───────────────────────────────────────────────────
  const QUIZ_POOL = [
    {q:'What is 7 × 8?',                           a:'56',          cat:'🔢 Maths'},
    {q:'Capital of France?',                        a:'paris',       cat:'🌍 Geography'},
    {q:'How many sides on a hexagon?',              a:'6',           cat:'🔢 Maths'},
    {q:'Gas plants absorb from the air?',           a:'co2',         cat:'🔬 Science'},
    {q:'Who wrote Romeo and Juliet?',               a:'shakespeare', cat:'📖 Literature'},
    {q:'Largest planet in the solar system?',       a:'jupiter',     cat:'🔭 Astronomy'},
    {q:'How many bones in the human body?',         a:'206',         cat:'🔬 Science'},
    {q:'What year did WW2 end?',                    a:'1945',        cat:'📜 History'},
    {q:'Chemical symbol for gold?',                 a:'au',          cat:'🔬 Science'},
    {q:'Planet closest to the Sun?',                a:'mercury',     cat:'🔭 Astronomy'},
    {q:'How many continents are there?',            a:'7',           cat:'🌍 Geography'},
    {q:'Who painted the Mona Lisa?',                a:'da vinci',    cat:'🎨 Art'},
    {q:'What is the square root of 144?',           a:'12',          cat:'🔢 Maths'},
    {q:'Capital of Japan?',                         a:'tokyo',       cat:'🌍 Geography'},
    {q:'How many strings on a guitar?',             a:'6',           cat:'🎵 Music'},
    {q:'What is H2O?',                              a:'water',       cat:'🔬 Science'},
    {q:'Longest river in the world?',               a:'nile',        cat:'🌍 Geography'},
    {q:'How many keys on a standard piano?',        a:'88',          cat:'🎵 Music'},
    {q:'In what year did the Titanic sink?',        a:'1912',        cat:'📜 History'},
    {q:'Who invented the telephone?',               a:'bell',        cat:'📜 History'},
    {q:'Speed of sound in air (m/s approx)?',       a:'343',         cat:'🔬 Science'},
    {q:'What is the powerhouse of the cell?',       a:'mitochondria',cat:'🔬 Science'},
    {q:'Capital of Australia?',                     a:'canberra',    cat:'🌍 Geography'},
    {q:'How many players in a rugby union team?',   a:'15',          cat:'⚽ Sport'},
    {q:'What sport uses a shuttlecock?',            a:'badminton',   cat:'⚽ Sport'},
  ];

  let quizTimer=null, quizBarTimer=null;
  const QUIZ_TIME=18;

  function initQuiz() {
    activeGame.questions=[...QUIZ_POOL].sort(()=>Math.random()-.5).slice(0,10);
    activeGame.qIdx=0; activeGame.answered=false;
    activeGame.players.forEach(p=>{activeGame.scores[p]=0;activeGame.streaks[p]=0;});
    showGamePanel(`
      <div class="mg-game-header">
        <span style="font-size:10px;">📚 QUIZ BATTLE</span>
        <span id="qz-progress" style="font-size:8px;color:var(--pixel-dim);">Q 0/10</span>
      </div>
      <div class="mg-timer-bar-wrap"><div class="mg-timer-bar" id="qz-timer-bar" style="width:100%"></div></div>
      <div id="qz-question" class="mg-question-box" style="min-height:50px;">Waiting to start…</div>
      <div class="mg-leaderboard" id="mg-scoreboard"></div>
      <div id="mg-log" class="mg-log" style="max-height:100px;margin-top:8px;"></div>
      <p class="pixel-hint" style="margin-top:6px;">Type !join to enter · Host types !start</p>`);
    mgUpdateScoreboard();
  }

  function runQuiz() {
    activeGame.players.forEach(p=>{if(!activeGame.scores[p])activeGame.scores[p]=0;if(!activeGame.streaks[p])activeGame.streaks[p]=0;});
    mgLog('📚 QUIZ START! Answer in chat — first correct gets points!','system');
    askQuestion();
  }

  function askQuestion() {
    if (!activeGame||activeGame.qIdx>=activeGame.questions.length){endQuiz();return;}
    clearTimeout(quizTimer); clearInterval(quizBarTimer);
    const q=activeGame.questions[activeGame.qIdx];
    activeGame.currentAnswer=q.a.toLowerCase().replace(/\s+/g,'');
    activeGame.answered=false;
    activeGame.state='question';
    activeGame.qStart=Date.now();
    activeGame.qTime=QUIZ_TIME;

    const qEl=document.getElementById('qz-question');
    const prog=document.getElementById('qz-progress');
    if (qEl) qEl.innerHTML='<div class="mg-category-badge" style="background:rgba(76,201,240,0.15);border:1px solid #4cc9f0;color:#4cc9f0;">'+q.cat+'</div><br/>'+escapeHtml(q.q);
    if (prog) prog.textContent='Q '+(activeGame.qIdx+1)+'/'+activeGame.questions.length;

    // Timer bar animation
    const bar=document.getElementById('qz-timer-bar');
    if (bar) { bar.style.transition='none'; bar.style.width='100%'; bar.className='mg-timer-bar'; }
    setTimeout(()=>{
      if (bar) { bar.style.transition='width '+QUIZ_TIME+'s linear'; bar.style.width='0%'; }
    },50);

    let remaining=QUIZ_TIME;
    quizBarTimer=setInterval(()=>{
      remaining--;
      if (bar) {
        if (remaining<=5) bar.className='mg-timer-bar danger';
        else if (remaining<=9) bar.className='mg-timer-bar warn';
      }
      if (remaining<=0) clearInterval(quizBarTimer);
    },1000);

    quizTimer=setTimeout(()=>{
      if (!activeGame||activeGame.answered) return;
      clearInterval(quizBarTimer);
      mgLog('⏰ Time\'s up! Answer: '+q.a,'system');
      // Reset streaks
      activeGame.players.forEach(p=>{activeGame.streaks[p]=0;});
      activeGame.qIdx++; setTimeout(askQuestion,1800);
    }, QUIZ_TIME*1000);
  }

  function handleQuizAnswer(username,msg) {
    if (!activeGame||activeGame.type!=='quiz'||activeGame.answered||activeGame.state!=='question') return;
    const norm=msg.toLowerCase().replace(/\s+/g,'');
    // Allow partial match for long answers (>=5 chars)
    const ans=activeGame.currentAnswer;
    const match = norm===ans || (ans.length>=5 && norm.length>=3 && ans.startsWith(norm));
    if (!match) return;
    clearTimeout(quizTimer); clearInterval(quizBarTimer);
    activeGame.answered=true;
    const elapsed=Math.floor((Date.now()-activeGame.qStart)/1000);
    const speedBonus=Math.max(0, QUIZ_TIME-elapsed);
    const streak=(activeGame.streaks[username]||0)+1;
    activeGame.streaks[username]=streak;
    const streakBonus=Math.min(streak-1,3);
    const pts=1+Math.floor(speedBonus/6)+streakBonus;
    activeGame.scores[username]=(activeGame.scores[username]||0)+pts;
    let msg2='✅ '+username+' got it! (+'+pts+' pts';
    if (streakBonus>0) msg2+=' 🔥×'+streak+' streak';
    msg2+=')';
    mgLog(msg2,'goal');
    // Reset everyone else's streak
    activeGame.players.forEach(p=>{if(p!==username)activeGame.streaks[p]=0;});
    mgUpdateScoreboard();
    activeGame.qIdx++;
    setTimeout(askQuestion,1600);
  }

  function endQuiz() {
    if (!activeGame) return;
    mgLog('━━━━ FINAL SCORES ━━━━','system');
    Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]).forEach(([p,s],i)=>{
      mgLog((i===0?'🥇':i===1?'🥈':i===2?'🥉':'  ')+' '+p+': '+s+' pts','system');
    });
    activeGame=null;
  }

  // ─── SKRIBBL ────────────────────────────────────────────────
  const WORD_CATEGORIES = {
    animals:  ['cat','dog','shark','elephant','penguin','dragon','spider','jellyfish','crocodile','giraffe'],
    objects:  ['guitar','telescope','umbrella','scissors','lighthouse','hourglass','compass','lantern','anchor','trophy'],
    places:   ['volcano','castle','pyramid','igloo','treehouse','submarine','spaceship','windmill','skyscraper','cave'],
    food:     ['pizza','sushi','burger','taco','waffle','spaghetti','dumpling','pretzel','cupcake','hotdog'],
    actions:  ['dancing','surfing','climbing','juggling','swimming','sleeping','flying','boxing','fishing','painting'],
  };
  let skribblTimeout=null, currentColor='#e94560', currentSize=5, eraserMode=false;
  const SK_PALETTE=['#e94560','#ff8c00','#ffb700','#4cc9f0','#7bed9f','#ffffff','#a29bfe','#fd79a8','#2d3436','#6c5ce7','#00b894','#fdcb6e'];

  function initSkribbl() {
    activeGame.drawers=[...activeGame.players].sort(()=>Math.random()-.5);
    activeGame.drawerIdx=0;
    activeGame.players.forEach(p=>{activeGame.scores[p]=0;activeGame.streaks[p]=0;});
    showGamePanel(`
      <div class="mg-game-header">
        <span style="font-size:10px;">🎨 SKRIBBL</span>
        <span id="sk-progress" style="font-size:8px;color:var(--pixel-dim);">Round 0/${activeGame.drawers.length}</span>
      </div>
      <div class="mg-timer-bar-wrap"><div class="mg-timer-bar" id="sk-timer-bar" style="width:100%"></div></div>
      <div id="sk-word-display" class="mg-word-display"></div>
      <canvas id="skribbl-canvas" width="400" height="220" style="display:none;border:2px solid var(--pixel-border);border-radius:8px;background:#fff;cursor:crosshair;touch-action:none;width:100%;margin-top:6px;"></canvas>
      <div id="sk-guesser-hint" style="display:none;text-align:center;padding:8px;font-size:8px;color:var(--pixel-dim);">Guess the word in chat!</div>
      <div id="sk-tools" class="skribbl-tools-row" style="display:none;">
        <div class="skribbl-palette" id="sk-palette"></div>
        <input type="range" id="sk-size-range" min="2" max="28" value="5" style="width:70px;"/>
        <button class="pixel-btn small rounded" id="sk-eraser" title="Eraser">⬜</button>
        <button class="pixel-btn small rounded" onclick="window.skClear()">🗑️</button>
        <span id="sk-word-label" style="font-size:8px;color:var(--pixel-accent);margin-left:4px;"></span>
      </div>
      <div class="mg-leaderboard" id="mg-scoreboard" style="margin-top:8px;"></div>
      <div id="mg-log" class="mg-log" style="max-height:80px;margin-top:6px;"></div>
      <p class="pixel-hint" style="margin-top:6px;">Type !join to enter · Host types !start (min 2)</p>`);

    // Build palette
    const pal = document.getElementById('sk-palette');
    if (pal) {
      SK_PALETTE.forEach(c => {
        const sw = document.createElement('div');
        sw.className='sk-color-swatch'+(c===currentColor?' active':'');
        sw.style.background=c;
        sw.addEventListener('click',()=>{
          currentColor=c; eraserMode=false;
          document.querySelectorAll('.sk-color-swatch').forEach(s=>s.classList.remove('active'));
          sw.classList.add('active');
          document.getElementById('sk-eraser')?.classList.remove('active');
        });
        pal.appendChild(sw);
      });
    }
    const sizeRange=document.getElementById('sk-size-range');
    if (sizeRange) sizeRange.addEventListener('input',e=>{currentSize=parseInt(e.target.value);});
    const eraserBtn=document.getElementById('sk-eraser');
    if (eraserBtn) eraserBtn.addEventListener('click',()=>{
      eraserMode=!eraserMode;
      eraserBtn.classList.toggle('active',eraserMode);
    });
    mgUpdateScoreboard();
  }

  const SK_TIME=60;
  function runSkribbl() {
    if (!activeGame||activeGame.players.length<2){addSystemMessage('⚠️ Need at least 2 players.');activeGame.state='lobby';return;}
    activeGame.players.forEach(p=>{if(!activeGame.scores[p])activeGame.scores[p]=0;});
    mgLog('🎨 SKRIBBL! Guess in chat. Drawer: draw your word!','system');
    skribblRound();
  }

  function skribblRound() {
    if (!activeGame||activeGame.drawerIdx>=activeGame.drawers.length){endSkribbl();return;}
    clearTimeout(skribblTimeout);
    const drawer=activeGame.drawers[activeGame.drawerIdx];
    // Pick word from random category
    const cats=Object.keys(WORD_CATEGORIES);
    const cat=cats[Math.floor(Math.random()*cats.length)];
    const pool=WORD_CATEGORIES[cat];
    activeGame.currentWord=pool[Math.floor(Math.random()*pool.length)];
    activeGame.drawerName=drawer;
    activeGame.guessed=false;
    activeGame.state='drawing';
    activeGame.roundStart=Date.now();
    const isMe=drawer===myUsername;
    const prog=document.getElementById('sk-progress');
    if (prog) prog.textContent='Round '+(activeGame.drawerIdx+1)+'/'+activeGame.drawers.length;

    // Word display — blanks for guessers, revealed for drawer
    renderWordBlanks(activeGame.currentWord, isMe);
    mgLog('🖊️ ' + drawer + ' is drawing! Category: '+cat,'system');

    const canvas=document.getElementById('skribbl-canvas');
    const tools=document.getElementById('sk-tools');
    const hint=document.getElementById('sk-guesser-hint');
    const wordLabel=document.getElementById('sk-word-label');

    if (canvas) {
      canvas.style.display=isMe?'block':'none';
      if (isMe) { const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); setupSkribblCanvas(canvas,ctx); }
    }
    if (tools)  tools.style.display=isMe?'flex':'none';
    if (hint)   hint.style.display=isMe?'none':'block';
    if (wordLabel&&isMe) wordLabel.textContent='Word: '+activeGame.currentWord.toUpperCase();

    // Timer bar
    const bar=document.getElementById('sk-timer-bar');
    if (bar){bar.style.transition='none';bar.style.width='100%';bar.className='mg-timer-bar';}
    setTimeout(()=>{if(bar){bar.style.transition='width '+SK_TIME+'s linear';bar.style.width='0%';}},50);

    let rem=SK_TIME;
    const barTick=setInterval(()=>{
      rem--;
      if(bar){if(rem<=10)bar.className='mg-timer-bar danger';else if(rem<=20)bar.className='mg-timer-bar warn';}
      if(rem<=0)clearInterval(barTick);
    },1000);

    skribblTimeout=setTimeout(()=>{
      clearInterval(barTick);
      if(!activeGame||activeGame.guessed)return;
      mgLog("⏰ Time's up! Word was: "+activeGame.currentWord,'system');
      revealWord(activeGame.currentWord);
      activeGame.drawerIdx++;
      if(canvas)canvas.style.display='none';
      if(tools)tools.style.display='none';
      if(hint)hint.style.display='none';
      setTimeout(skribblRound,2000);
    }, SK_TIME*1000);
  }

  function renderWordBlanks(word, reveal) {
    const el=document.getElementById('sk-word-display');
    if (!el) return;
    el.innerHTML='';
    word.split('').forEach(ch=>{
      const box=document.createElement('div');
      box.className='mg-letter-box'+(reveal?' revealed':'');
      box.textContent=reveal?ch.toUpperCase():ch===' '?'⠀':'';
      if (!reveal&&ch!==' ') box.style.color='transparent';
      el.appendChild(box);
    });
  }

  function revealWord(word) {
    const boxes=document.querySelectorAll('.mg-letter-box');
    word.split('').forEach((ch,i)=>{
      if(boxes[i]){boxes[i].textContent=ch.toUpperCase();boxes[i].classList.add('revealed');boxes[i].style.color='';}
    });
  }

  function setupSkribblCanvas(canvas,ctx) {
    let drawing=false;
    const pos=e=>{
      const r=canvas.getBoundingClientRect();
      const src=e.touches?e.touches[0]:e;
      return{x:(src.clientX-r.left)*(canvas.width/r.width),y:(src.clientY-r.top)*(canvas.height/r.height)};
    };
    const startDraw=e=>{
      drawing=true;
      const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y);
    };
    const doDraw=e=>{
      if(!drawing)return; e.preventDefault();
      ctx.globalCompositeOperation=eraserMode?'destination-out':'source-over';
      ctx.strokeStyle=eraserMode?'rgba(0,0,0,1)':currentColor;
      ctx.lineWidth=eraserMode?currentSize*2.5:currentSize;
      ctx.lineCap='round'; ctx.lineJoin='round';
      const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y);
    };
    const stopDraw=()=>{drawing=false;ctx.globalCompositeOperation='source-over';};
    canvas.onmousedown=canvas.ontouchstart=startDraw;
    canvas.onmousemove=canvas.ontouchmove=doDraw;
    canvas.onmouseup=canvas.onmouseleave=canvas.ontouchend=stopDraw;
  }

  window.skClear=function(){
    const c=document.getElementById('skribbl-canvas');
    if(c){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);}
  };

  function handleSkribblGuess(username,msg) {
    if(!activeGame||activeGame.type!=='skribbl'||activeGame.guessed||username===activeGame.drawerName||activeGame.state!=='drawing')return;
    // Close guess detection (Levenshtein distance 1 for words >=5 chars)
    const guess=msg.toLowerCase().trim();
    const word=activeGame.currentWord.toLowerCase();
    if (guess!==word && !(word.length>=5 && levenshtein(guess,word)<=1)) return;
    clearTimeout(skribblTimeout);
    activeGame.guessed=true;
    const elapsed=Math.floor((Date.now()-activeGame.roundStart)/1000);
    const speedPts=Math.max(1, Math.floor((SK_TIME-elapsed)/10)+1);
    activeGame.scores[username]=(activeGame.scores[username]||0)+speedPts+1;
    activeGame.scores[activeGame.drawerName]=(activeGame.scores[activeGame.drawerName]||0)+1;
    mgLog('✅ '+username+' guessed it! Word: '+activeGame.currentWord+' (+'+( speedPts+1)+' pts)','goal');
    revealWord(activeGame.currentWord);
    mgUpdateScoreboard();
    activeGame.drawerIdx++;
    const canvas=document.getElementById('skribbl-canvas'),tools=document.getElementById('sk-tools'),hint=document.getElementById('sk-guesser-hint');
    if(canvas)canvas.style.display='none';if(tools)tools.style.display='none';if(hint)hint.style.display='none';
    setTimeout(skribblRound,2000);
  }

  function levenshtein(a,b){
    const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i?j?0:i:j));
    for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return dp[m][n];
  }

  function endSkribbl() {
    if(!activeGame)return;
    mgLog('🎨 GAME OVER! Final Leaderboard:','system');
    Object.entries(activeGame.scores).sort((a,b)=>b[1]-a[1]).forEach(([p,s],i)=>{
      mgLog((i===0?'🥇':i===1?'🥈':i===2?'🥉':'  ')+' '+p+': '+s+' pts','system');
    });
    activeGame=null;
  }

  // ─── SHARED GAME UTILS ──────────────────────────────────────
  function showGamePanel(html) {
    const modal=mgModal(), body=mgBody();
    if(body) body.innerHTML=html;
    if(modal) modal.classList.remove('hidden');
  }

  // ===== SOCKET EVENTS =====
  socket.on('connect',       () => { mySocketId = socket.id; });
  socket.on('connect_error', () => addSystemMessage('⚠️ Connection error. Check server.'));

  socket.on('joinedRoom', ({ roomName, users, socketId, isHost:hostStatus, role }) => {
    mySocketId = socketId; isHost = hostStatus; myRole = role || (isHost?'owner':'member');
    if (roomDisplay) roomDisplay.textContent = roomName;
    if (minigameBtn) minigameBtn.style.display = myRole==='owner' ? 'inline-flex' : 'none';
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
    // Route incoming !join and quiz/skribbl answers from other players
    if (activeGame && activeGame.state==='lobby' && data.message==='!join') {
      if (!activeGame.players.includes(data.username)) {
        activeGame.players.push(data.username);
        if (!activeGame.scores) activeGame.scores = {};
        activeGame.scores[data.username] = 0;
        addSystemMessage('✅ ' + data.username + ' joined! (' + activeGame.players.length + ' players)');
        const el = document.getElementById('mg-joined');
        if (el) el.textContent = 'Players: ' + activeGame.players.join(', ');
      }
    }
    if (activeGame && activeGame.state==='question' && data.username!==myUsername) handleQuizAnswer(data.username, data.message);
    if (activeGame && activeGame.state==='drawing'  && data.username!==myUsername) handleSkribblGuess(data.username, data.message);

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