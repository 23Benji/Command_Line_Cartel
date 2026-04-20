// DOM Elements
const outputDiv = document.getElementById('output');
const gameContainer = document.getElementById('game-container');
const vaultContent = document.getElementById('vault-content');
const stream = document.getElementById('network-stream');
const traceFill = document.getElementById('trace-bar-fill');
const gameMsg = document.getElementById('game-msg');

// Boot Sequence Text
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

// Minigame Variables
let gameActive = false;
let traceLevel = 0;
let packetSpawner;

// Utilities
function randomHex(length) {
    let result = '';
    const characters = '0123456789ABCDEF';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return '0x' + result;
}

function randomIP() {
    return `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Core Game Logic
function spawnPacket() {
    if (!gameActive) return;

    const p = document.createElement('div');
    p.className = 'packet';

    // Position and speed
    const topPos = Math.floor(Math.random() * 170);
    p.style.top = topPos + 'px';
    const duration = Math.random() * 3 + 3;
    p.style.animationDuration = duration + 's';

    // Target Logic (10% chance)
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

    // Interaction
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
            traceLevel += 34; // 3 strikes you're out
            updateTrace();
        }
    };

    stream.appendChild(p);

    setTimeout(() => {
        if (p.parentNode) p.remove();
    }, duration * 1000);

    const nextSpawn = Math.random() * 600 + 200;
    packetSpawner = setTimeout(spawnPacket, nextSpawn);
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

    document.querySelectorAll('.packet').forEach(p => {
        p.style.animationPlayState = 'paused';
    });

    gameMsg.innerHTML = "<span class='green-bright blink'>ROOT TOKEN ACQUIRED. DECRYPTING...</span>";

    setTimeout(() => {
        gameContainer.style.display = 'none';
        vaultContent.style.display = 'block';
        const screen = document.getElementById('screen');
        screen.scrollTop = screen.scrollHeight;
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

// Start sequence on page load
window.onload = () => {
    setTimeout(printBoot, 500);
};