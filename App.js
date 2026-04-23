<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content">
    <meta name="theme-color" content="#020617">
    <title>SISTEMA: SALDO VIVO</title>
    
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <style>
        :root {
            --sys-blue: #0ea5e9; --sys-bg: #020617; --sys-card: #0f172a;
            --sys-red: #ef4444; --sys-gold: #fbbf24; --sys-purple: #a855f7;
            --text: #f8fafc; --sub: #64748b;
            --fire-glow: 12px; --fire-speed: 2s;
        }
        body.theme-pro {
            --sys-blue: #00b37e; --sys-bg: #0a0a0c; --sys-card: #16161a;
            --sys-purple: #00b37e;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; outline: none; }
        body { background: var(--sys-bg); color: var(--text); display: flex; justify-content: center; height: 100dvh; overflow: hidden; transition: 0.3s; }

        .app { width: 100%; max-width: 430px; height: 100%; display: flex; flex-direction: column; position: relative; border-right: 1px solid #1e293b; border-left: 1px solid #1e293b; background: radial-gradient(circle at top, var(--sys-card) 0%, var(--sys-bg) 100%); overflow: hidden; }

        /* XP BAR */
        .xp-cont { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #000; z-index: 1000; }
        .xp-fill { height: 100%; background: var(--sys-blue); width: 0%; box-shadow: 0 0 15px var(--sys-blue); transition: 0.5s; }

        /* HEADER & PROFILE */
        header { padding: 30px 20px 15px; border-bottom: 1px solid rgba(14, 165, 233, 0.2); background: rgba(2, 6, 23, 0.6); backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center; z-index: 100; flex-shrink: 0;}
        
        .hunter-profile { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .avatar { width: 50px; height: 50px; border-radius: 50%; background: #1e293b; border: 2px solid var(--sys-blue); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--sub); overflow: hidden; background-size: cover; background-position: center; box-shadow: 0 0 15px rgba(14, 165, 233, 0.3); transition: 0.3s;}
        .avatar:active { transform: scale(0.9); }
        
        .cp-box { display: flex; flex-direction: column; justify-content: center; }
        .hunter-name { font-size: 1rem; font-weight: 900; color: #fff; letter-spacing: -0.5px; text-transform: uppercase;}
        .rank-tag { font-size: 0.6rem; color: var(--sys-blue); font-weight: 900; letter-spacing: 2px; text-transform: uppercase; transition: 0.5s; margin: 2px 0;}
        .cp-val { font-size: 0.85rem; font-weight: 800; color: var(--sub); }

        .header-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        .voice-btn { font-size: 20px; cursor: pointer; color: var(--sub); transition: 0.3s; }
        .voice-btn.active { color: var(--sys-blue); text-shadow: 0 0 10px var(--sys-blue); }

        .streak-badge { background: rgba(239, 68, 68, 0.1); color: var(--sys-red); padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.7rem; border: 1px solid rgba(239, 68, 68, 0.2); animation: fire-pulse var(--fire-speed) infinite; display: flex; align-items: center; gap: 4px;}
        @keyframes fire-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); box-shadow: 0 0 var(--fire-glow) rgba(239, 68, 68, 0.3); } }

        /* SCREENS */
        .screen { flex: 1; padding: 15px 20px 100px; overflow-y: auto; display: none; position: relative; }
        .screen.active { display: block; animation: system-in 0.2s ease-out; }
        @keyframes system-in { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }

        /* BOSS CARD & WINDOWS */
        .boss-card { background: linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid var(--sys-red); border-radius: 4px; padding: 15px; margin-bottom: 20px; position: relative; }
        .hp-bg { height: 10px; background: #000; border-radius: 2px; overflow: hidden; border: 1px solid #450a0a; margin: 8px 0; }
        .hp-fill { height: 100%; background: linear-gradient(90deg, #7f1d1d, #ef4444); width: 100%; transition: 0.5s; }
        .window { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--sys-blue); padding: 18px; border-radius: 2px; margin-bottom: 15px; }
        .win-title { font-size: 0.7rem; color: var(--sys-blue); font-weight: 900; border-bottom: 1px solid rgba(14, 165, 233, 0.2); padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); margin-bottom: 8px; border-left: 3px solid var(--sys-blue); border-radius: 2px; }
        .item-row.shadow { border-left-color: var(--sys-purple); }

        /* SKILLS */
        .skill-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .skill { background: #1e293b; padding: 15px; border-radius: 4px; text-align: center; border: 1px solid #334155; opacity: 0.2; filter: grayscale(1); transition: 0.3s; cursor: pointer; color: #fff; font-size: 24px; }
        .skill.unlocked { opacity: 1; filter: grayscale(0); border-color: var(--sys-gold); color: var(--sys-gold); animation: skill-pulse 2s infinite ease-in-out; background: rgba(251, 191, 36, 0.05); }
        @keyframes skill-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 5px rgba(251, 191, 36, 0.3); } 50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(251, 191, 36, 0.6); } }

        /* --- FÍSICA CORRIGIDA DO CHAT E TECLADO --- */
        #chat.active { display: flex !important; flex-direction: column; padding: 15px 15px 0 15px !important; overflow: hidden; }
        .chat-wrap { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; padding-bottom: 10px; }
        
        .input-container { position: relative; display: flex; flex-direction: column; gap: 10px; margin-top: auto; z-index: 150; padding-bottom: 85px; transition: 0.2s; }
        .input-container.keyboard-open { padding-bottom: 10px; }
        
        .msg { max-width: 85%; padding: 15px; font-size: 0.9rem; line-height: 1.4; border-radius: 2px; }
        .msg.bot { background: rgba(14, 165, 233, 0.05); border: 1px solid var(--sys-blue); border-left-width: 4px; color: #cbd5e1; }
        .msg.me { background: #1e293b; align-self: flex-end; border-right: 4px solid var(--sub); color: #fff; }

        .calc-box { background: var(--sys-card); border: 1px solid var(--sys-blue); border-radius: 4px; padding: 10px; display: none; grid-template-columns: repeat(4, 1fr); gap: 5px; box-shadow: 0 -10px 20px rgba(0,0,0,0.5); }
        .calc-btn { background: #1e293b; border: none; color: white; padding: 15px 5px; border-radius: 2px; font-weight: bold; cursor: pointer; font-size: 1rem; }
        .calc-btn.op { color: var(--sys-blue); }

        .input-bar { display: flex; gap: 10px; background: #0f172a; padding: 8px; border: 1px solid var(--sys-blue); border-radius: 4px; box-shadow: 0 0 25px rgba(0,0,0,0.5); align-items: center; }
        .input-bar input { flex: 1; background: none; border: none; color: white; padding-left: 10px; font-size: 1rem; outline: none; }
        .action-btn { background: var(--sys-blue); color: white; width: 44px; height: 44px; border: none; border-radius: 2px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

        /* MODAIS */
        #sys-modal, #dungeon-modal, #custom-prompt-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; background: rgba(2, 6, 23, 0.98); border: 2px solid var(--sys-blue); padding: 20px; z-index: 2000; display: none; box-shadow: 0 0 50px rgba(0,0,0,1); border-radius: 4px; }
        .close-btn { position: absolute; top: 10px; right: 10px; color: var(--sub); font-size: 24px; cursor: pointer; z-index: 2001;}
        .close-btn:hover { color: var(--sys-red); }
        
        .cp-input { width: 100%; padding: 12px; margin-bottom: 12px; background: #0f172a; border: 1px solid var(--sys-blue); color: white; border-radius: 2px; outline: none; font-size: 1rem; }
        .cp-input::placeholder { color: var(--sub); }
        .cp-btn-row { display: flex; gap: 10px; margin-top: 10px; }
        .cp-btn { flex: 1; padding: 12px; font-weight: 900; border: none; border-radius: 2px; cursor: pointer; text-transform: uppercase; }

        /* SNAKE DUNGEON */
        .game-container { width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 10px; }
        #snake-canvas { background: #000; border: 1px solid var(--sys-blue); width: 280px; height: 280px; }
        .d-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; }
        .d-btn { width: 60px; height: 60px; background: #1e293b; border: 1px solid var(--sys-blue); color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; }
        .dungeon-entry { position: absolute; bottom: 100px; right: 20px; width: 45px; height: 45px; background: rgba(168, 85, 247, 0.1); color: var(--sys-purple); border: 1px solid var(--sys-purple); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; animation: glitch-float 3s infinite; z-index: 50; }
        @keyframes glitch-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        /* NAV */
        nav { position: absolute; bottom: 0; width: 100%; height: 85px; background: #020617; border-top: 1px solid #1e293b; display: flex; justify-content: space-around; padding-top: 10px; z-index: 100; transition: transform 0.2s ease-out; }
        .nav-item { color: #475569; display: flex; flex-direction: column; align-items: center; font-size: 0.6rem; font-weight: 900; cursor: pointer; }
        .nav-item.active { color: var(--sys-blue); text-shadow: 0 0 10px var(--sys-blue); }
        .nav-item i { font-size: 24px; margin-bottom: 4px; }
        .plus-btn { background: var(--sys-blue); width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: translateY(-25px); color: white; font-size: 1.6rem; box-shadow: 0 0 25px rgba(14, 165, 233, 0.4); }

        ::-webkit-scrollbar { width: 0; }

        /* TELA DE LOADING */
        #splash-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: var(--sys-bg); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.5s ease-out, visibility 0.5s; }
        .splash-content { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;}
        .splash-logo { width: 160px; height: 160px; border-radius: 24px; box-shadow: 0 0 30px rgba(14, 165, 233, 0.4); animation: pulse-glow 2s infinite ease-in-out; object-fit: cover;}
        .splash-title { color: var(--sys-blue); font-weight: 900; font-size: 1.2rem; letter-spacing: 4px; text-shadow: 0 0 15px var(--sys-blue); }
        .splash-loading-bar { width: 220px; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden; margin-top: 10px;}
        .splash-loading-fill { width: 0%; height: 100%; background: var(--sys-blue); box-shadow: 0 0 10px var(--sys-blue); transition: width 1.5s cubic-bezier(0.1, 0.7, 0.1, 1); }
        .splash-text { font-size: 0.7rem; color: var(--sub); text-transform: uppercase; letter-spacing: 2px; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulse-glow { 0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); } 50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(14, 165, 233, 0.8); } }
    </style>
</head>
<body onclick="wakeAudio()">

    <div id="splash-screen">
        <div class="splash-content">
            <img src="icone.jpg" alt="Logo" class="splash-logo" onerror="this.style.display='none'">
            <div class="splash-title">O SISTEMA</div>
            <div class="splash-loading-bar"><div class="splash-loading-fill" id="splash-fill"></div></div>
            <div class="splash-text">Conectando...</div>
        </div>
    </div>

    <input type="file" id="photo-upload" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)">

    <audio id="snd-lvl" src="https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg" preload="auto"></audio>
    <audio id="snd-in" src="https://actions.google.com/sounds/v1/cartoon/cartoon_coin_drop.ogg" preload="auto"></audio>
    <audio id="snd-out" src="https://actions.google.com/sounds/v1/cartoon/swipe_2.ogg" preload="auto"></audio>

    <div class="xp-cont"><div class="xp-fill" id="xp-fill"></div></div>

    <div id="custom-prompt-modal">
        <i class="ph ph-x-circle close-btn" onclick="cpCancel()"></i>
        <div id="cp-title" style="font-size: 0.8rem; color: var(--sys-blue); font-weight: 900; border-bottom: 1px solid var(--sys-blue); padding-bottom: 10px; margin-bottom: 15px; text-transform: uppercase;">AÇÃO DO SISTEMA</div>
        <div id="cp-msg" style="color: #fff; font-size: 0.9rem; margin-bottom: 15px; display: none;"></div>
        
        <input type="text" id="cp-input-1" class="cp-input" autocomplete="off" autocorrect="off" spellcheck="false">
        <input type="number" id="cp-input-2" class="cp-input" style="display: none;" autocomplete="off">
        
        <div class="cp-btn-row">
            <button onclick="cpCancel()" class="cp-btn" style="background: #1e293b; color: white;">Cancelar</button>
            <button onclick="cpConfirm()" class="cp-btn" style="background: var(--sys-blue); color: white;">Confirmar</button>
        </div>
    </div>

    <div id="sys-modal">
        <i class="ph ph-x-circle close-btn" onclick="closeModal()"></i>
        <div style="font-size: 0.7rem; color: var(--sys-blue); font-weight: 900; border-bottom: 1px solid var(--sys-blue); padding-bottom: 10px; margin-bottom: 15px; width: 90%;">AVISO DO ARQUITETO</div>
        <div id="modal-desc" style="font-size: 0.9rem; line-height: 1.5; color: #fff; margin-bottom: 20px;"></div>
        <button id="sys-modal-btn" onclick="closeModal()" style="width: 100%; padding: 12px; background: var(--sys-blue); color: #fff; border: none; font-weight: 900; cursor: pointer; border-radius: 2px;">CONFIRMAR</button>
    </div>

    <div id="dungeon-modal">
        <i class="ph ph-x-circle close-btn" onclick="closeDungeon()"></i>
        <div style="font-size: 0.7rem; color: var(--sys-purple); font-weight: 900; border-bottom: 1px solid var(--sys-purple); padding-bottom: 10px; text-align: center;">SNAKE HUNTER: MANA DRILL</div>
        <div class="game-container">
            <div style="display:flex; width:100%; justify-content:space-between; margin-bottom:10px; font-size:0.8rem; color:var(--sys-gold)">
                <span>SCORE: <b id="game-score">0</b></span>
                <span>XP: <b id="game-xp">0</b></span>
            </div>
            <canvas id="snake-canvas" width="280" height="280"></canvas>
            <button id="start-btn" onclick="startGame()" style="margin-top:15px; padding:12px; width:100%; background:var(--sys-purple); border:none; color:white; font-weight:900; border-radius:2px;">INICIAR RAID</button>
            <div class="d-pad">
                <div></div><div class="d-btn" onclick="changeDir('up')"><i class="ph-bold ph-caret-up"></i></div><div></div>
                <div class="d-btn" onclick="changeDir('left')"><i class="ph-bold ph-caret-left"></i></div>
                <div class="d-btn" onclick="changeDir('down')"><i class="ph-bold ph-caret-down"></i></div>
                <div class="d-btn" onclick="changeDir('right')"><i class="ph-bold ph-caret-right"></i></div>
            </div>
        </div>
    </div>

    <div class="app">
        <header>
            <div class="hunter-profile" onclick="document.getElementById('photo-upload').click()">
                <div class="avatar" id="avatar-ui"><i class="ph-fill ph-user"></i></div>
                <div class="cp-box">
                    <div class="hunter-name" id="name-ui">HUNTER</div>
                    <div class="rank-tag" id="rank-ui">RANK E: POBRE</div>
                    <div class="cp-val" id="cp-ui">CP: 0</div>
                </div>
            </div>
            <div class="header-actions">
                <i class="ph-fill ph-speaker-high voice-btn" id="voice-toggle" onclick="toggleVoice()"></i>
                <div class="streak-badge"><i class="ph-fill ph-fire"></i> <span id="streak-ui">1</span></div>
            </div>
        </header>

        <div id="home" class="screen active">
            <div class="dungeon-entry" onclick="openDungeon()"><i class="ph-fill ph-sword"></i></div>

            <div class="boss-card">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:900; color:var(--sys-red)">
                    <span>BOSS: <span id="boss-name-ui">PRIMEIRA DÍVIDA</span></span>
                    <span id="hp-pct-ui">100% HP</span>
                </div>
                <div class="hp-bg"><div class="hp-fill" id="hp-fill-ui"></div></div>
                <p style="font-size: 0.7rem; color: var(--sub);">Dano restante: <b id="boss-rem-ui" style="color:var(--sys-red)">R$ 0,00</b></p>
            </div>

            <div class="window">
                <div style="font-size: 0.7rem; color: var(--sys-blue); font-weight: 900; margin-bottom: 10px;">HUNTER SKILLS</div>
                <div class="skill-grid">
                    <div class="skill" id="sk-1" onclick="showCond(1)"><i class="ph-fill ph-fire-simple"></i></div>
                    <div class="skill" id="sk-2" onclick="showCond(2)"><i class="ph-fill ph-crown"></i></div>
                    <div class="skill" id="sk-3" onclick="showCond(3)"><i class="ph-fill ph-diamond"></i></div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px">
                <div class="window" style="margin-bottom:0"><span style="font-size:0.6rem; color:var(--sub)">FOR (MANA)</span><br><span style="font-size:1.1rem; font-weight:800" id="balance-ui">R$ 0,00</span></div>
                <div class="window" style="margin-bottom:0"><span style="font-size:0.6rem; color:var(--sub)">LEVEL</span><br><span style="font-size:1.1rem; font-weight:800" id="lvl-ui">1</span></div>
            </div>

            <div class="window" style="margin-top: 15px;">
                <div class="win-title">Survival Prediction</div>
                <div id="survival-msg" style="font-size: 0.85rem;">Sincronizando dados...</div>
            </div>

            <div id="history-ui" style="margin-top:15px; margin-bottom: 20px;"></div>
        </div>

        <div id="inventory" class="screen">
            <div class="window">
                <div class="win-title">ARTEFATOS (Patrimônio) <button onclick="addItem()" style="background:var(--sys-blue); border:none; color:white; padding:4px 8px; border-radius:2px; font-weight:bold; cursor:pointer;">+ ADD</button></div>
                <div id="item-list"></div>
            </div>

            <div class="window" style="border-color: var(--sys-purple);">
                <div class="win-title" style="color: var(--sys-purple);">SOMBRAS (Gastos Fixos) <button onclick="addShadow()" style="background:var(--sys-purple); border:none; color:white; padding:4px 8px; border-radius:2px; font-weight:bold; cursor:pointer;">+ ADD</button></div>
                <div id="shadow-list"></div>
            </div>
        </div>

        <div id="chat" class="screen">
            <div class="chat-wrap" id="chat-ui"></div>
            
            <div class="input-container" id="input-box">
                <div class="calc-box" id="calc-ui">
                    <button class="calc-btn" onclick="calcNum('7')">7</button><button class="calc-btn" onclick="calcNum('8')">8</button><button class="calc-btn" onclick="calcNum('9')">9</button><button class="calc-btn op" onclick="calcOp('/')">÷</button>
                    <button class="calc-btn" onclick="calcNum('4')">4</button><button class="calc-btn" onclick="calcNum('5')">5</button><button class="calc-btn" onclick="calcNum('6')">6</button><button class="calc-btn op" onclick="calcOp('*')">×</button>
                    <button class="calc-btn" onclick="calcNum('1')">1</button><button class="calc-btn" onclick="calcNum('2')">2</button><button class="calc-btn" onclick="calcNum('3')">3</button><button class="calc-btn op" onclick="calcOp('-')">−</button>
                    <button class="calc-btn" onclick="calcNum('0')">0</button><button class="calc-btn" onclick="calcRes()">=</button><button class="calc-btn op" onclick="calcClear()">C</button><button class="calc-btn op" onclick="calcOp('+')">+</button>
                </div>
                
                <div class="input-bar">
                    <i class="ph ph-calculator" style="color:var(--sys-blue); cursor:pointer; font-size:24px;" onclick="toggleCalc()"></i>
                    <i class="ph ph-microphone" style="color:var(--sys-blue); cursor:pointer; font-size:24px;" onclick="ouvirVoz()"></i>
                    
                    <input type="text" id="input-ui" placeholder="Relatar..." autocomplete="off" autocorrect="off" spellcheck="false" data-lpignore="true" onfocus="tecladoAtivo()" onblur="tecladoInativo()">
                    
                    <button class="action-btn" onclick="enviarMensagem()"><i class="ph-fill ph-paper-plane-right"></i></button>
                </div>
            </div>
        </div>

        <div id="settings" class="screen">
            <div class="window">
                <div class="win-title">SYSTEM QG</div>
                <button onclick="configPerfil()" style="width:100%; padding:15px; background:none; border:1px solid #333; color:white; margin-bottom:10px; text-align:left; cursor:pointer;">Mudar Nome do Hunter</button>
                <button onclick="configBoss()" style="width:100%; padding:15px; background:none; border:1px solid #333; color:white; margin-bottom:10px; text-align:left; cursor:pointer;">Configurar Boss (Meta/Dívida)</button>
                <button onclick="toggleTheme()" style="width:100%; padding:15px; background:none; border:1px solid #333; color:white; margin-bottom:10px; text-align:left; cursor:pointer;">Alternar Tema (Hunter / Pro)</button>
                <button onclick="exportarWA()" style="width:100%; padding:15px; background:rgba(14, 165, 233, 0.1); border:1px solid var(--sys-blue); color:var(--sys-blue); margin-bottom:20px; text-align:left; cursor:pointer; font-weight:bold;">Exportar Report (WhatsApp)</button>
                
                <div class="win-title" style="color:var(--sys-gold); border-bottom-color:rgba(251, 191, 36, 0.2);">COFRE DA GUILDA</div>
                <button onclick="gerarBackupLocal()" style="width:100%; padding:15px; background:rgba(251, 191, 36, 0.1); border:1px solid var(--sys-gold); color:var(--sys-gold); margin-bottom:10px; text-align:left; cursor:pointer; font-weight:bold;">Gerar Código de Backup (Salvar)</button>
                <button onclick="restaurarBackupLocal()" style="width:100%; padding:15px; background:rgba(168, 85, 247, 0.1); border:1px solid var(--sys-purple); color:var(--sys-purple); margin-bottom:10px; text-align:left; cursor:pointer; font-weight:bold;">Restaurar Backup (Carregar)</button>

                <button onclick="resetAll()" style="width:100%; padding:15px; background:none; border:1px solid var(--sys-red); color:var(--sys-red); margin-top:20px; text-align:left; cursor:pointer;">Resetar Sistema (Apagar Tudo)</button>
            </div>
        </div>

        <nav id="nav-menu">
            <div class="nav-item active" onclick="navegar('home', this)"><i class="ph-fill ph-user-focus"></i>STATUS</div>
            <div class="nav-item" onclick="navegar('inventory', this)"><i class="ph-fill ph-backpack"></i>ITENS</div>
            <div class="plus-btn" onclick="navegar('chat', this)"><i class="ph ph-plus"></i></div>
            <div class="nav-item" onclick="navegar('settings', this)"><i class="ph-fill ph-shield-check"></i>QG</div>
        </nav>
    </div>

    <script>
        // --- CHAVE NOVA PARA INÍCIO ZERADO ---
        let db = JSON.parse(localStorage.getItem('sv_app_oficial_v1')) || {
            lvl: 1, xp: 0, streak: 1, last: '', voice: true,
            trans: [], items: [], shadows: [],
            boss: { nome: 'PRIMEIRA DÍVIDA', total: 1000 },
            profile: { name: 'HUNTER', theme: 'hunter', avatar: null }
        };

        if(db.profile.theme === 'pro') document.body.classList.add('theme-pro');

        function save() { localStorage.setItem('sv_app_oficial_v1', JSON.stringify(db)); }
        window.addEventListener('beforeunload', save);
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });

        // --- SISTEMA DE TECLADO ---
        function tecladoAtivo() {
            document.getElementById('nav-menu').style.display = 'none';
            document.getElementById('input-box').classList.add('keyboard-open');
            setTimeout(() => {
                const c = document.getElementById('chat-ui');
                c.scrollTop = c.scrollHeight;
            }, 100);
        }

        function tecladoInativo() {
            document.getElementById('nav-menu').style.display = 'flex';
            document.getElementById('input-box').classList.remove('keyboard-open');
        }

        // --- SISTEMA DE MODAL CUSTOMIZADO ---
        let promptCallback = null;
        
        function openPrompt(title, placeholders, callback, isConfirm = false, msg = "") {
            document.getElementById('cp-title').innerText = title;
            const msgEl = document.getElementById('cp-msg');
            const i1 = document.getElementById('cp-input-1');
            const i2 = document.getElementById('cp-input-2');

            if(msg) { msgEl.innerHTML = msg; msgEl.style.display = 'block'; } else { msgEl.style.display = 'none'; }

            if(isConfirm) {
                i1.style.display = 'none'; i2.style.display = 'none';
            } else {
                i1.style.display = 'block'; i1.placeholder = placeholders[0]; i1.value = '';
                if(placeholders.length > 1) {
                    i2.style.display = 'block'; i2.placeholder = placeholders[1]; i2.value = '';
                } else { i2.style.display = 'none'; }
            }

            promptCallback = callback;
            document.getElementById('custom-prompt-modal').style.display = 'block';
            if(!isConfirm) i1.focus();
        }

        function cpConfirm() {
            document.getElementById('custom-prompt-modal').style.display = 'none';
            if(document.getElementById('cp-input-1').style.display === 'none') {
                if(promptCallback) promptCallback(true);
            } else {
                const v1 = document.getElementById('cp-input-1').value.trim();
                const v2 = document.getElementById('cp-input-2').value.trim();
                if(promptCallback) promptCallback([v1, v2]);
            }
        }

        function cpCancel() {
            document.getElementById('custom-prompt-modal').style.display = 'none';
            if(document.getElementById('cp-input-1').style.display === 'none') {
                if(promptCallback) promptCallback(false);
            }
            promptCallback = null;
        }

        // --- FUNÇÕES DE QG ---
        function configPerfil() { openPrompt("ALTERAR IDENTIDADE", ["Novo Nome Hunter:"], (res) => { if(res[0]) { db.profile.name = res[0].toUpperCase(); atualizarTudo(); } }); }
        function configBoss() { openPrompt("NOVO ALVO (BOSS)", ["Nome da Dívida/Meta:", "Valor Total (R$):"], (res) => { let v = parseFloat(res[1].replace(',','.')); if(res[0] && !isNaN(v)) { db.boss = {nome: res[0].toUpperCase(), total: v}; atualizarTudo(); } }); }
        function addItem() { openPrompt("REGISTRAR ARTEFATO", ["Nome do Bem/Patrimônio:", "Valor (R$):"], (res) => { let v = parseFloat(res[1].replace(',','.')); if(res[0] && !isNaN(v)) { db.items.push({nome: res[0], val: v}); atualizarTudo(); } }); }
        function addShadow() { openPrompt("REGISTRAR SOMBRA", ["Gasto Fixo (Ex: Aluguel):", "Valor (R$):"], (res) => { let v = parseFloat(res[1].replace(',','.')); if(res[0] && !isNaN(v)) { db.shadows.push({nome: res[0], val: v}); atualizarTudo(); } }); }
        
        function restaurarBackupLocal() {
            openPrompt("RESTAURAR SISTEMA", ["Cole o Código de Backup Aqui:"], (res) => {
                if (res[0]) {
                    try {
                        const parsed = JSON.parse(decodeURIComponent(atob(res[0])));
                        if(parsed && parsed.lvl) {
                            db = parsed; save();
                            alertCustom("SUCESSO", "Sistema restaurado.");
                            setTimeout(()=>location.reload(), 1500);
                        } else alertCustom("ERRO", "Código inválido ou incompatível.");
                    } catch(e) { alertCustom("ERRO CRÍTICO", "O código fornecido está corrompido."); }
                }
            });
        }

        function resetAll() {
            openPrompt("ALERTA DE DESTRUIÇÃO", [], (confirmado) => {
                if(confirmado) { localStorage.clear(); location.reload(); }
            }, true, "Tem certeza que deseja apagar todo o seu progresso? Essa ação é irreversível.");
        }

        function alertCustom(title, msg) {
            document.getElementById('sys-modal').style.display = 'block';
            document.querySelector('#sys-modal div:nth-child(2)').innerText = title;
            document.getElementById('modal-desc').innerHTML = msg;
            document.getElementById('sys-modal-btn').innerText = "CONFIRMAR";
            document.getElementById('sys-modal-btn').onclick = closeModal;
        }

        function gerarBackupLocal() {
            save(); 
            const dataStr = btoa(encodeURIComponent(JSON.stringify(db)));
            document.getElementById('sys-modal').style.display = 'block';
            document.querySelector('#sys-modal div:nth-child(2)').innerText = "CÓDIGO GERADO";
            document.getElementById('modal-desc').innerHTML = `Copie o código abaixo e guarde seguro:<br><textarea id="bkp-text" style="width:100%; height:80px; background:#000; color:var(--sys-gold); border:1px solid var(--sys-gold); padding:5px; margin-top:10px; border-radius:2px; font-size:0.7rem;" readonly>${dataStr}</textarea>`;
            
            const btn = document.getElementById('sys-modal-btn');
            btn.innerText = "COPIAR CÓDIGO";
            btn.onclick = () => {
                const txt = document.getElementById('bkp-text');
                txt.select(); document.execCommand("copy");
                document.getElementById('modal-desc').innerHTML = "<b style='color:var(--sys-blue)'>CÓDIGO COPIADO COM SUCESSO!</b>";
                falar("Código copiado.");
            };
        }

        function closeModal() { document.getElementById('sys-modal').style.display = 'none'; }

        // --- SISTEMAS DE MULTIMÍDIA E COMPONENTES ---
        function wakeAudio() { document.querySelectorAll('audio').forEach(a => { a.play().then(() => a.pause()).catch(()=>{}); }); }
        function tocarSom(id) {
            let audio = document.getElementById(id);
            if(audio) { audio.currentTime = 0; audio.play().catch(e => console.warn("Áudio requer interação inicial.", e)); }
        }

        function handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 150;
                    let width = img.width; let height = img.height;
                    if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                    else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    db.profile.avatar = canvas.toDataURL('image/jpeg', 0.7);
                    save(); atualizarTudo();
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }

        function falar(t) {
            if (!db.voice) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(t);
            u.lang = 'pt-BR'; u.rate = 1.1; u.pitch = 0.8;
            window.speechSynthesis.speak(u);
        }
        function toggleVoice() {
            db.voice = !db.voice;
            document.getElementById('voice-toggle').className = db.voice ? "ph-fill ph-speaker-high voice-btn active" : "ph-fill ph-speaker-slash voice-btn";
            falar(db.voice ? "Voz ativa." : ""); save();
        }

        let calcVal = "";
        function toggleCalc() { const c = document.getElementById('calc-ui'); c.style.display = c.style.display === 'grid' ? 'none' : 'grid'; }
        function calcNum(n) { calcVal += n; document.getElementById('input-ui').value = calcVal; }
        function calcOp(o) { calcVal += " " + o + " "; document.getElementById('input-ui').value = calcVal; }
        function calcClear() { calcVal = ""; document.getElementById('input-ui').value = ""; }
        function calcRes() { try { calcVal = eval(calcVal).toString(); document.getElementById('input-ui').value = calcVal; } catch { calcVal = "Erro"; } }

        function delI(i) { db.items.splice(i,1); atualizarTudo(); }
        function delS(i) { db.shadows.splice(i,1); atualizarTudo(); }

        // --- SNAKE DUNGEON ENGINE ---
        const canvas = document.getElementById('snake-canvas');
        const ctx = canvas.getContext('2d');
        const box = 20;
        let snake, coin, bills, direction, gameInterval, score;

        function openDungeon() { document.getElementById('dungeon-modal').style.display = 'block'; falar("Dungeon detectada."); }
        function closeDungeon() { document.getElementById('dungeon-modal').style.display = 'none'; clearInterval(gameInterval); document.getElementById('start-btn').style.display = 'block'; }

        function startGame() {
            snake = [{x: 7 * box, y: 7 * box}, {x: 6 * box, y: 7 * box}];
            coin = { x: 10 * box, y: 10 * box };
            bills = []; direction = "RIGHT"; score = 0;
            document.getElementById('game-score').innerText = score;
            document.getElementById('game-xp').innerText = 0;
            document.getElementById('start-btn').style.display = 'none';
            if(gameInterval) clearInterval(gameInterval);
            gameInterval = setInterval(drawGame, 130);
        }

        function changeDir(dir) {
            if(dir == 'up' && direction != 'DOWN') direction = 'UP';
            if(dir == 'down' && direction != 'UP') direction = 'DOWN';
            if(dir == 'left' && direction != 'RIGHT') direction = 'LEFT';
            if(dir == 'right' && direction != 'LEFT') direction = 'RIGHT';
        }

        function drawGame() {
            ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            for(let i=0; i<snake.length; i++) {
                ctx.fillStyle = (i == 0) ? "#020617" : "#1e293b";
                ctx.strokeStyle = (i == 0) ? "#0ea5e9" : "#020617";
                ctx.lineWidth = (i == 0) ? 2 : 1;
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
                ctx.strokeRect(snake[i].x, snake[i].y, box, box);
            }
            ctx.font = "16px Arial"; ctx.fillText("💰", coin.x, coin.y + 15);
            bills.forEach(b => ctx.fillText("💸", b.x, b.y + 15));

            let snakeX = snake[0].x; let snakeY = snake[0].y;
            if(direction == "LEFT") snakeX -= box;
            if(direction == "UP") snakeY -= box;
            if(direction == "RIGHT") snakeX += box;
            if(direction == "DOWN") snakeY += box;

            if (snakeX < 0) snakeX = canvas.width - box;
            if (snakeX >= canvas.width) snakeX = 0;
            if (snakeY < 0) snakeY = canvas.height - box;
            if (snakeY >= canvas.height) snakeY = 0;

            let newHead = { x: snakeX, y: snakeY };

            if(checkSelfCol(newHead, snake) || checkObsCol(newHead, bills)) { gameOver(); return; }

            if(snakeX == coin.x && snakeY == coin.y) {
                tocarSom('snd-in');
                score += 10;
                document.getElementById('game-score').innerText = score;
                document.getElementById('game-xp').innerText = score * 3;
                coin = { x: Math.floor(Math.random() * 14) * box, y: Math.floor(Math.random() * 14) * box };
                bills.push({ x: Math.floor(Math.random() * 14) * box, y: Math.floor(Math.random() * 14) * box });
            } else { snake.pop(); }
            snake.unshift(newHead);
        }

        function checkSelfCol(head, body) { for(let i=1; i<body.length; i++) if(head.x == body[i].x && head.y == body[i].y) return true; return false; }
        function checkObsCol(head, obs) { for(let i=0; i<obs.length; i++) if(head.x == obs[i].x && head.y == obs[i].y) return true; return false; }

        function gameOver() {
            clearInterval(gameInterval);
            let xpGained = score * 3; db.xp += xpGained;
            tocarSom('snd-out'); falar("Raid falhou."); 
            alertCustom("GAME OVER", `Score: ${score}<br>XP Ganho: +${xpGained}`);
            document.getElementById('start-btn').style.display = 'block'; atualizarTudo();
        }

        // --- SISTEMA CORE ---
        function atualizarTudo() {
            let tin = 0; let tout = 0; let bossHits = 0;
            let historyHTML = '';
            
            db.trans.forEach((t, i) => {
                if(t.tipo === 'in') tin += t.val; 
                else { tout += t.val; if(t.desc.toLowerCase().includes('boss') || t.desc.toLowerCase().includes('paguei')) bossHits += t.val; }
                
                if(i < 5) {
                    const d = new Date(t.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'});
                    historyHTML += `<div style="display:flex; justify-content:space-between; padding:12px; background:rgba(255,255,255,0.03); margin-bottom:8px; border-left:3px solid var(--sys-${t.tipo==='in'?'blue':'red'}); font-size:0.8rem;"><span>${d} • ${t.desc.substring(0,18)}</span> <b>${format(t.val)}</b></div>`;
                }
            });

            document.getElementById('history-ui').innerHTML = historyHTML;

            const saldo = tin - tout;
            const fixosTotal = db.shadows.reduce((a,b)=>a+b.val,0);
            const saldoLivre = saldo - fixosTotal;
            const patrimônio = db.items.reduce((a,b)=>a+b.val,0);
            const cp = Math.floor(saldoLivre * 1.5) + patrimônio + (db.lvl * 350);

            document.getElementById('name-ui').innerText = db.profile.name;
            const avatarUi = document.getElementById('avatar-ui');
            if (db.profile.avatar) {
                avatarUi.innerHTML = ''; avatarUi.style.backgroundImage = `url(${db.profile.avatar})`;
            } else {
                avatarUi.innerHTML = '<i class="ph-fill ph-user"></i>'; avatarUi.style.backgroundImage = 'none';
            }

            const rankUi = document.getElementById('rank-ui');
            let rText = ""; let rColor = "";
            if (cp < 0) { rText = "RANK F: ENDIVIDADO"; rColor = "var(--sys-red)"; }
            else if (cp < 3000) { rText = "RANK E: POBRE"; rColor = "var(--sub)"; }
            else if (cp < 10000) { rText = "RANK D: CLASSE BAIXA"; rColor = "var(--sub)"; }
            else if (cp < 25000) { rText = "RANK C: CLASSE MÉDIA"; rColor = "var(--sys-blue)"; }
            else if (cp < 60000) { rText = "RANK B: CLASSE MÉDIA ALTA"; rColor = "var(--sys-blue)"; }
            else if (cp < 150000) { rText = "RANK A: CLASSE ALTA"; rColor = "var(--sys-purple)"; }
            else if (cp < 500000) { rText = "RANK S: MILIONÁRIO"; rColor = "var(--sys-gold)"; }
            else if (cp < 1000000) { rText = "RANK SS: MULTIMILIONÁRIO"; rColor = "var(--sys-gold)"; }
            else { rText = "RANK SSS: MONARCA"; rColor = "var(--sys-gold)"; rankUi.style.textShadow = "0 0 15px var(--sys-gold)"; }

            rankUi.innerText = rText; rankUi.style.color = rColor;
            if(cp < 1000000) rankUi.style.textShadow = `0 0 8px ${rColor}`;

            document.getElementById('cp-ui').innerText = `CP: ${cp.toLocaleString()}`;
            document.getElementById('balance-ui').innerText = format(saldoLivre);
            document.getElementById('lvl-ui').innerText = db.lvl;
            document.getElementById('streak-ui').innerText = db.streak;

            const bossRem = Math.max(0, db.boss.total - bossHits);
            const hpPct = ((bossRem / db.boss.total) * 100).toFixed(0);
            document.getElementById('hp-fill-ui').style.width = hpPct + '%';
            document.getElementById('hp-pct-ui').innerText = hpPct + '% HP';
            document.getElementById('boss-name-ui').innerText = db.boss.nome;
            document.getElementById('boss-rem-ui').innerText = format(bossRem);

            const avg = tout / (db.trans.filter(t=>t.tipo==='out').length || 1) || 1;
            const days = Math.floor(Math.max(saldoLivre, 0) / avg);
            document.getElementById('survival-msg').innerHTML = saldoLivre <= 0 ? "<b>MANA NEGATIVA. PERIGO.</b>" : `Sobrevivência: <b>${days} dias</b>`;

            document.getElementById('item-list').innerHTML = db.items.map((it, i) => `<div class="item-row"><span>${it.nome}</span> <b>${format(it.val)} <i class="ph ph-trash" onclick="delI(${i})" style="cursor:pointer; color:var(--sys-red);"></i></b></div>`).join('') || "<p style='color:gray; font-size:0.7rem;'>Nenhum artefato.</p>";
            document.getElementById('shadow-list').innerHTML = db.shadows.map((sh, i) => `<div class="item-row shadow"><span>${sh.nome}</span> <b>${format(sh.val)} <i class="ph ph-trash" onclick="delS(${i})" style="cursor:pointer; color:var(--sys-red);"></i></b></div>`).join('') || "<p style='color:gray; font-size:0.7rem;'>Nenhuma sombra fixa.</p>";

            const nextXp = db.lvl * 500;
            document.getElementById('xp-fill').style.width = (db.xp / nextXp * 100) + '%';
            if(db.xp >= nextXp) levelUp();

            const sk1 = document.getElementById('sk-1'); const sk2 = document.getElementById('sk-2'); const sk3 = document.getElementById('sk-3');
            if(db.streak >= 5) sk1.classList.add('unlocked'); else sk1.classList.remove('unlocked');
            if(db.lvl >= 10) sk2.classList.add('unlocked'); else sk2.classList.remove('unlocked');
            if(saldoLivre >= 10000) sk3.classList.add('unlocked'); else sk3.classList.remove('unlocked');

            save();
        }

        function levelUp() { db.lvl++; db.xp = 0; tocarSom('snd-lvl'); confetti({ particleCount: 200, spread: 70 }); falar("Aviso. Seu nível de Hunter subiu."); atualizarTudo(); }

        function enviarMensagem() {
            const input = document.getElementById('input-ui'); let txt = input.value.trim(); if(!txt) return;
            addMsg(txt, 'me'); input.value = '';
            
            let match = txt.replace('R$', '').replace('.', '').replace(',', '.').match(/\d+(\.\d+)?/);
            if(!match) { addMsg("[SISTEMA: VALOR INVÁLIDO]", 'bot'); return; }
            
            const val = parseFloat(match[0]);
            const txtL = txt.toLowerCase(); const inK = ['pix', 'ganhei', 'recebi', 'salário', 'vendi', 'caiu'];
            let tipo = inK.some(k => txtL.includes(k)) ? 'in' : 'out';
            let isBoss = (txtL.includes('boss') || txtL.includes('paguei') || txtL.includes('dívida')) && tipo === 'out';
            
            db.trans.unshift({ val, tipo, desc: txt, isBoss, date: new Date().toISOString() });
            db.xp += 100;
            
            let resp = "";
            if(tipo === 'in') { tocarSom('snd-in'); resp = `+${format(val)} créditos.`; } 
            else { tocarSom('snd-out'); resp = isBoss ? `Dano Crítico! -${format(val)} HP no Boss.` : `-${format(val)} consumidos.`; }
            
            calcVal = ""; addMsg(resp, 'bot'); falar(resp); 
            atualizarTudo(); 
            setTimeout(() => { const c = document.getElementById('chat-ui'); c.scrollTop = c.scrollHeight; }, 100);
        }

        function showCond(id) {
            document.getElementById('sys-modal').style.display = 'block';
            document.querySelector('#sys-modal div:nth-child(2)').innerText = "AVISO DO ARQUITETO";
            const desc = document.getElementById('modal-desc');
            
            if(id==1) desc.innerHTML = "<b>MÃO DE FERRO</b><br>Requer Streak de 5 dias.<br>Atual: " + db.streak + "/5";
            if(id==2) desc.innerHTML = "<b>AUTORIDADE</b><br>Requer Nível 10.<br>Atual: LVL " + db.lvl;
            if(id==3) desc.innerHTML = "<b>SOMBRA DO LUCRO</b><br>Requer R$ 10.000,00 de Saldo Livre.";
            
            const btn = document.getElementById('sys-modal-btn');
            btn.innerText = "CONFIRMAR";
            btn.onclick = closeModal;
        }
        
        function toggleTheme() { document.body.classList.toggle('theme-pro'); db.profile.theme = document.body.classList.contains('theme-pro') ? 'pro' : 'hunter'; save(); }
        function exportarWA() { const msg = `⚔️ *SISTEMA SALDOVIVO: REPORT*\n\nHunter: *${db.profile.name}*\n👑 Título: *${document.getElementById('rank-ui').innerText}*\n💰 Saldo Livre: ${document.getElementById('balance-ui').innerText}\n👾 Boss: ${db.boss.nome} (${document.getElementById('hp-pct-ui').innerText})\n🔥 Streak: ${db.streak} dias\n\n[DADOS PROTEGIDOS]`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`); }

        function format(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
        function addMsg(t, s) { const c = document.getElementById('chat-ui'); const d = document.createElement('div'); d.className = `msg ${s}`; d.innerText = t; c.appendChild(d); c.scrollTop = c.scrollHeight; }
        function navegar(id, btn) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active')); document.getElementById(id).classList.add('active'); if(btn) btn.classList.add('active'); if(id==='chat' && document.getElementById('chat-ui').children.length===0) { const m = `[O ARQUITETO] O Sistema aguarda, ${db.profile.name}.`; addMsg(m,'bot'); falar(m); } }
        
        // --- MOTOR DE VOZ (COM PERMISSÃO FORÇADA) ---
        function ouvirVoz() { 
            if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
                alertCustom("FALHA DE COMUNICAÇÃO", "O motor de voz não é suportado neste formato. Abra no Google Chrome e clique em 'Adicionar à Tela Inicial'.");
                return;
            }

            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        stream.getTracks().forEach(track => track.stop());
                        iniciarReconhecimento();
                    })
                    .catch(function(err) {
                        alertCustom("ACESSO NEGADO", "O Sistema precisa da sua permissão de Microfone. Autorize nas configurações.");
                    });
            } else {
                iniciarReconhecimento(); // Fallback para navegadores que não exigem pré-check
            }
        }

        function iniciarReconhecimento() {
            try {
                const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)(); 
                rec.lang = 'pt-BR'; 
                
                rec.onstart = () => {
                    document.getElementById('sys-modal').style.display = 'block';
                    document.querySelector('#sys-modal div:nth-child(2)').innerText = "MODO DE ESCUTA ATIVO";
                    document.getElementById('modal-desc').innerHTML = "<div style='text-align:center; padding:10px;'><i class='ph-fill ph-microphone' style='font-size:40px; color:var(--sys-blue); animation: pulse-glow 1.5s infinite;'></i><br><br><b style='color:#fff'>Fale agora, Hunter...</b></div>";
                    const btn = document.getElementById('sys-modal-btn');
                    btn.innerText = "CANCELAR ESCUTA";
                    btn.onclick = () => { rec.stop(); closeModal(); };
                };
                
                rec.onresult = (e) => { 
                    document.getElementById('input-ui').value = e.results[0][0].transcript; 
                    closeModal();
                    enviarMensagem(); 
                }; 
                
                rec.onerror = (e) => {
                    closeModal();
                    if (e.error === 'not-allowed') {
                        alertCustom("PERMISSÃO REVOGADA", "O microfone foi bloqueado durante o uso.");
                    } else {
                        alertCustom("FALHA NA ESCUTA", `Erro no motor de voz (${e.error}). Tente novamente.`);
                    }
                };
                rec.start(); 
            } catch (e) {
                alertCustom("ERRO CRÍTICO", "Falha ao iniciar o módulo de voz.");
            }
        }

        window.addEventListener('load', () => {
            setTimeout(() => { document.getElementById('splash-fill').style.width = '100%'; }, 100);
            setTimeout(() => {
                const splash = document.getElementById('splash-screen');
                splash.style.opacity = '0'; splash.style.visibility = 'hidden';
                falar("Sistema Online.");
            }, 1800);
        });

        const hj = new Date().toDateString();
        if(db.last !== hj) { let ont = new Date(); ont.setDate(ont.getDate()-1); if(db.last === ont.toDateString()) db.streak++; else if(db.last !== '') db.streak = 1; db.last = hj; db.xp += 300; save(); }

        document.getElementById('voice-toggle').className = db.voice ? "ph-fill ph-speaker-high voice-btn active" : "ph-fill ph-speaker-slash voice-btn";
        atualizarTudo();
    </script>
</body>
</html>
