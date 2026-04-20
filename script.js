// ==========================================
// 0. SUAVE PARTICLE NETWORK BACKGROUND
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const numberOfParticles = (canvas.width * canvas.height) / 15000; // Density

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Super slow, suave movement
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
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connectParticles();
}

// Draw lines between close particles
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

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

initParticles();
animateParticles();

// ==========================================
// DOM Elements
// ==========================================
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
// 1. BOOT SEQUENCE
// ==========================================
const bootSequence = [
    "Initializing secure connection... <span style='color:#00ff41'>[OK]</span>",
    "Bypassing perimeter firewalls... <span style='color:#00ff41'>[OK]</span>",
    "Mounting encrypted volume... <span style='color:#ff003c'>[LOCKED]</span>",
    " ",
    "<span class='alert'>!!! ENCRYPTION KEY REQUIRED !!!</span>",
    "To prevent automated scrapers, a manual override is required.",
    "Tapping into local subnet architecture..."
];

let lineIdx = 0;

function printBoot() {
    if (lineIdx < bootSequence.length) {
        const line = document.createElement('div');
        line.className = 'text-line';
        line.innerHTML = bootSequence[lineIdx];
        outputDiv.appendChild(line);
        lineIdx++;
        setTimeout(printBoot, Math.random() * 200 + 100);
    } else {
        setTimeout(initGame, 800);
    }
}

// ==========================================
// 2. MINIGAME LOGIC
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

function randomIP() {
    return `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function spawnPacket() {
    if (!gameActive) return;

    const p = document.createElement('div');
    p.className = 'packet';
    p.style.top = Math.floor(Math.random() * 170) + 'px';
    const duration = Math.random() * 3 + 3;
    p.style.animationDuration = duration + 's';

    const isTarget = Math.random() < 0.10;
    const src = randomIP();
    const dst = randomIP();

    if (isTarget) {
        p.innerHTML = `[TCP] ${src}:443 -> ${dst}:22 <span class="data-segment">PAYLOAD: 0xROOT</span>`;
        p.dataset.target = "true";
    } else {
        const fakePayload = Math.random() < 0.5 ? randomHex(4) : "ENCRYPTED";
        const port = Math.random() < 0.5 ? "80" : "8080";
        p.innerHTML = `[UDP] ${src}:${port} -> ${dst}:53 <span class="data-segment">PAYLOAD: ${fakePayload}</span>`;
        p.dataset.target = "false";
    }

    p.onmousedown = function() {
        if (!gameActive) return;
        if (this.dataset.target === "true") {
            winGame();
            this.style.background = "#00ff41";
            this.style.color = "#000";
        } else {
            this.style.background = "#ff003c";
            this.style.color = "#fff";
            this.style.borderLeftColor = "#fff";
            traceLevel += 34; 
            updateTrace();
        }
    };

    stream.appendChild(p);
    setTimeout(() => { if (p.parentNode) p.remove(); }, duration * 1000);
    packetSpawner = setTimeout(spawnPacket, Math.random() * 600 + 200);
}

function updateTrace() {
    if (traceLevel > 100) traceLevel = 100;
    traceFill.style.width = traceLevel + '%';
    if (traceLevel >= 100) {
        loseGame();
    } else {
        gameMsg.innerHTML = "<span class='alert'>INVALID PACKET. TRACE INCREASED.</span>";
        setTimeout(() => { if(gameActive) gameMsg.innerHTML = ""; }, 1500);
    }
}

function winGame() {
    gameActive = false;
    clearTimeout(packetSpawner);
    document.querySelectorAll('.packet').forEach(p => p.style.animationPlayState = 'paused');
    gameMsg.innerHTML = "<span class='green-bright blink'>ROOT TOKEN ACQUIRED. DECRYPTING...</span>";
    
    setTimeout(() => {
        gameContainer.style.display = 'none';
        outputDiv.innerHTML = ""; // Clear boot text
        initVaultCLI();
    }, 2000);
}

function loseGame() {
    gameActive = false;
    clearTimeout(packetSpawner);
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

function initGame() {
    gameContainer.style.display = 'block';
    gameActive = true;
    spawnPacket();
}

window.onload = () => { setTimeout(printBoot, 500); };


// ==========================================
// 3. INTERACTIVE CLI VAULT
// ==========================================

// Virtual Filesystem
const fs = {
    "~": {
        "payloads": { type: "dir" },
        "network_tools": { type: "dir" },
        "crypto": { type: "dir" }
    },
    "~/payloads": {
        "payload_anatomy.pdf": { type: "file", fileURL: "Payload_Anatomy.pdf" },
        "readme.txt": { type: "txt", content: "Deep dive into the structure of harmless payloads and execution flow inside isolated sandboxes." }
    },
    "~/network_tools": {
        "sniffing_pcap.zip": { type: "file", fileURL: "Network_Sniffing.zip" },
        "readme.txt": { type: "txt", content: "Collection of educational PCAP files and tutorials for analyzing packet structures using Wireshark." }
    },
    "~/crypto": {
        "crypto_theory.md": { type: "file", fileURL: "Crypto_Theory.md" },
        "readme.txt": { type: "txt", content: "Understanding the mathematics and mechanics behind modern encryption algorithms." }
    }
};

const systemCommands = ["help", "clear", "ls", "cd", "cat", "get", "download"];
let currentDir = "~";

// History tracking variables
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

function updatePrompt() {
    vaultPrompt.innerHTML = `root@kali:${currentDir}$`;
}

function printToTerminal(htmlString) {
    const div = document.createElement('div');
    div.className = 'text-line';
    div.innerHTML = htmlString;
    vaultHistory.appendChild(div);
    screenWindow.scrollTop = screenWindow.scrollHeight; 
}

document.getElementById('main-window').addEventListener('click', () => {
    if (vaultContent.style.display === 'block') {
        terminalInput.focus();
    }
});

// Advanced Keydown Logic (Enter, Up, Down, Tab)
terminalInput.addEventListener('keydown', function(e) {
    const inputVal = terminalInput.value;

    // --- TAB AUTOCOMPLETE ---
    if (e.key === 'Tab') {
        e.preventDefault(); 
        const parts = inputVal.split(" ");
        
        if (parts.length === 1) {
            const matches = systemCommands.filter(c => c.startsWith(parts[0].toLowerCase()));
            if (matches.length === 1) terminalInput.value = matches[0] + " ";
        } 
        else if (parts.length === 2) {
            const dirContents = Object.keys(fs[currentDir] || {});
            const matches = dirContents.filter(f => f.startsWith(parts[1].toLowerCase()));
            if (matches.length === 1) terminalInput.value = parts[0] + " " + matches[0];
        }
        return;
    }

    // --- COMMAND HISTORY (UP) ---
    if (e.key === 'ArrowUp') {
        e.preventDefault(); 
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
        return;
    }

    // --- COMMAND HISTORY (DOWN) ---
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = ""; 
        }
        return;
    }

    // --- EXECUTE COMMAND (ENTER) ---
    if (e.key === 'Enter') {
        const cleanInput = inputVal.trim();
        terminalInput.value = ""; 
        
        if (cleanInput === "") return;

        if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cleanInput) {
            commandHistory.push(cleanInput);
        }
        historyIndex = commandHistory.length; 

        printToTerminal(`<div><span class='green-bright'>root@kali:${currentDir}$</span> ${cleanInput}</div>`);
        
        const parts = cleanInput.split(" ");
        const cmd = parts[0].toLowerCase();
        const arg = parts[1] ? parts[1].toLowerCase() : null;

        handleCommand(cmd, arg);
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
            
        case "clear":
            vaultHistory.innerHTML = "";
            break;

        case "ls":
            const contents = fs[currentDir];
            let output = "";
            for (let item in contents) {
                if (contents[item].type === "dir") {
                    output += `<span class='dir-name'>${item}/</span>    `;
                } else {
                    output += `<span class='dim'>${item}</span>    `;
                }
            }
            printToTerminal(output);
            break;

        case "cd":
            if (!arg) {
                printToTerminal("cd: missing directory name");
                break;
            }
            if (arg === "..") {
                if (currentDir !== "~") {
                    currentDir = "~";
                    updatePrompt();
                }
            } else {
                const targetDir = currentDir === "~" ? `~/${arg}` : `${currentDir}/${arg}`;
                if (fs[currentDir] && fs[currentDir][arg] && fs[currentDir][arg].type === "dir") {
                    currentDir = targetDir;
                    updatePrompt();
                } else {
                    printToTerminal(`cd: ${arg}: No such directory`);
                }
            }
            break;

        case "cat":
            if (!arg) {
                printToTerminal("cat: missing file name");
                break;
            }
            const fileToCat = fs[currentDir][arg];
            if (!fileToCat) {
                printToTerminal(`cat: ${arg}: No such file`);
            } else if (fileToCat.type === "txt") {
                printToTerminal(`<span class='dim'>${fileToCat.content}</span>`);
            } else {
                printToTerminal(`cat: ${arg}: Cannot read binary/compressed file. Use 'get' to download.`);
            }
            break;

        case "get":
        case "download":
            if (!arg) {
                printToTerminal(`${cmd}: missing file name`);
                break;
            }
            const fileToDl = fs[currentDir][arg];
            if (!fileToDl) {
                printToTerminal(`${cmd}: ${arg}: No such file`);
            } else if (fileToDl.type === "file") {
                printToTerminal(`Initiating secure transfer of <span class='alert'>${arg}</span>...`);
                
                const link = document.createElement('a');
                link.href = fileToDl.fileURL;
                link.download = fileToDl.fileURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => printToTerminal(`Transfer complete.`), 800);
            } else if (fileToDl.type === "txt") {
                printToTerminal(`${cmd}: ${arg} is a plain text file. Just use 'cat' to read it.`);
            } else {
                printToTerminal(`${cmd}: ${arg}: Is a directory`);
            }
            break;

        default:
            printToTerminal(`${cmd}: command not found. Type 'help' for available commands.`);
    }
}