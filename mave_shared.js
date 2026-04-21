// ==========================================
// mave_shared.js - Global Systems & Registry
// ==========================================

const MASTER_ACHIEVEMENTS = {
    // Hardware
    first_blood: { category: "hardware", title: "Assembly Required", tip: "Place a component on the board.", desc: "The Motherboard relies on modular components like CPUs and GPUs to function.", rewardCoins: 50, rewardXP: 50 },
    demolition: { category: "hardware", title: "Deconstructor", tip: "Remove a component or wire.", desc: "Removing components breaks the electrical pathway, causing system halts.", rewardCoins: 50, rewardXP: 50 },
    no_cpu: { category: "hardware", title: "Does Not Compute", tip: "You removed the CPU, how could you?!", desc: "The CPU is the central brain. Without it, the entire OS loop halts and no math can be executed.", rewardCoins: 150, rewardXP: 150 },
    hacker: { category: "hardware", title: "Hello World", tip: "Save & Compile a Custom Visual App.", desc: "Compilers translate human-readable logic blocks into executable JavaScript for the CPU.", rewardCoins: 200, rewardXP: 150 },
    zoom_in: { category: "hardware", title: "Microscopic", tip: "Zoom deep into a micro-chip.", desc: "Chips contain thousands of logic gates and microscopic memory cells.", rewardCoins: 100, rewardXP: 100 },
    zoom_out: { category: "hardware", title: "The Big Picture", tip: "Zoom out to the full Motherboard PCB.", desc: "The Printed Circuit Board provides power delivery and data pathways.", rewardCoins: 100, rewardXP: 100 },
    deep_dive: { category: "hardware", title: "Knowledge is Power", tip: "Double-click a component to read its blueprint.", desc: "Understanding the bottleneck between VRAM and CPU Cache is vital for system optimization.", rewardCoins: 150, rewardXP: 100 },

    // test, may remove or change
    first_convert: { category: "data", title: "Base Jumper", tip: "Convert a number to Base 16.", desc: "Hexadecimal optimizes binary readability.", rewardCoins: 25, rewardXP: 25 }
};


const MaveDB = {
    getClaimed: () => {
        try {
            const data = JSON.parse(localStorage.getItem('mave_global_claimed'));
            if (data && typeof data === 'object' && !Array.isArray(data)) return data;
            return {};
        } catch { return {}; }
    },
    isUnlocked: (id) => !!MaveDB.getClaimed()[id]
};

let toastQueue = [];
let isToastShowing = false;

// Call this to force an update on all widgets on the page
window.renderAchievementWidgets = function () {
    const claimed = MaveDB.getClaimed();
    document.querySelectorAll('.mave-ach-widget').forEach(widget => {
        const catFilter = widget.getAttribute('data-category');
        let html = '<div class="mave-ach-grid">';

        for (let id in MASTER_ACHIEVEMENTS) {
            const a = MASTER_ACHIEVEMENTS[id];
            if (catFilter && catFilter !== 'all' && a.category !== catFilter) continue;

            const isUnlocked = !!claimed[id];
            html += `
                <div class="mave-ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <h3 class="title">${isUnlocked ? '🏆' : '🔒'} ${a.title}</h3>
                    <p class="tip">${a.tip}</p>
                    ${isUnlocked ? `
                        <div class="desc-box">
                            <strong>Data Core:</strong> ${a.desc}<br><br>
                            <div style="display:flex; justify-content:space-between; border-top:1px solid #2ecc71; padding-top:10px; margin-top:5px; font-weight:bold;">
                                <span style="color:#f1c40f;">+${a.rewardCoins} Coins</span>
                                <span style="color:#0098ff;">+${a.rewardXP} XP</span>
                            </div>
                        </div>
                    ` : ''}
                </div>`;
        }
        widget.innerHTML = html + '</div>';
    });
};

// autoinject widget stuff
(function initMaveSystems() {
    // Inject Universal Styles (Toasts, Grid, Buttons)
    const style = document.createElement('style');
    style.innerHTML = `
        /* Toast FX */
        #fx-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9998; overflow: hidden; }
        .particle { position: absolute; border-radius: 50%; pointer-events: none; }
        #global-toast { position: fixed; top: -150px; left: 50%; transform: translateX(-50%); background: #1a1c23; border: 2px solid #2ecc71; box-shadow: 0 10px 40px rgba(0,0,0,0.9); padding: 20px 40px; border-radius: 12px; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none; }
        #global-toast.show { top: 40px; }
        #toast-title { color: #fff; font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 2px; }
        @keyframes floatText { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes shakeText { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        
        /* Widget Styles */
        .mave-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; align-items: start; font-family: system-ui, sans-serif; }
        .mave-ach-card { background: #1a1c23; border: 1px solid #333; border-radius: 8px; padding: 20px; transition: 0.3s; position: relative; display: flex; flex-direction: column; gap: 10px; cursor: default; }
        .mave-ach-card.locked { opacity: 0.6; filter: grayscale(100%); }
        .mave-ach-card.unlocked { border-color: #2ecc71; box-shadow: 0 0 20px rgba(46, 204, 113, 0.15); background: linear-gradient(145deg, #1a1c23, #152219); }
        .mave-ach-card .title { font-size: 18px; font-weight: 900; color: #fff; margin: 0; }
        .mave-ach-card .tip { font-size: 12px; color: #aaa; font-style: italic; margin: 0; }
        .mave-ach-card .desc-box { display: none; position: absolute; top: 100%; left: -1px; width: calc(100% + 2px); background: linear-gradient(145deg, #152219, #1a1c23); border: 1px solid #2ecc71; border-top: none; border-radius: 0 0 8px 8px; padding: 15px; box-sizing: border-box; box-shadow: 0 15px 25px rgba(0, 0, 0, 0.9); z-index: 20; font-size: 14px; color: #2ecc71; }
        .mave-ach-card.unlocked:hover { transform: translateY(-5px); border-radius: 8px 8px 0 0; z-index: 30; }
        .mave-ach-card.unlocked:hover .desc-box { display: block; }

        /* Shared Link Button */
        .mave-ach-link-btn { background: transparent; color: #aaa; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s; font-family: inherit; font-size: 14px; }
        .mave-ach-link-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .mave-ach-link-btn.active { background: #333; color: white; border-bottom: 2px solid #0098ff; }
    `;
    document.head.appendChild(style);

    // Inject Toast HTML
    const overlay = document.createElement('div'); overlay.id = 'fx-overlay'; document.body.appendChild(overlay);
    const toastDiv = document.createElement('div'); toastDiv.id = 'global-toast';
    toastDiv.innerHTML = `<div id="toast-title">Notification</div><div id="toast-msg"></div>`;
    document.body.appendChild(toastDiv);

    // Parse & Build Achievement Widgets on Load
    if (typeof window.renderAchievementWidgets === 'function'){
        console.log("Ach Window loaded");
    }
    else{
        console.log("Ach Window failed");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.renderAchievementWidgets);
    } else {
        window.renderAchievementWidgets();
    }
})();



window.showToast = function (title, message, isError = false, customStyle = null) {
    toastQueue.push({ title, message, isError, customStyle });
    processToastQueue();
};

function processToastQueue() {
    if (isToastShowing || toastQueue.length === 0) return;
    isToastShowing = true;

    const { title, message, isError, customStyle } = toastQueue.shift();
    const toast = document.getElementById('global-toast');
    const titleEl = document.getElementById('toast-title');
    const msgEl = document.getElementById('toast-msg');
    const fxLayer = document.getElementById('fx-overlay');

    const style = customStyle || {
        color1: `hsl(${Math.random() * 360}, 100%, 50%)`, color2: `hsl(${Math.random() * 360}, 100%, 70%)`,
        fontSize: Math.floor(Math.random() * 10 + 20) + 'px', animType: Math.random() > 0.5 ? 'floatText' : 'shakeText',
        animSpeed: (Math.random() * 0.5 + 0.5) + 's', particleType: Math.random() > 0.5 ? 'confetti' : 'explosion'
    };

    if (isError) { style.color1 = '#e74c3c'; style.color2 = '#c0392b'; style.particleType = 'none'; }

    let dynamicHtml = '';
    message.split('').forEach((char, i) => {
        if (char === ' ') { dynamicHtml += '&nbsp;'; }
        else { dynamicHtml += `<span style="display:inline-block; font-weight:900; font-size:${style.fontSize}; animation:${style.animType} ${style.animSpeed} infinite ease-in-out; animation-delay:${i * 0.05}s; background:linear-gradient(to bottom, ${style.color1}, ${style.color2}); -webkit-background-clip:text; color:transparent; filter:drop-shadow(0px 0px 8px ${style.color1});">${char}</span>`; }
    });

    msgEl.innerHTML = dynamicHtml; titleEl.innerText = title;
    toast.style.borderColor = style.color1; titleEl.style.color = '#fff';
    toast.classList.add('show');

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'running') {
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.type = isError ? 'sawtooth' : 'square'; osc.frequency.value = isError ? 150 : (Math.random() * 400 + 400);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2); osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) { }

    if (style.particleType !== 'none') {
        for (let i = 0; i < 50; i++) {
            let p = document.createElement('div'); p.className = 'particle';
            p.style.background = Math.random() > 0.5 ? style.color1 : style.color2;
            p.style.width = Math.random() * 10 + 5 + 'px'; p.style.height = p.style.width;
            if (style.particleType === 'explosion') {
                p.style.left = '50%'; p.style.top = '100px';
                let angle = Math.random() * Math.PI * 2; let force = Math.random() * 150 + 50;
                p.style.transform = `translate(${Math.cos(angle) * force}px, ${Math.sin(angle) * force}px)`;
                p.style.transition = `all ${(Math.random() * 1 + 0.5)}s cubic-bezier(0.1, 0.8, 0.3, 1)`; p.style.opacity = 1;
            } else {
                p.style.left = Math.random() * 100 + 'vw'; p.style.top = '-20px';
                p.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`;
                p.style.transition = `all ${(Math.random() * 2 + 2)}s linear`;
            }
            fxLayer.appendChild(p);
            setTimeout(() => { if (style.particleType === 'explosion') p.style.opacity = 0; }, 50);
            setTimeout(() => p.remove(), 3000);
        }
    }
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { isToastShowing = false; processToastQueue(); }, 600); }, 4000);
}