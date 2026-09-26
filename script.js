const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gunSelect = document.getElementById('gun-select');

let isMachineGunFiring = false;
let machineGunInterval = null;

function playSound(keyCode, gunType) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const time = audioCtx.currentTime;
    const pitchVariation = (keyCode % 50) / 100 + 0.6; // 0.6 to 1.1

    if (gunType === 'shotgun') {
        // Shotgun sound
        const bufferSize = audioCtx.sampleRate * 0.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(4000 * pitchVariation, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, time + 0.2);
        
        const noiseEnv = audioCtx.createGain();
        noiseEnv.gain.setValueAtTime(1, time);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        noise.connect(noiseFilter).connect(noiseEnv).connect(audioCtx.destination);
        
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.15);
        
        const oscEnv = audioCtx.createGain();
        oscEnv.gain.setValueAtTime(1.5, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        
        osc.connect(oscEnv).connect(audioCtx.destination);
        
        noise.start(time); osc.start(time);
        noise.stop(time + 0.5); osc.stop(time + 0.5);
        
        createVisualFlash('rgba(255,200,0,0.8)');
        screenFlash('rgba(255,0,0,0.4)');
        shakeScreen(10);
        createBloodStain();
        
    } else if (gunType === 'pistol') {
        // Pistol sound
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
        
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(1, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.connect(env).connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.2);
        
        createVisualFlash('rgba(255,255,200,0.8)');
        screenFlash('rgba(255,255,255,0.2)');
        shakeScreen(5);
        if(Math.random() > 0.5) createBloodStain();

    } else if (gunType === 'machinegun') {
        // Machine Gun single shot
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
        
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(0.8, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        osc.connect(env).connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
        
        createVisualFlash('rgba(255,150,0,0.8)');
        shakeScreen(3);
        if(Math.random() > 0.7) createBloodStain();

    } else if (gunType === 'laser') {
        // Laser Blaster
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.2);
        
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(1, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc.connect(env).connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.3);
        
        createVisualFlash('rgba(0,255,255,0.8)');
        screenFlash('rgba(0,255,255,0.3)');
    }
}

function createVisualFlash(color) {
    const visualizer = document.getElementById('visualizer');
    const flash = document.createElement('div');
    flash.classList.add('flash');
    flash.style.background = `radial-gradient(circle, rgba(255,255,255,1) 0%, ${color} 20%, rgba(255,0,0,0) 70%)`;
    
    const x = 50 + (Math.random() * 40 - 20);
    const y = 50 + (Math.random() * 40 - 20);
    flash.style.left = `${x}%`;
    flash.style.top = `${y}%`;
    
    const size = Math.random() * 200 + 150;
    flash.style.width = `${size}px`;
    flash.style.height = `${size}px`;
    
    visualizer.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

function screenFlash(color) {
    const flashEl = document.getElementById('screen-flash');
    flashEl.style.transition = 'none';
    flashEl.style.backgroundColor = color;
    
    setTimeout(() => {
        flashEl.style.transition = 'background-color 0.1s ease-out';
        flashEl.style.backgroundColor = 'transparent';
    }, 20);
}

function shakeScreen(amount) {
    const container = document.querySelector('.container');
    const x = Math.random() * amount * 2 - amount;
    const y = Math.random() * amount * 2 - amount;
    container.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(() => {
        container.style.transform = 'translate(0, 0)';
    }, 50);
}

function createBloodStain() {
    const stain = document.createElement('div');
    stain.classList.add('blood-stain');
    
    const size = Math.random() * 80 + 30;
    stain.style.width = `${size}px`;
    stain.style.height = `${size}px`;
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    stain.style.left = `${x}vw`;
    stain.style.top = `${y}vh`;
    
    // Random rotation for variety
    const rot = Math.random() * 360;
    stain.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scaleY(${Math.random()*0.5 + 0.8})`;

    document.body.appendChild(stain);
    
    setTimeout(() => stain.remove(), 10000);
}

document.addEventListener('keydown', (e) => {
    if (e.repeat && gunSelect.value !== 'machinegun') return;
    
    // For machine gun, e.repeat handles rapid fire automatically
    playSound(e.keyCode, gunSelect.value);
});
