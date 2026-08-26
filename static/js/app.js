/**
 * SAVERZ - SWISS ARCHITECTURAL & MATHEMATICAL PARTICLE ENGINE
 * Gravitational Vector Field Canvas + Web Audio API Topographical Synthesizer
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleField();
  initAudioPulse();
  initLightbox();
  initContactForm();
});

/* ==========================================================================
   MATHEMATICAL GRAVITATIONAL PARTICLE FIELD (HTML5 Canvas 2D)
   Simulates 250+ vector nodes interacting with cursor physics and Euclidean lines
   ========================================================================== */

function initParticleField() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 60 : 120;
  const maxDistance = 140;
  
  const mouse = {
    x: -1000,
    y: -1000,
    radius: 180,
    active: false
  };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.8 + 1;
      this.density = (Math.random() * 30) + 1;
      this.alpha = Math.random() * 0.4 + 0.3;
      this.angle = Math.random() * 360;
    }

    update() {
      // Natural organic wave drift
      this.angle += 0.01;
      this.x += this.vx + Math.sin(this.angle) * 0.2;
      this.y += this.vy + Math.cos(this.angle) * 0.2;

      // Screen boundaries wrap
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse Gravitational & Repulsive Vector Math
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = forceDirectionX * force * this.density * 0.8;
          const directionY = forceDirectionY * force * this.density * 0.8;

          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 142, 86, ${this.alpha})`;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - (dist / maxDistance)) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(184, 142, 86, ${opacity})`;
          ctx.lineWidth = 0.75;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();
}

/* ==========================================================================
   WEB AUDIO API MOUNTAIN ACOUSTIC PULSE
   ========================================================================== */

let audioCtx = null;
let isAudioPlaying = false;
let noiseNode = null;
let gainNode = null;

function initAudioPulse() {
  const btn = document.getElementById('btn-audio-pulse');
  const dot = document.getElementById('audio-pulse-dot');
  const label = document.getElementById('audio-pulse-text');

  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      startAmbientAudio();
      isAudioPlaying = true;
      if (dot) dot.classList.remove('paused');
      if (label) label.textContent = 'طنین ساورز (فعال)';
    } else {
      stopAmbientAudio();
      isAudioPlaying = false;
      if (dot) dot.classList.add('paused');
      if (label) label.textContent = 'طنین ساورز';
    }
  });
}

function startAmbientAudio() {
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
    b6 = white * 0.115926;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, audioCtx.currentTime);

  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 1.5);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noiseNode.start();
}

function stopAmbientAudio() {
  if (gainNode && audioCtx) {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (noiseNode) {
        try { noiseNode.stop(); } catch (e) {}
        noiseNode.disconnect();
      }
    }, 500);
  }
}

/* ==========================================================================
   DOCUMENTARY LIGHTBOX
   ========================================================================== */

function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const tag = document.getElementById('lightbox-tag');
  const closeBtn = document.getElementById('lightbox-close');

  if (!modal) return;

  document.querySelectorAll('.photo-frame').forEach(frame => {
    frame.addEventListener('click', () => {
      const src = frame.dataset.src;
      const t = frame.dataset.title;
      const tg = frame.dataset.tag;

      if (img) img.src = src;
      if (title) title.textContent = t;
      if (tag) tag.textContent = tg;

      modal.classList.add('open');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ==========================================================================
   CONTACT / CONCIERGE FORM
   ========================================================================== */

function initContactForm() {
  const form = document.getElementById('swiss-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'در حال ارسال پیام...';

    const payload = {
      name: document.getElementById('inquiry-name').value,
      phone: document.getElementById('inquiry-phone').value,
      subject: document.getElementById('inquiry-subject').value,
      message: document.getElementById('inquiry-message').value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert('پیام شما با موفقیت ثبت شد. سپاس از توجه شما به مونوگراف ساورز.');
        form.reset();
      } else {
        alert('خطا در ارسال پیام.');
      }
    } catch (err) {
      alert('خطا در ارسال پیام.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
