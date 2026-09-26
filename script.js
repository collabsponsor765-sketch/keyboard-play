const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gunSelect = document.getElementById('gun-select');

// Create a master compressor to make sounds much louder without clipping too horribly
const masterCompressor = audioCtx.createDynamicsCompressor();
masterCompressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
masterCompressor.knee.setValueAtTime(10, audioCtx.currentTime);
masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
masterCompressor.release.setValueAtTime(0.25, audioCtx.currentTime);

const masterGain = audioCtx.createGain();
masterGain.gain.value = 5.0; // Pushing the volume up significantly

masterGain.connect(masterCompressor);
masterCompressor.connect(audioCtx.destination);

// Helper to create noise buffers for explosions
function createNoiseBuffer() {
    const bufferSize = audioCtx.sampleRate * 1.0; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}
const noiseBuffer = createNoiseBuffer();

function playSound(keyCode, gunType) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const time = audioCtx.currentTime;
    const pitchVariation = (keyCode % 50) / 100 + 0.6;

    if (gunType === 'shotgun') {
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(3000 * pitchVariation, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, time + 0.3);
        
        const noiseEnv = audioCtx.createGain();
        noiseEnv.gain.setValueAtTime(4, time);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        noise.connect(noiseFilter).connect(noiseEnv).connect(masterGain);
        
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.2);
        
        const oscEnv = audioCtx.createGain();
        oscEnv.gain.setValueAtTime(6, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        osc.connect(oscEnv).connect(masterGain);
        
        noise.start(time); osc.start(time);
        noise.stop(time + 0.6); osc.stop(time + 0.6);
        
        createVisualFlash('rgba(255,100,0,0.9)');
        screenFlash('rgba(255,0,0,0.5)');
        shakeScreen(15);
        createBloodStain();
        
    } else if (gunType === 'pistol') {
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(5000 * pitchVariation, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(500, time + 0.1);
        
        const noiseEnv = audioCtx.createGain();
        noiseEnv.gain.setValueAtTime(5, time);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noise.connect(noiseFilter).connect(noiseEnv).connect(masterGain);
        
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
        
        const oscEnv = audioCtx.createGain();
        oscEnv.gain.setValueAtTime(3, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.connect(oscEnv).connect(masterGain);
        
        noise.start(time); osc.start(time);
        noise.stop(time + 0.25); osc.stop(time + 0.25);
        
        createVisualFlash('rgba(255,255,200,0.8)');
        screenFlash('rgba(255,255,255,0.3)');
        shakeScreen(6);
        if(Math.random() > 0.5) createBloodStain();

    } else if (gunType === 'machinegun' || gunType === 'ak47') {
        const isAK = gunType === 'ak47';
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime((isAK ? 4000 : 3500) * pitchVariation, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, time + 0.15);
        
        const noiseEnv = audioCtx.createGain();
        noiseEnv.gain.setValueAtTime(isAK ? 6 : 4, time);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noise.connect(noiseFilter).connect(noiseEnv).connect(masterGain);

        const osc = audioCtx.createOscillator();
        osc.type = isAK ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime((isAK ? 200 : 250) * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
        
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(isAK ? 5 : 3, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.connect(env).connect(masterGain);
        
        noise.start(time); osc.start(time);
        noise.stop(time + 0.25); osc.stop(time + 0.25);
        
        createVisualFlash('rgba(255,150,0,0.8)');
        shakeScreen(isAK ? 8 : 5);
        if(Math.random() > (isAK ? 0.5 : 0.7)) createBloodStain();

    } else if (gunType === 'sniper') {
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(6000 * pitchVariation, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(50, time + 0.5);
        
        const noiseEnv = audioCtx.createGain();
        noiseEnv.gain.setValueAtTime(8, time);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        
        noise.connect(noiseFilter).connect(noiseEnv).connect(masterGain);
        
        // Deep thud
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(10, time + 0.4);
        
        const oscEnv = audioCtx.createGain();
        oscEnv.gain.setValueAtTime(10, time); // Huge bass punch
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
        
        osc.connect(oscEnv).connect(masterGain);
        
        noise.start(time); osc.start(time);
        noise.stop(time + 1.0); osc.stop(time + 1.0);
        
        createVisualFlash('rgba(255,200,50,1)');
        screenFlash('rgba(200,0,0,0.7)');
        shakeScreen(20);
        createBloodStain();
        createBloodStain(); // Double blood
        
    } else if (gunType === 'deserteagle') {
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(3000 * pitchVariation, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, time + 0.3);
        
        const noiseEnv = audioCtx.createGain();
        noiseEnv.gain.setValueAtTime(7, time);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        noise.connect(noiseFilter).connect(noiseEnv).connect(masterGain);
        
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
        
        const oscEnv = audioCtx.createGain();
        oscEnv.gain.setValueAtTime(6, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        osc.connect(oscEnv).connect(masterGain);
        
        noise.start(time); osc.start(time);
        noise.stop(time + 0.5); osc.stop(time + 0.5);
        
        createVisualFlash('rgba(255,255,150,0.9)');
        screenFlash('rgba(150,0,0,0.4)');
        shakeScreen(12);
        createBloodStain();

    } else if (gunType === 'laser') {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500 * pitchVariation, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.2);
        
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(2, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc.connect(env).connect(masterGain);
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
    
    const rot = Math.random() * 360;
    stain.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scaleY(${Math.random()*0.5 + 0.8})`;

    document.body.appendChild(stain);
    
    setTimeout(() => stain.remove(), 10000);
}

document.addEventListener('keydown', (e) => {
    const isAutoFire = gunSelect.value === 'machinegun' || gunSelect.value === 'ak47';
    if (e.repeat && !isAutoFire) return;
    
    playSound(e.keyCode, gunSelect.value);
});
