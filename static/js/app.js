/**
 * SAVERZ - Haute Editorial Interactive Architecture
 * Web Audio Ambient Soundscapes, Elevation Matrix & Archival Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initElevationMatrix();
  initAmbientSoundscape();
  initGalleryLightbox();
  initConciergeForm();
});

/* ==========================================================================
   ELEVATION MATRIX ENGINE
   ========================================================================== */

const elevationZones = [
  {
    altitude: '۳,۲۰۰ متر',
    latin: 'Pinnacle & Alpine Crest',
    title: 'ستیغ صخره‌ای و خط‌الرأس ۳۲۰۰ متری ساورز',
    desc: 'دیواره‌های استوار آهکی با امتدادی بیش از ۳۰ کیلومتر که مرز کهن چرام و بویراحمد را تشکیل می‌دهند. این منطقه در زمستان زیر خروارها برف مدفون است و در بهار به رویشگاه اصلی نادرترین گیاهان آلپاین مانند چویل، بیلهر و لاله‌های واژگون تبدیل می‌شود.',
    climate: 'آلپاین بسیار سرد (یخچال‌های طبیعی)',
    flora: 'چویل صخره‌ای، بیلهر، لاله واژگون، آویشن دنایی',
    fauna: 'پلنگ زاگرس، کل و بز کوهی (پازن)، کبک دری، عقاب طلایی',
    coordinates: '30°48′22″N 50°49′15″E',
    waterSources: 'برف‌چال‌های دائمی و غارهای برفی',
  },
  {
    altitude: '۲,۸۰۰ متر',
    latin: 'Dasht-e Raq Plateau',
    title: 'فلات مرتفع و چشمه‌سارهای دشت راق',
    desc: 'فلاتی وسیع با وسعت ۵۰ هزار هکتار در ارتفاع ۲۸۰۰ متری. دشت راق از دیرباز کانون استقرار سیاه چادرهای عشایر اصیل لر، مراتع حاصلخیز گیاه جاشیر و سرچشمه اصلی چشمه‌های خنک سیب و چرنگی است که آبشار سهمگین تنگ‌مو را تغذیه می‌کنند.',
    climate: 'ییلاقی معتدل کوهستانی با شب‌های سرد',
    flora: 'علف جاشیر کوهی، موسیر وحشی، ریواس، کارده',
    fauna: 'خرس قهوه‌ای زاگرس، گرگ خاکستری، روباه شنی، تشی',
    coordinates: '30°46′10″N 50°52′40″E',
    waterSources: 'چشمه سیب، چشمه وهل، چشمه چرنگی',
  },
  {
    altitude: '۲,۴۰۰ متر',
    latin: 'Tasooj Springs & Cascades',
    title: 'دره چشمه‌سارها و آبشار الوان طسوج',
    desc: 'تلاقی خروشان برفاب‌های ساورز در تنگه‌های صخره‌ای عمیق طسوج. آبشار الوان با ارتفاع چشمگیر در میان دیواره‌های پوشیده از خزه و پونه‌های خودرو فرو می‌ریزد و خنکای مطبوعی در دامنه‌ها پدید می‌آورد.',
    climate: 'کوهپایه‌ای مرطوب و معتدل ییلاقی',
    flora: 'پونه کنارآبی، بن‌سرخ (لیزک)، زرشک کوهی، زالزالک وحشی',
    fauna: 'کبک چیل، شنگ رودخانه‌ای، تیهو، دلیجه',
    coordinates: '30°43′55″N 50°47′30″E',
    waterSources: 'آبشار الوان، رودخانه دائمی طسوج',
  },
  {
    altitude: '۱,۸۰۰ متر',
    latin: 'Ancient Foothills & Woodlands',
    title: 'پایکوه و بیشه‌زارهای کهنسال طسوج و سرفاریاب',
    desc: 'درختان چنار چندصدساله و جنگل‌های تنک بلوط ایرانی (دارمازو و برودار) که در پایکوه ساورز سایه افکنده‌اند. در این منطقه باغات کهنسال گردو و بقایای تاریخی عمارت هشت قاجاری گواهی بر سده‌ها همزیستی انسان با شکوه این کوهستان است.',
    climate: 'معتدل مدیترانه‌ای زاگرسی',
    flora: 'بلوط ایرانی، گردوی کهنسال، بادام کوهی (اهلوک)، ارژن',
    fauna: 'سنجاب ایرانی (سنجاب بلوط)، گراز وحشی، جغد شاخدار',
    coordinates: '30°41′18″N 50°45′05″E',
    waterSources: 'حوضه آبخیز مارون و خیرآباد',
  }
];

function initElevationMatrix() {
  const buttons = document.querySelectorAll('.matrix-nav-btn');
  const titleElem = document.getElementById('matrix-title');
  const descElem = document.getElementById('matrix-desc');
  const climateElem = document.getElementById('matrix-climate');
  const floraElem = document.getElementById('matrix-flora');
  const faunaElem = document.getElementById('matrix-fauna');
  const coordsElem = document.getElementById('matrix-coords');
  const waterElem = document.getElementById('matrix-water');
  const latinElem = document.getElementById('matrix-latin');

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const data = elevationZones[index];
      if (titleElem) titleElem.textContent = data.title;
      if (descElem) descElem.textContent = data.desc;
      if (climateElem) climateElem.textContent = data.climate;
      if (floraElem) floraElem.textContent = data.flora;
      if (faunaElem) faunaElem.textContent = data.fauna;
      if (coordsElem) coordsElem.textContent = data.coordinates;
      if (waterElem) waterElem.textContent = data.waterSources;
      if (latinElem) latinElem.textContent = data.latin;
    });
  });
}

/* ==========================================================================
   SYNTHESIZED AMBIENT MOUNTAIN SOUNDSCAPE (Web Audio API)
   Generates soothing high-altitude wind breeze & crystal water stream natively
   ========================================================================== */

let audioCtx = null;
let isAudioPlaying = false;
let noiseNode = null;
let gainNode = null;

function initAmbientSoundscape() {
  const toggleBtn = document.getElementById('audio-toggle-btn');
  const waveElem = document.getElementById('audio-wave-bars');
  const statusElem = document.getElementById('audio-status-text');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      startSoundscape();
      isAudioPlaying = true;
      if (waveElem) waveElem.classList.remove('paused');
      if (statusElem) statusElem.textContent = 'طنین کوهستان (فعال)';
    } else {
      stopSoundscape();
      isAudioPlaying = false;
      if (waveElem) waveElem.classList.add('paused');
      if (statusElem) statusElem.textContent = 'طنین کوهستان (خاموش)';
    }
  });
}

function startSoundscape() {
  if (!audioCtx) return;

  // Pink noise buffer for deep wind breeze
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
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
    b6 = white * 0.115926;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;

  // Lowpass filter for muffled high mountain wind
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, audioCtx.currentTime);

  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 2);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noiseNode.start();
}

function stopSoundscape() {
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
   GALLERY LIGHTBOX ENGINE
   ========================================================================== */

function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox-modal');
  const imgElem = document.getElementById('lightbox-img');
  const titleElem = document.getElementById('lightbox-title');
  const metaElem = document.getElementById('lightbox-meta');
  const closeBtn = document.getElementById('lightbox-close');

  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      const title = item.dataset.title;
      const meta = item.dataset.meta;

      if (imgElem) imgElem.src = src;
      if (titleElem) titleElem.textContent = title;
      if (metaElem) metaElem.textContent = meta;

      lightbox.classList.add('open');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => lightbox.classList.remove('open'));
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
}

/* ==========================================================================
   CONCIERGE & RESEARCH INQUIRY
   ========================================================================== */

function initConciergeForm() {
  const form = document.getElementById('concierge-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'در حال ارسال درخواست...';

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
        alert('درخواست شما در دبیرخانه مونوگراف ساورز ثبت شد. با شما تماس گرفته خواهد شد.');
        form.reset();
      } else {
        alert('خطا در ارسال درخواست.');
      }
    } catch (err) {
      alert('خطا در برقراری ارتباط.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
