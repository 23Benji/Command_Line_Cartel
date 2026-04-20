// ==========================================
// 0. AUDIO SYNTHESIZER (Mechanical Clack)
// ==========================================
// We create an audio context. Browsers require the user to interact with the page 
// before audio can play, so the first click or keypress unlocks it.
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playKeystroke() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // A quick, low-frequency square wave sounds like a plastic key bottoming out
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);
    
    // Quick fade out
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime); // Volume (keep it low)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// ==========================================
// 1. SUAVE PARTICLE BACKGROUND
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const numberOfParticles = (canvas.width * canvas.height) / 15000; 

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.directionX = (Math.random() - 0.5) * 0.5; 
        this.directionY = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
    }
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff41';
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) particlesArray.push(new Particle());
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
    connectParticles();
}

function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
            + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = `rgba(0, 255, 65, ${opacityValue * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); });
initParticles(); animateParticles();

// ==========================================
// DOM Elements
// ==========================================
const mainWindow = document.getElementById('main-window');
const outputDiv = document.getElementById('output');
const gameContainer = document.getElementById('game-container');
const vaultContent = document.getElementById('vault-content');
const stream = document.getElementById('network-stream');
const traceFill = document.getElementById('trace-bar-fill');
const gameMsg = document.getElementById('game-msg');

const vaultHistory = document.getElementById('vault-history');
const terminalInput = document.getElementById('terminal-input');
const vaultPrompt = document.getElementById('vault-prompt');
const screenWindow = document.getElementById('screen');

// ==========================================
// 2. ADVANCED BOOT SEQUENCE
// ==========================================
const bootSequence = [
    { type: 'text', content: "Initializing secure connection... <span style='color:#00ff41'>[OK]</span>", delay: 200 },
    { type: 'text', content: "Bypassing perimeter firewalls... <span style='color:#00ff41'>[OK]</span>", delay: 300 },
    { type: 'text', content: "Mounting encrypted volume /dev/sda1...", delay: 100 },
    { type: 'progress', delay: 40 }, // This triggers the loading bar
    { type: 'text', content: "Volume mounted. Status: <span style='color:#ff003c'>[LOCKED]</span>", delay: 500 },
    { type: 'text', content: " ", delay: 100 },
    { type: 'text', content: "<span class='alert'>!!! ENCRYPTION KEY REQUIRED !!!</span>", delay: 400 },
    { type: 'text', content: "To prevent automated scrapers, a manual override is required.", delay: 800 },
    { type: 'text', content: "Tapping into local subnet architecture...", delay: 600 }
];

let lineIdx = 0;
let progressValue = 0;
let progressLineEl = null;
let totalFails = 0;
const MAX_FAILS = 2; // If they fail 2 times, the system crashes

function printBoot() {
    if (lineIdx < bootSequence.length) {
        const step = bootSequence[lineIdx];
        
        if (step.type === 'text') {
            const line = document.createElement('div');
            line.className = 'text-line';
            line.innerHTML = step.content;
            outputDiv.appendChild(line);
            lineIdx++;
            setTimeout(printBoot, step.delay + Math.random() * 100);
            
        } else if (step.type === 'progress') {
            // Create the progress bar line if it doesn't exist
            if (!progressLineEl) {
                progressLineEl = document.createElement('div');
                progressLineEl.className = 'text-line';
                outputDiv.appendChild(progressLineEl);
            }
            
            // Fill the bar
            const totalBlocks = 20;
            const filledBlocks = Math.floor((progressValue / 100) * totalBlocks);
            const emptyBlocks = totalBlocks - filledBlocks;
            const bar = `[<span class='green-bright'>${'█'.repeat(filledBlocks)}</span>${'-'.repeat(emptyBlocks)}] ${progressValue}%`;
            
            progressLineEl.innerHTML = bar;
            
            if (progressValue < 100) {
                progressValue += Math.floor(Math.random() * 15) + 5; 
                if (progressValue > 100) progressValue = 100;
                setTimeout(printBoot, step.delay); 
            } else {
                // Progress done, move to next step
                lineIdx++;
                setTimeout(printBoot, 300);
            }
        }
    } else {
        setTimeout(initGame, 800);
    }
}

// ==========================================
// 3. MINIGAME LOGIC
// ==========================================
let gameActive = false;
let traceLevel = 0;
let packetSpawner;

function randomHex(length) {
    let result = '';
    const chars = '0123456789ABCDEF';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return '0x' + result;
}

function randomIP() { return `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; }

function spawnPacket() {
    if (!gameActive) return;
    const p = document.createElement('div');
    p.className = 'packet';
    p.style.top = Math.floor(Math.random() * 170) + 'px';
    const duration = Math.random() * 3 + 3;
    p.style.animationDuration = duration + 's';

    if (Math.random() < 0.10) {
        p.innerHTML = `[TCP] ${randomIP()}:443 -> ${randomIP()}:22 <span class="data-segment">PAYLOAD: 0xROOT</span>`;
        p.dataset.target = "true";
    } else {
        const fakePayload = Math.random() < 0.5 ? randomHex(4) : "ENCRYPTED";
        const port = Math.random() < 0.5 ? "80" : "8080";
        p.innerHTML = `[UDP] ${randomIP()}:${port} -> ${randomIP()}:53 <span class="data-segment">PAYLOAD: ${fakePayload}</span>`;
        p.dataset.target = "false";
    }

    p.onmousedown = function() {
        if (!gameActive) return;
        playKeystroke(); // play click sound when clicking packet too
        if (this.dataset.target === "true") {
            winGame();
            this.style.background = "#00ff41"; this.style.color = "#000";
        } else {
            this.style.background = "#ff003c"; this.style.color = "#fff"; this.style.borderLeftColor = "#fff";
            traceLevel += 34; updateTrace();
        }
    };
    stream.appendChild(p);
    setTimeout(() => { if (p.parentNode) p.remove(); }, duration * 1000);
    packetSpawner = setTimeout(spawnPacket, Math.random() * 600 + 200);
}

function updateTrace() {
    if (traceLevel > 100) traceLevel = 100;
    traceFill.style.width = traceLevel + '%';
    if (traceLevel >= 100) loseGame();
    else {
        gameMsg.innerHTML = "<span class='alert'>INVALID PACKET. TRACE INCREASED.</span>";
        setTimeout(() => { if(gameActive) gameMsg.innerHTML = ""; }, 1500);
    }
}

function winGame() {
    gameActive = false; clearTimeout(packetSpawner);
    document.querySelectorAll('.packet').forEach(p => p.style.animationPlayState = 'paused');
    gameMsg.innerHTML = "<span class='green-bright blink'>ROOT TOKEN ACQUIRED. DECRYPTING...</span>";
    setTimeout(() => {
        gameContainer.style.display = 'none';
        outputDiv.innerHTML = ""; 
        initVaultCLI();
    }, 2000);
}

function loseGame() {
    gameActive = false;
    clearTimeout(packetSpawner);
    triggerGlitch(); 
    
    totalFails++;

    if (totalFails >= MAX_FAILS) {
        // --- THE ULTIMATE SHUTDOWN ---
        stream.innerHTML = `<div style="color:#ff003c; text-align:center; margin-top:80px; font-weight:bold; font-size:18px;" class="blink">CRITICAL SECURITY BREACH. INITIATING SELF-DESTRUCT.</div>`;
        gameMsg.innerHTML = "";
        
        setTimeout(() => {
            // 1. Try to actually close the window
            window.close();
            
            // 2. The Fake Crash (Fallback if window.close is blocked)
            // Wipe the entire body, make it black, hide the mouse cursor
            document.body.innerHTML = `
                <div style="color: #bbb; font-family: monospace; padding: 20px; line-height: 1.5;">
                    Kernel panic - not syncing: Fatal exception in interrupt<br>
                    Shutting down system eth0... [OK]<br>
                    Terminating all processes... [OK]<br>
                    <br>
                    <span class="blink">_</span>
                </div>
            `;
            document.body.style.background = "#000";
            document.body.style.cursor = "none"; 
        }, 2500);

    } else {
        // --- NORMAL LOSE SEQUENCE (RETRY) ---
        stream.innerHTML = `<div style="color:#ff003c; text-align:center; margin-top:80px; font-weight:bold; font-size:18px;" class="blink">SYSTEM TRACED. CONNECTION TERMINATED.</div>`;
        gameMsg.innerHTML = "";
        
        setTimeout(() => {
            stream.innerHTML = ""; 
            traceLevel = 0; 
            traceFill.style.width = '0%';
            gameActive = true; 
            spawnPacket();
        }, 3000);
    }
}

function initGame() { gameContainer.style.display = 'block'; gameActive = true; spawnPacket(); }
window.onload = () => { setTimeout(printBoot, 500); };

// ==========================================
// 4. INTERACTIVE CLI VAULT
// ==========================================
const fs = {
    "~": { "payloads": { type: "dir" }, "network_tools": { type: "dir" }, "crypto": { type: "dir" } },
    "~/payloads": { "payload_anatomy.pdf": { type: "file", fileURL: "Payload_Anatomy.pdf" }, "readme.txt": { type: "txt", content: "Deep dive into the structure of harmless payloads and execution flow inside isolated sandboxes." } },
    "~/network_tools": { "sniffing_pcap.zip": { type: "file", fileURL: "Network_Sniffing.zip" }, "readme.txt": { type: "txt", content: "Collection of educational PCAP files and tutorials for analyzing packet structures using Wireshark." } },
    "~/crypto": { "crypto_theory.md": { type: "file", fileURL: "Crypto_Theory.md" }, "readme.txt": { type: "txt", content: "Understanding the mathematics and mechanics behind modern encryption algorithms." } }
};

const systemCommands = ["help", "clear", "ls", "cd", "cat", "get", "download"];
let currentDir = "~";
let commandHistory = [];
let historyIndex = 0;

function initVaultCLI() {
    vaultContent.style.display = 'block';
    printToTerminal("<span class='green-bright'>> DECRYPTION COMPLETE. ROOT ACCESS GRANTED.</span>");
    printToTerminal("<span class='dim'>Type <span class='green-bright'>help</span> to see available commands.</span>");
    printToTerminal(" ");
    updatePrompt();
    terminalInput.focus();
}

function updatePrompt() { vaultPrompt.innerHTML = `root@kali:${currentDir}$`; }

function printToTerminal(htmlString) {
    const div = document.createElement('div');
    div.className = 'text-line'; div.innerHTML = htmlString;
    vaultHistory.appendChild(div);
    screenWindow.scrollTop = screenWindow.scrollHeight; 
}

function triggerGlitch() {
    mainWindow.classList.add('glitch-active');
    setTimeout(() => { mainWindow.classList.remove('glitch-active'); }, 300); // Remove after 300ms
}

document.getElementById('main-window').addEventListener('click', () => {
    if (vaultContent.style.display === 'block') terminalInput.focus();
});

terminalInput.addEventListener('keydown', function(e) {
    // Play sound on every keystroke
    if(e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
        playKeystroke(); 
    }

    const inputVal = terminalInput.value;

    if (e.key === 'Tab') {
        e.preventDefault(); 
        playKeystroke();
        const parts = inputVal.split(" ");
        if (parts.length === 1) {
            const matches = systemCommands.filter(c => c.startsWith(parts[0].toLowerCase()));
            if (matches.length === 1) terminalInput.value = matches[0] + " ";
        } else if (parts.length === 2) {
            const dirContents = Object.keys(fs[currentDir] || {});
            const matches = dirContents.filter(f => f.startsWith(parts[1].toLowerCase()));
            if (matches.length === 1) terminalInput.value = parts[0] + " " + matches[0];
        }
        return;
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault(); playKeystroke();
        if (historyIndex > 0) { historyIndex--; terminalInput.value = commandHistory[historyIndex]; }
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault(); playKeystroke();
        if (historyIndex < commandHistory.length - 1) { historyIndex++; terminalInput.value = commandHistory[historyIndex]; } 
        else if (historyIndex === commandHistory.length - 1) { historyIndex++; terminalInput.value = ""; }
        return;
    }

    if (e.key === 'Enter') {
        playKeystroke();
        const cleanInput = inputVal.trim();
        terminalInput.value = ""; 
        if (cleanInput === "") return;
        
        if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cleanInput) commandHistory.push(cleanInput);
        historyIndex = commandHistory.length; 

        printToTerminal(`<div><span class='green-bright'>root@kali:${currentDir}$</span> ${cleanInput}</div>`);
        const parts = cleanInput.split(" ");
        handleCommand(parts[0].toLowerCase(), parts[1] ? parts[1].toLowerCase() : null);
    }
});

function handleCommand(cmd, arg) {
    switch(cmd) {
        case "help":
            printToTerminal("Available commands:");
            printToTerminal("  <span class='green-bright'>ls</span>          - List directory contents");
            printToTerminal("  <span class='green-bright'>cd [dir]</span>    - Change directory (use 'cd ..' to go back)");
            printToTerminal("  <span class='green-bright'>cat [file]</span>  - Read the contents of a text file");
            printToTerminal("  <span class='green-bright'>get [file]</span>  - Download a payload/tool file to your local machine");
            printToTerminal("  <span class='green-bright'>clear</span>       - Clear the terminal screen");
            break;
        case "clear": vaultHistory.innerHTML = ""; break;
        case "ls":
            let output = "";
            for (let item in fs[currentDir]) output += fs[currentDir][item].type === "dir" ? `<span class='dir-name'>${item}/</span>    ` : `<span class='dim'>${item}</span>    `;
            printToTerminal(output); break;
        case "cd":
            if (!arg) { printToTerminal("cd: missing directory name"); break; }
            if (arg === "..") { if (currentDir !== "~") { currentDir = "~"; updatePrompt(); } } 
            else {
                const targetDir = currentDir === "~" ? `~/${arg}` : `${currentDir}/${arg}`;
                if (fs[currentDir] && fs[currentDir][arg] && fs[currentDir][arg].type === "dir") { currentDir = targetDir; updatePrompt(); } 
                else { printToTerminal(`cd: ${arg}: No such directory`); triggerGlitch(); }
            }
            break;
        case "cat":
            if (!arg) { printToTerminal("cat: missing file name"); break; }
            if (!fs[currentDir][arg]) { printToTerminal(`cat: ${arg}: No such file`); triggerGlitch(); } 
            else if (fs[currentDir][arg].type === "txt") printToTerminal(`<span class='dim'>${fs[currentDir][arg].content}</span>`);
            else { printToTerminal(`cat: ${arg}: Cannot read binary file. Use 'get'.`); triggerGlitch(); }
            break;
        case "get":
        case "download":
            if (!arg) { printToTerminal(`${cmd}: missing file name`); break; }
            if (!fs[currentDir][arg]) { printToTerminal(`${cmd}: ${arg}: No such file`); triggerGlitch(); } 
            else if (fs[currentDir][arg].type === "file") {
                printToTerminal(`Initiating secure transfer of <span class='alert'>${arg}</span>...`);
                const link = document.createElement('a'); link.href = fs[currentDir][arg].fileURL; link.download = fs[currentDir][arg].fileURL;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
                setTimeout(() => printToTerminal(`Transfer complete.`), 800);
            } 
            else if (fs[currentDir][arg].type === "txt") { printToTerminal(`${cmd}: ${arg} is a plain text file. Use 'cat'.`); triggerGlitch(); } 
            else { printToTerminal(`${cmd}: ${arg}: Is a directory`); triggerGlitch(); }
            break;
        default:
            printToTerminal(`${cmd}: command not found.`);
            triggerGlitch(); // Trigger the visual glitch on bad command
    }
}