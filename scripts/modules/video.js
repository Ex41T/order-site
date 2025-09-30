/* ==========================================================================
   VIDEO MODULE
   - Hero video handling
   - Play/pause controls
   - Fullscreen support
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);

// Fullscreen helper
function requestFs(el) {
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

// Hero video init - eksport do window
window.initHeroVideo = function() {
  console.log('🎥 Inicjalizacja hero video...');
  
  const hv = document.getElementById('hero-video');
  if (hv) {
    hv.muted = true;
    hv.autoplay = true;
    hv.loop = true;
    hv.play().catch(() => {}); // Nie krzycz, jeśli blokada autoplay
  }
  
  const wrap = $('.video-container-hero');
  const video = $('#hero-video');
  const btn = wrap ? $('.play-button-modern', wrap) : null;
  
  if (!wrap || !video) {
    console.log('⚠️ Hero video nie znalezione');
    return;
  }

  // Click w film = play/pause
  video.addEventListener('click', (e) => {
    e.stopPropagation();
    video.dataset.userActivated = '1';
    video.muted = false;
    video.controls = true;
    if (video.paused) video.play().catch(() => video.setAttribute('controls',''));
    else video.pause();
  });

  // Jeśli ktoś zmieni głośność/mute z kontrolek – zapamiętaj
  video.addEventListener('volumechange', () => {
    if (!video.muted && video.volume > 0) video.dataset.userActivated = '1';
  });

  // Dblclick = fullscreen
  video.addEventListener('dblclick', () => requestFs(video));

  // Opcjonalny przycisk
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) video.play().catch(() => video.setAttribute('controls',''));
      else video.pause();
    });
  }

  const updateUI = () => wrap.classList.toggle('is-playing', !video.paused);
  video.addEventListener('play', updateUI);
  video.addEventListener('pause', updateUI);
  video.addEventListener('ended', updateUI);
  updateUI();
  
  console.log('✅ Hero video zainicjalizowane');
}

