const gunPivot = document.getElementById('gun-pivot');
const damageContainer = document.getElementById('damage-container');
const scoreElement = document.getElementById('score');
const targetContainer = document.getElementById('target-container');
const targetElement = document.getElementById('target');
const gunBody = document.getElementById('gun-body');
const laserBeam = document.getElementById('laser-beam');
const scopeOverlay = document.getElementById('scope-overlay');
const bgLayer = document.getElementById('bg-layer');

let totalScore = 0;
let currentGun = 'laser';
let currentDistance = 1;
let isScoped = false;
let scopeZoom = 2; // Dynamic zoom multiplier
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let firingInterval = null;

// UI Event Listeners
document.getElementById('gun-select').addEventListener('change', (e) => {
    currentGun = e.target.value;
    gunBody.className = '';
    if (currentGun !== 'laser') gunBody.classList.add(currentGun);
});

document.getElementById('distance-select').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'close') currentDistance = 1;
    if (val === 'medium') currentDistance = 0.6;
    if (val === 'far') currentDistance = 0.3;
    updateTargetScale();
});

document.getElementById('difficulty-select').addEventListener('change', (e) => {
    const difficulty = e.target.value;
    targetContainer.classList.remove('move-normal', 'move-hard');
    if (difficulty === 'normal') targetContainer.classList.add('move-normal');
    if (difficulty === 'hard') targetContainer.classList.add('move-hard');
});

document.getElementById('target-select').addEventListener('change', (e) => {
    targetElement.className = e.target.value;
});

document.getElementById('bg-select').addEventListener('change', (e) => {
    bgLayer.className = `bg-${e.target.value}`;
});

document.getElementById('toggle-laser').addEventListener('change', (e) => {
    laserBeam.classList.toggle('active', e.target.checked);
    updateAim();
});

document.getElementById('toggle-scope').addEventListener('change', (e) => {
    isScoped = e.target.checked;
    scopeOverlay.classList.toggle('active', isScoped);
    updateTargetScale();
});

// Mouse Wheel Scope Zooming
document.addEventListener('wheel', (e) => {
    if (!isScoped) return;
    
    // Prevent page scrolling
    if(e.cancelable) e.preventDefault();
    
    if (e.deltaY < 0) {
        scopeZoom = Math.min(scopeZoom + 0.5, 5); // Zoom in, max 5x
    } else {
        scopeZoom = Math.max(scopeZoom - 0.5, 1); // Zoom out, min 1x
    }
    updateTargetScale();
}, { passive: false });

function updateTargetScale() {
    // If scoped, dynamically magnify based on scopeZoom
    const finalScale = isScoped ? currentDistance * scopeZoom : currentDistance;
    targetContainer.style.transform = `translate(-50%, -50%) scale(${finalScale})`;
}

// Aiming Logic (Desktop & Mobile)
function updateAim() {
    const pivotX = window.innerWidth / 2;
    const pivotY = window.innerHeight;
    
    const angleRad = Math.atan2(mouseY - pivotY, mouseX - pivotX);
    const finalAngle = (angleRad * (180 / Math.PI)) + 90;
    
    gunPivot.style.transform = `translateX(-50%) rotate(${finalAngle}deg)`;

    // Adjust Laser height for 3D depth perception (Z-axis pointer)
    if (laserBeam.classList.contains('active')) {
        // Distance from barrel to the mouse pointer
        const dist = Math.hypot(mouseX - pivotX, mouseY - (pivotY - 30));
        laserBeam.style.height = `${dist}px`;
    }
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateAim();
});

document.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    updateAim();
}, { passive: true });


// Firing Logic (Desktop & Mobile)
function fireHandler(e) {
    if (e.target && e.target.closest && e.target.closest('#ui-panel')) return;
    if (e.cancelable) e.preventDefault();

    if (currentGun === 'machinegun') {
        fireWeapon(); 
        if(firingInterval) clearInterval(firingInterval);
        firingInterval = setInterval(fireWeapon, 100);
    } else {
        fireWeapon();
    }
}

document.addEventListener('mousedown', fireHandler);
document.addEventListener('touchstart', fireHandler, { passive: false });

function stopFiring() {
    if (firingInterval) clearInterval(firingInterval);
}
document.addEventListener('mouseup', stopFiring);
document.addEventListener('mouseleave', stopFiring);
document.addEventListener('touchend', stopFiring);
document.addEventListener('touchcancel', stopFiring);


function fireWeapon() {
    // Visuals
    document.body.classList.add('firing');
    setTimeout(() => { document.body.classList.remove('firing'); }, 50);

    if (currentGun === 'shotgun') {
        shakeScreen(15);
        triggerVibration([100, 50, 100]); // heavy rumble
        for (let i = 0; i < 5; i++) {
            const spreadX = (Math.random() - 0.5) * 80 * currentDistance;
            const spreadY = (Math.random() - 0.5) * 80 * currentDistance;
            const hitX = mouseX + spreadX;
            const hitY = mouseY + spreadY;
            const points = calculateScore(hitX, hitY);
            createBulletHole(hitX, hitY, points > 0);
        }
    } else if (currentGun === 'machinegun') {
        shakeScreen(4);
        triggerVibration(40); // quick buzz
        const spreadX = (Math.random() - 0.5) * 30 * currentDistance;
        const spreadY = (Math.random() - 0.5) * 30 * currentDistance;
        const hitX = mouseX + spreadX;
        const hitY = mouseY + spreadY;
        const points = calculateScore(hitX, hitY);
        createBulletHole(hitX, hitY, points > 0);
    } else {
        shakeScreen(currentGun === 'laser' ? 8 : 4);
        triggerVibration(70); // solid pop
        const points = calculateScore(mouseX, mouseY);
        createBulletHole(mouseX, mouseY, points > 0);
    }
    
    playShootSound();
}

function triggerVibration(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

function calculateScore(x, y) {
    const rect = targetElement.getBoundingClientRect();
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    const dx = x - targetCenterX;
    const dy = y - targetCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let points = 0;
    
    const scaleFactor = isScoped ? currentDistance * scopeZoom : currentDistance;

    if (distance <= 15 * scaleFactor) { 
        points = 100;
    } else if (distance <= 50 * scaleFactor) { 
        points = 50;
    } else if (distance <= 100 * scaleFactor) { 
        points = 25;
    } else if (distance <= 150 * scaleFactor) { 
        points = 10;
    }

    if (points > 0) {
        totalScore += points;
        scoreElement.innerText = totalScore;
        showScorePopup(x, y, points);
    }
    return points;
}

function showScorePopup(x, y, points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerText = `+${points}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    
    if(points === 100) popup.style.color = '#fff';
    if(points === 50) popup.style.color = '#0ff';
    if(points === 25) popup.style.color = '#f0f';

    document.body.appendChild(popup);
    setTimeout(() => { popup.remove(); }, 1000);
}

function createBulletHole(x, y, hitTarget) {
    const hole = document.createElement('div');
    hole.className = `bullet-hole ${currentGun}`;
    const rot = Math.random() * 360;
    
    if (hitTarget) {
        const rect = targetElement.getBoundingClientRect();
        const targetCenterX = rect.left + rect.width / 2;
        const targetCenterY = rect.top + rect.height / 2;
        
        const dx = x - targetCenterX;
        const dy = y - targetCenterY;
        const scaleFactor = isScoped ? currentDistance * scopeZoom : currentDistance;
        
        const unscaledDx = dx / scaleFactor;
        const unscaledDy = dy / scaleFactor;
        
        hole.style.left = `${150 + unscaledDx}px`;
        hole.style.top = `${150 + unscaledDy}px`;
        hole.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
        
        targetElement.appendChild(hole);
    } else {
        hole.style.left = `${x}px`;
        hole.style.top = `${y}px`;
        hole.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
        damageContainer.appendChild(hole);
    }
}

function shakeScreen(intensity = 8) {
    const x = (Math.random() - 0.5) * intensity;
    const y = (Math.random() - 0.5) * intensity;
    document.body.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(() => { document.body.style.transform = 'translate(0, 0)'; }, 50);
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function playShootSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    if (currentGun === 'laser') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    } else if (currentGun === 'pistol') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    } else if (currentGun === 'shotgun') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(80, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    } else if (currentGun === 'machinegun') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}
