/**
 * SAVERZ - AWWWARDS 3D MATHEMATICAL TERRAIN & FBM SIMPLEX NOISE ENGINE
 * Three.js WebGL GPU Shader Displacement + Scroll Camera Choreography
 */

document.addEventListener('DOMContentLoaded', () => {
  initThreeTerrain();
  initAudioPulse();
  initModal();
  initForm();
});

/* ==========================================================================
   MATHEMATICAL FBM SIMPLEX NOISE ALGORITHM (Procedural 3D Mountain Math)
   ========================================================================== */

// Fast simplex noise implementation
const FBMNoise = (() => {
  const F3 = 1.0 / 3.0, G3 = 1.0 / 6.0;
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
  const perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = (perm[i] % 12);
  }
  const grad3 = new Float32Array([
    1,1,0, -1,1,0, 1,-1,0, -1,-1,0,
    1,0,1, -1,0,1, 1,0,-1, -1,0,-1,
    0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1
  ]);

  function noise2D(xin, yin) {
    let n0, n1, n2;
    const s = (xin + yin) * 0.5 * (Math.sqrt(3.0) - 1.0);
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * (3.0 - Math.sqrt(3.0)) / 6.0;
    const X0 = i - t, Y0 = j - t;
    const x0 = xin - X0, y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
    const x1 = x0 - i1 + (3.0 - Math.sqrt(3.0)) / 6.0, y1 = y0 - j1 + (3.0 - Math.sqrt(3.0)) / 6.0;
    const x2 = x0 - 1.0 + 2.0 * (3.0 - Math.sqrt(3.0)) / 6.0, y2 = y0 - 1.0 + 2.0 * (3.0 - Math.sqrt(3.0)) / 6.0;
    const ii = i & 255, jj = j & 255;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0; else { t0 *= t0; const gi0 = permMod12[ii + perm[jj]] * 3; n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0; else { t1 *= t1; const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3; n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0; else { t2 *= t2; const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3; n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2); }
    return 70.0 * (n0 + n1 + n2);
  }

  // 4-Octave Fractal Brownian Motion for realistic alpine ridges
  function fbm(x, y) {
    let total = 0, amplitude = 1, frequency = 1, maxVal = 0;
    for (let i = 0; i < 4; i++) {
      total += noise2D(x * frequency, y * frequency) * amplitude;
      maxVal += amplitude;
      amplitude *= 0.5;
      frequency *= 2.05;
    }
    return total / maxVal;
  }

  return { fbm, noise2D };
})();

/* ==========================================================================
   THREE.JS 3D TERRAIN SCENE & CAMERA CHOREOGRAPHY
   ========================================================================== */

function initThreeTerrain() {
  const container = document.getElementById('webgl-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0D0F0E, 0.015);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 28, 48);
  camera.lookAt(0, 0, -10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // 3D Procedural Mesh
  const width = 120, height = 120;
  const segments = 100;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  const originalZ = new Float32Array(pos.count);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Ridge math: center ridge is higher, dropping into valleys
    const distFromCenter = Math.abs(x) / (width * 0.5);
    const ridgeProfile = Math.max(0, 1 - Math.pow(distFromCenter, 1.4));
    const elevation = FBMNoise.fbm(x * 0.045, z * 0.045) * 16 * ridgeProfile;
    
    pos.setY(i, elevation);
    originalZ[i] = elevation;
  }
  geometry.computeVertexNormals();

  // Haute-Luxe Gold Wireframe Material
  const material = new THREE.MeshStandardMaterial({
    color: 0xC5A059,
    wireframe: true,
    wireframeLinewidth: 1,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x221A08,
  });

  // Solid dark underbelly mesh
  const solidMaterial = new THREE.MeshBasicMaterial({
    color: 0x0E100F,
    side: THREE.DoubleSide
  });

  const terrainMesh = new THREE.Mesh(geometry, material);
  const solidMesh = new THREE.Mesh(geometry, solidMaterial);
  solidMesh.position.y = -0.05;
  scene.add(solidMesh);
  scene.add(terrainMesh);

  // Starfield / Peak Particles
  const particleCount = 400;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 140;
    particlePositions[i + 1] = Math.random() * 35 + 5;
    particlePositions[i + 2] = (Math.random() - 0.5) * 140;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xC5A059,
    size: 0.8,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const stars = new THREE.Points(particleGeo, particleMat);
  scene.add(stars);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xEED9AA, 1.8);
  sunLight.position.set(30, 50, 20);
  scene.add(sunLight);

  const goldPointLight = new THREE.PointLight(0xC5A059, 2.5, 80);
  goldPointLight.position.set(0, 15, 0);
  scene.add(goldPointLight);

  // Mouse Interaction & Inertia
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let isDragging = false;
  let previousMouseX = 0, previousMouseY = 0;

  window.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    }
  });

  // Scroll Choreography
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
  });

  // Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle terrain breathing wave
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const u = positions.getX(i);
      const v = positions.getZ(i);
      const wave = Math.sin(u * 0.1 + elapsedTime * 0.8) * Math.cos(v * 0.1 + elapsedTime * 0.8) * 0.4;
      positions.setY(i, originalZ[i] + wave);
    }
    positions.needsUpdate = true;

    // Smooth Camera & Terrain Motion
    terrainMesh.rotation.y += (targetRotationY + mouseX * 0.1 - terrainMesh.rotation.y) * 0.05;
    terrainMesh.rotation.x += (targetRotationX + mouseY * 0.05 - terrainMesh.rotation.x) * 0.05;
    solidMesh.rotation.copy(terrainMesh.rotation);

    // Camera Flight on Scroll
    camera.position.z = 48 - scrollProgress * 30;
    camera.position.y = 28 - scrollProgress * 14;
    camera.lookAt(0, 4 - scrollProgress * 5, -10);

    stars.rotation.y = elapsedTime * 0.02;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   WEB AUDIO API MOUNTAIN WIND ACOUSTIC PULSE
   ========================================================================== */

let audioCtx = null, isAudioPlaying = false, noiseNode = null, gainNode = null;

function initAudioPulse() {
  const btn = document.getElementById('btn-audio-pulse');
  const dot = document.getElementById('hud-pulse-dot');
  const label = document.getElementById('hud-pulse-text');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (!isAudioPlaying) {
      startSound();
      isAudioPlaying = true;
      if (dot) dot.classList.remove('paused');
      if (label) label.textContent = 'صوت کوهستان (فعال)';
    } else {
      stopSound();
      isAudioPlaying = false;
      if (dot) dot.classList.add('paused');
      if (label) label.textContent = 'صوت کوهستان';
    }
  });
}

function startSound() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const out = buffer.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
    b6 = white * 0.115926;
  }
  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(260, audioCtx.currentTime);

  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 1.5);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  noiseNode.start();
}

function stopSound() {
  if (gainNode && audioCtx) {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    setTimeout(() => {
      if (noiseNode) { try { noiseNode.stop(); } catch(e){} noiseNode.disconnect(); }
    }, 400);
  }
}

/* ==========================================================================
   MODAL & FORM
   ========================================================================== */

function initModal() {
  const trigger = document.getElementById('btn-open-inquiry');
  const modal = document.getElementById('inquiry-modal');
  const closeBtn = document.getElementById('btn-close-modal');
  if (!trigger || !modal) return;

  trigger.addEventListener('click', () => modal.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
}

function initForm() {
  const form = document.getElementById('hud-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'در حال ارسال...';

    const payload = {
      name: document.getElementById('form-name').value,
      phone: document.getElementById('form-phone').value,
      subject: document.getElementById('form-subject').value,
      message: document.getElementById('form-message').value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('پیام شما در مونوگراف ساورز ثبت شد.');
        form.reset();
        document.getElementById('inquiry-modal').classList.remove('open');
      } else {
        alert('خطا در ارسال.');
      }
    } catch(err) {
      alert('خطا در برقراری ارتباط.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'ارسال پیام اختصاصی';
    }
  });
}
