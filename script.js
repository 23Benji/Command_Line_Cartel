// ==========================================
// 0. AUDIO SYNTHESIZER
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playKeystroke() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

// ==========================================
// 1. SOFT FADE/GLOW BACKGROUND
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

let blobs = [];
class Blob {
    constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8; this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 300 + 200; this.alpha = Math.random() * 0.15 + 0.05; 
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
        this.draw();
    }
    draw() {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, `rgba(0, 255, 65, ${this.alpha})`); grad.addColorStop(1, 'rgba(0, 255, 65, 0)');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}
function initBlobs() { blobs = []; for (let i = 0; i < 6; i++) blobs.push(new Blob()); }
function animateFades() {
    requestAnimationFrame(animateFades);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < blobs.length; i++) blobs[i].update();
}
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initBlobs(); });
initBlobs(); animateFades();

// ==========================================
// DOM Elements
// ==========================================
const mainWindow = document.getElementById('main-window');
const outputDiv = document.getElementById('output');
const gameContainer = document.getElementById('game-container');
const stream = document.getElementById('network-stream');
const traceFill = document.getElementById('trace-bar-fill');
const gameMsg = document.getElementById('game-msg');

const vaultContent = document.getElementById('vault-content');
const explorerGrid = document.getElementById('explorer-grid');
const breadcrumb = document.getElementById('breadcrumb');
const fileModal = document.getElementById('file-modal');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text-content');
const modalOverlay = document.getElementById('modal-blur-overlay');
const downloadBtn = document.getElementById('modal-download-btn');
const modalClose = document.getElementById('modal-close');

const idsFeed = document.getElementById('ids-feed');
const quakeTerminal = document.getElementById('quake-terminal');
const quakeInput = document.getElementById('quake-input');
const quakeHistory = document.getElementById('quake-history');
const terminalToggleBtn = document.getElementById('terminal-toggle');
const quakePromptSpan = document.querySelector('#quake-input-line span');

const crackerModal = document.getElementById('cracker-modal');
const targetPinEl = document.getElementById('target-pin');
const hashStreamEl = document.getElementById('cracker-hash-stream');
const timerValEl = document.getElementById('timer-val');
const crackBtn = document.getElementById('crack-btn');

function randomHex(length) { 
    let r = ''; const c = '0123456789ABCDEF'; 
    for(let i=0;i<length;i++) r+=c.charAt(Math.floor(Math.random()*c.length)); return r; 
}
function randomIP() { return `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`; }
function triggerGlitch() { mainWindow.classList.add('glitch-active'); setTimeout(() => mainWindow.classList.remove('glitch-active'), 300); }

// ==========================================
// LIVE IDS LOG
// ==========================================
function pushIDSLog(msg, level = 'info') {
    const line = document.createElement('div');
    line.className = `ids-line ids-${level}`;
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const timeStr = `${months[now.getMonth()]} ${now.getDate().toString().padStart(2, '0')} ${now.toLocaleTimeString('en-US', {hour12: false})}`;
    
    line.innerHTML = `<span style="color:#444">[${timeStr}]</span> ${msg}`;
    idsFeed.appendChild(line);
    if (idsFeed.children.length > 12) idsFeed.removeChild(idsFeed.firstChild);
}

setInterval(() => {
    if (Math.random() > 0.3) {
        const rIP = randomIP();
        const logs = [
            `kernel: [ 1234.5678] DROP IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=${rIP} DST=10.0.0.1 LEN=40 PROTO=TCP SPT=443 DPT=${Math.floor(Math.random()*60000)}`,
            `sshd[${Math.floor(Math.random()*10000)}]: Failed password for invalid user admin from ${rIP} port ${Math.floor(Math.random()*60000)} ssh2`,
            `snort[1123]: [1:2210021:2] SURICATA STREAM ESTABLISHED packet out of window [Priority: 2] {TCP} ${rIP}:80 -> 10.0.0.1:43411`,
            `nginx: ${rIP} - - "${Math.random() > 0.5 ? 'GET' : 'POST'} /wp-login.php HTTP/1.1" 404 153 "-" "Mozilla/5.0"`,
            `auth: pam_unix(su:auth): authentication failure; logname= uid=1000 euid=0 tty=/dev/pts/1 ruser=sysadmin rhost=  user=root`
        ];
        pushIDSLog(logs[Math.floor(Math.random() * logs.length)], 'info');
    }
}, 1500);

// ==========================================
// QUAKE DROPDOWN TERMINAL 
// ==========================================
let quakeOpen = false;
let commandHistory = [];
let historyIndex = 0;
const systemCommands = ["help", "whoami", "clear", "exit", "reboot", "ls", "cd", "cat", "get", "download"];

function toggleTerminal() {
    quakeOpen = !quakeOpen;
    if (quakeOpen) {
        quakeTerminal.classList.add('active');
        quakeInput.focus();
        playKeystroke();
    } else {
        quakeTerminal.classList.remove('active');
        quakeInput.blur();
        playKeystroke();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        e.preventDefault(); toggleTerminal();
    }
});

if (terminalToggleBtn) {
    terminalToggleBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation(); 
        toggleTerminal();
    });
}

quakeTerminal.addEventListener('mousedown', (e) => {
    e.stopPropagation(); 
    if (quakeOpen) {
        setTimeout(() => quakeInput.focus(), 10);
    }
});

document.addEventListener('mousedown', (e) => {
    if (quakeOpen) {
        toggleTerminal();
    }
});

quakeInput.addEventListener('keydown', function(e) {
    const inputVal = quakeInput.value;

    if (e.key === 'Tab') {
        e.preventDefault(); 
        playKeystroke();
        const parts = inputVal.split(" ");
        
        if (parts.length === 1) {
            const matches = systemCommands.filter(c => c.startsWith(parts[0].toLowerCase()));
            if (matches.length === 1) quakeInput.value = matches[0] + " ";
        } else if (parts.length === 2 && fs[currentPath]) {
            const dirContents = Object.keys(fs[currentPath]);
            const matches = dirContents.filter(f => f.toLowerCase().startsWith(parts[1].toLowerCase()));
            if (matches.length === 1) quakeInput.value = parts[0] + " " + matches[0];
        }
        return;
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault(); playKeystroke();
        if (historyIndex > 0) {
            historyIndex--;
            quakeInput.value = commandHistory[historyIndex];
        }
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault(); playKeystroke();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            quakeInput.value = commandHistory[historyIndex];
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex++;
            quakeInput.value = ""; 
        }
        return;
    }

    if (e.key === 'Enter') {
        playKeystroke();
        const val = inputVal.trim();
        quakeInput.value = "";
        if (!val) return;

        if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== val) {
            commandHistory.push(val);
        }
        historyIndex = commandHistory.length; 

        const line = document.createElement('div');
        let displayPath = currentPath === 'root' ? '~' : '~/' + currentPath.split('/')[1];
        line.innerHTML = `<span class="green-bright">sysadmin@root:${displayPath}#</span> ${val}`;
        quakeHistory.appendChild(line);

        const response = document.createElement('div');
        response.style.color = "var(--dim)";
        
        const args = val.split(" ");
        const cmd = args[0].toLowerCase();
        const arg1 = args[1];

        if (cmd === 'help') {
            response.innerHTML = "Commands: <br>- ls: List directory<br>- cd [dir]: Change directory<br>- cat [file]: Read text file<br>- get [file]: Download file<br>- whoami: Print user<br>- clear: Clear terminal<br>- exit: Close terminal<br>- reboot: Restart system";
        } else if (cmd === 'whoami') {
            response.innerHTML = "root";
        } else if (cmd === 'clear') {
            quakeHistory.innerHTML = "";
            return;
        } else if (cmd === 'exit') {
            toggleTerminal();
            return;
        } else if (cmd === 'reboot') {
            sessionStorage.removeItem('ROOT_ACCESS'); 
            location.reload();
        } else if (cmd === 'ls') {
            if (!fs[currentPath]) {
                response.innerHTML = "ls: cannot access directory.";
            } else {
                let out = "";
                for (let item in fs[currentPath]) {
                    out += (fs[currentPath][item].type === 'dir' ? `<span style="color:var(--blue); font-weight:bold">${item}/</span>  ` : `${item}  `);
                }
                response.innerHTML = out || "Empty directory";
            }
        } else if (cmd === 'cd') {
            if (!arg1) {
                response.innerHTML = "cd: missing argument";
            } else if (arg1 === "..") {
                if (currentPath !== "root") {
                    let parts = currentPath.split('/');
                    parts.pop();
                    currentPath = parts.join('/');
                    renderBreadcrumb(); renderGrid(); 
                    response.innerHTML = `Directory changed.`;
                }
            } else {
                const targetPath = `${currentPath}/${arg1}`;
                if (fs[currentPath] && fs[currentPath][arg1] && fs[currentPath][arg1].type === 'dir') {
                    currentPath = targetPath;
                    renderBreadcrumb(); renderGrid(); 
                } else {
                    response.innerHTML = `cd: ${arg1}: No such directory`;
                }
            }
        } else if (cmd === 'cat') {
            if (fs[currentPath] && fs[currentPath][arg1]) {
                if (fs[currentPath][arg1].type === 'txt') {
                    response.innerHTML = fs[currentPath][arg1].content.replace(/\n/g, "<br>");
                } else {
                    response.innerHTML = `cat: ${arg1}: is a binary/encrypted file. Use 'get' to download.`;
                }
            } else {
                response.innerHTML = `cat: ${arg1}: No such file`;
            }
        } else if (cmd === 'get' || cmd === 'download') {
            const fileData = fs[currentPath] ? fs[currentPath][arg1] : null;
            if (fileData && fileData.type === 'file') {
                if (fileData.restricted) {
                    response.innerHTML = `<span class="alert">[ERROR] ${arg1} is MILITARY GRADE ENCRYPTED. Use the GUI to initialize decryption bypass sequence.</span>`;
                } else {
                    response.innerHTML = `Initiating download sequence for ${arg1}...`;
                    const link = document.createElement('a');
                    link.href = fileData.fileURL; link.download = fileData.fileURL;
                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                }
            } else {
                response.innerHTML = `get: ${arg1}: Cannot download file (doesn't exist or is a directory).`;
            }
        } else {
            response.innerHTML = `bash: ${cmd}: command not found`;
        }
        
        quakeHistory.appendChild(response);
        quakeHistory.scrollTop = quakeHistory.scrollHeight;
    } else if (e.key !== '`') {
        playKeystroke();
    }
});


// ==========================================
// BOOT & SNIFFER MINIGAME
// ==========================================
let gameActive = false; let traceLevel = 0; let totalFails = 0; const MAX_FAILS = 5; let packetSpawner;

function printBoot() {
    outputDiv.innerHTML = "<span class='green-bright'>[ OK ]</span> Kernel loaded.<br><span class='alert'>!!! MANUAL OVERRIDE REQUIRED !!!</span>";
    setTimeout(initGame, 1000);
}

function initGame() { gameContainer.style.display = 'block'; gameActive = true; spawnPacket(); }

function spawnPacket() {
    if (!gameActive) return;
    const p = document.createElement('div'); p.className = 'packet'; p.style.top = Math.floor(Math.random() * 170) + 'px';
    const duration = Math.random() * 4 + 6; p.style.animationDuration = duration + 's';
    
    if (Math.random() < 0.10) { 
        p.innerHTML = `[TCP] ${randomIP()}:443 -> ${randomIP()}:22 <span class="data-segment">PAYLOAD: 0xROOT</span>`; p.dataset.target = "true"; 
    } else { 
        p.innerHTML = `[UDP] ${randomIP()}:80 -> ${randomIP()}:53 <span class="data-segment">PAYLOAD: ${randomHex(4)}</span>`; p.dataset.target = "false"; 
    }
    
    p.onmousedown = function() {
        if (!gameActive) return; playKeystroke();
        if (this.dataset.target === "true") { 
            gameActive = false; clearTimeout(packetSpawner); 
            sessionStorage.setItem('ROOT_ACCESS', 'GRANTED');
            gameContainer.style.display = 'none'; outputDiv.style.display = "none"; initExplorer(); 
        } else { 
            traceLevel += 20; traceFill.style.width = traceLevel + '%';
            if (traceLevel >= 100) { window.close(); document.body.innerHTML = "CRITICAL FAILURE."; document.body.style.color = "red"; }
        }
    };
    stream.appendChild(p); setTimeout(() => { if (p.parentNode) p.remove(); }, duration * 1000);
    packetSpawner = setTimeout(spawnPacket, Math.random() * 800 + 600);
}

// ==========================================
// GUI FILE EXPLORER
// ==========================================
let fs = {};

fetch('vault-data.json')
    .then(response => response.json())
    .then(data => {
        fs = data;
        if (sessionStorage.getItem('ROOT_ACCESS') === 'GRANTED') {
            outputDiv.style.display = "none"; gameContainer.style.display = "none"; initExplorer();
        } else { setTimeout(printBoot, 300); }
    });

let currentPath = "root";
let currentFile = null; 

function updateTerminalPrompt() {
    if (quakePromptSpan) {
        let displayPath = currentPath === 'root' ? '~' : '~/' + currentPath.split('/')[1];
        quakePromptSpan.innerHTML = `sysadmin@root:${displayPath}#`;
    }
}

function initExplorer() { vaultContent.style.display = 'block'; renderBreadcrumb(); renderGrid(); }

function renderBreadcrumb() {
    breadcrumb.innerHTML = `[ <span style="color:var(--dim)">DIR</span> ] / ${currentPath.replace('root', 'kali:~')}`;
    updateTerminalPrompt(); 
    breadcrumb.onclick = () => { if(currentPath !== "root") { playKeystroke(); currentPath = "root"; renderBreadcrumb(); renderGrid(); } };
}

function renderGrid() {
    explorerGrid.innerHTML = "";
    const contents = fs[currentPath];
    for (let itemName in contents) {
        const item = contents[itemName];
        const el = document.createElement('div'); el.className = 'grid-item';
        
        let iconHtml = item.type === "dir" ? `📁` : (item.type === "txt" ? `📄` : `📦`);
        let colorClass = item.type === "dir" ? "icon-folder" : (item.type === "txt" ? "icon-txt" : "icon-file");
        
        el.innerHTML = `<div class="icon ${colorClass}">${iconHtml}</div><div class="item-name">${itemName}</div>`;
        
        el.querySelector('.icon').onclick = () => {
            playKeystroke();
            pushIDSLog(`snort[1123]: [1:1000042:1] UNAUTHORIZED ACCESS ATTEMPT: ${itemName} [Priority: 1]`, 'alert');

            if (item.type === "dir") {
                currentPath = `${currentPath}/${itemName}`; renderBreadcrumb(); renderGrid();
            } else {
                openModal(itemName, item);
            }
        };
        explorerGrid.appendChild(el);
    }
}

function openModal(filename, fileData) {
    modalTitle.innerText = filename; fileModal.style.display = "flex"; currentFile = fileData;
    
    if (fileData.type === "txt") {
        modalText.innerText = fileData.content; modalOverlay.style.display = "none";
        modalText.style.webkitMaskImage = "none";
    } else {
        modalText.innerText = fileData.preview; modalOverlay.style.display = "flex";
        modalText.style.webkitMaskImage = "linear-gradient(to bottom, black 30%, transparent 90%)";
    }
}

modalClose.onclick = () => { playKeystroke(); fileModal.style.display = "none"; };

// ==========================================
// CRACKER MINIGAME
// ==========================================
let crackerInterval;
let crackTime = 15.00;
let targetPin = "";
let currentHash = "";
let isCrackingActive = false;

downloadBtn.onclick = () => {
    playKeystroke();
    pushIDSLog(`[WARN] DOWNLOAD ATTEMPT INTERCEPTED`, 'critical');
    
    if (currentFile.restricted) {
        fileModal.style.display = "none";
        startCrackerGame();
    } else {
        const link = document.createElement('a');
        link.href = currentFile.fileURL; link.download = currentFile.fileURL;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
};

function startCrackerGame() {
    crackerModal.style.display = "flex";
    crackTime = 15.00; 
    isCrackingActive = false; 
    targetPin = randomHex(4).toUpperCase();
    targetPinEl.innerText = targetPin;
    
    hashStreamEl.innerText = "INITIALIZING...";
    hashStreamEl.style.color = "var(--yellow)";
    timerValEl.innerText = "WAIT";

    setTimeout(() => {
        hashStreamEl.style.color = "var(--dim)";
        isCrackingActive = true; 
        window.addEventListener('keydown', handleCrackAttempt);

        crackerInterval = setInterval(() => {
            crackTime -= 0.40; 
            timerValEl.innerText = crackTime.toFixed(2);
            
            // --- THE FIX: LOADED DICE ---
            // 30% chance to force the correct matching prefix to spawn
            if (Math.random() < 0.30) {
                currentHash = targetPin.substring(0, 2) + randomHex(2).toUpperCase();
            } else {
                currentHash = randomHex(4).toUpperCase();
            }
            
            hashStreamEl.innerText = currentHash;

            if (crackTime <= 0) {
                clearInterval(crackerInterval);
                window.removeEventListener('keydown', handleCrackAttempt);
                crackerModal.style.display = "none";
                
                pushIDSLog(`[CRITICAL] BRUTE FORCE FAILED. TRACING ORIGIN.`, 'critical');
                triggerGlitch();
            }
        }, 400); 
        
    }, 3000); 
}

function handleCrackAttempt(e) {
    if (e.code === 'Space' && crackerModal.style.display === "flex" && isCrackingActive) {
        e.preventDefault(); 
        playKeystroke();
        
        if (currentHash.substring(0, 2) === targetPin.substring(0, 2)) {
            clearInterval(crackerInterval);
            window.removeEventListener('keydown', handleCrackAttempt);
            
            hashStreamEl.innerText = targetPin;
            hashStreamEl.style.color = "var(--green)";
            pushIDSLog(`[INFO] ENCRYPTION BYPASSED. PAYLOAD EXTRACTED.`, 'info');
            
            setTimeout(() => {
                crackerModal.style.display = "none";
                hashStreamEl.style.color = "var(--dim)";
                
                const link = document.createElement('a');
                link.href = currentFile.fileURL; link.download = currentFile.fileURL;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            }, 1500);
            
        } else {
            crackTime -= 2.0; 
            triggerGlitch();
            pushIDSLog(`[WARN] HASH COLLISION FAILED. TIME PENALTY APPLIED.`, 'alert');
        }
    }
}