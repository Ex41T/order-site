/* ==========================================================================
   PATRYK BOBROWSKI — app.js (enhanced)
   - Smooth scroll
   - Sticky nav (.scrolled)
   - Video:
       • HERO: click = play/pause, dblclick = fullscreen (+ .is-playing)
       • KARTY: delegacja klików – play/pause, dblclick = fullscreen
   - Portfolio slider: pętla nieskończona, centrowanie aktywnej karty,
       strzałki, kropki, swipe, wheel-snap, klawiatura (opcjonalnie)
   - Canvas particles (ulepszone tło):
       • dynamiczny dobór gęstości względem okna
       • parallax na kursorze, łączenie linii bliskich punktów
       • auto-throttle przy niskim FPS, pauza gdy karta niewidoczna
       • wsparcie prefers-reduced-motion (statyczne tło)
   - Walidacja domeny e-mail
   ========================================================================== */

(() => {
  // ---------- Polyfilly dla starszych przeglądarek ----------
  
  // Array.from polyfill
  if (!Array.from) {
    Array.from = function(arrayLike) {
      return Array.prototype.slice.call(arrayLike);
    };
  }
  
  // Object.assign polyfill
  if (!Object.assign) {
    Object.assign = function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  }
  
  // requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 1000 / 60);
    };
  }
  
  // performance.now polyfill
  if (!window.performance || !window.performance.now) {
    window.performance = window.performance || {};
    window.performance.now = function() {
      return Date.now();
    };
  }
  
  // navigator.hardwareConcurrency polyfill
  if (!navigator.hardwareConcurrency) {
    navigator.hardwareConcurrency = 4; // domyślna wartość
  }
  
  // devicePixelRatio polyfill
  if (!window.devicePixelRatio) {
    window.devicePixelRatio = 1;
  }
  // ---------- Helpers ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  // ---------- Smooth scroll ----------
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const target = id && id.length > 1 ? $(id) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // ustaw focus dla a11y
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  // ---------- Sticky nav ----------
  function initStickyNav() {
    const header = $('.nav-glass');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    // Fallback dla starszych przeglądarek bez passive
    if (window.addEventListener) {
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.attachEvent('onscroll', onScroll);
    }
  }

  // ---------- Fullscreen helper ----------
  function requestFs(el) {
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
    // Fallback dla starszych przeglądarek - po prostu nie rób nic
  }

  // ---------- HERO video ----------
  function initHeroVideo() {
    const hv = document.getElementById('hero-video');
    if (hv) {
        hv.muted = true;
        hv.autoplay = true;
        hv.loop = true;
        hv.play().catch(() => {}); // nie krzycz, jeśli blokada autoplay
    }
    const wrap  = $('.video-container-hero');
    const video = $('#hero-video');
    const btn   = wrap ? $('.play-button-modern', wrap) : null;
    if (!wrap || !video) return;

    // click w film = play/pause
    video.addEventListener('click', (e) => {
      e.stopPropagation();
      video.dataset.userActivated = '1';
      video.muted = false;
      video.controls = true;
      if (video.paused) video.play().catch(() => video.setAttribute('controls',''));
      else video.pause();
    });

    // jeśli ktoś zmieni głośność/mute z kontrolek – też zapamiętaj
    video.addEventListener('volumechange', () => {
      if (!video.muted && video.volume > 0) video.dataset.userActivated = '1';
    });

    // dblclick = fullscreen
    video.addEventListener('dblclick', () => requestFs(video));

    // opcjonalny przycisk
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) video.play().catch(() => video.setAttribute('controls',''));
        else video.pause();
      });
    }

    const updateUI = () => wrap.classList.toggle('is-playing', !video.paused);
    video.addEventListener('play',  updateUI);
    video.addEventListener('pause', updateUI);
    video.addEventListener('ended', updateUI);
    updateUI();
  }

  // ---------- YouTube Portfolio slider (zoptymalizowany) ----------
  function initPortfolioSlider() {
    const container = document.querySelector('.portfolio-slider-container');
    const slider    = container?.querySelector('.portfolio-slider');
    const track     = container?.querySelector('.portfolio-track');
    if (!container || !slider || !track) return;
  
    const prev = container.querySelector('.portfolio-arrow.left');
    const next = container.querySelector('.portfolio-arrow.right');
  
    // ORYGINAŁY
    const originals = Array.from(track.querySelectorAll('.portfolio-item'));
    const L = originals.length;
    if (!L) return;
  
    // PĘTLA - więcej klonów dla płynniejszego przejścia
    const CLONES = Math.max(3, Math.ceil(L / 2));
    const makeClone = el => { const c = el.cloneNode(true); c.dataset.clone = 'true'; return c; };
    track.querySelectorAll('.portfolio-item[data-clone="true"]').forEach(n => n.remove());
    originals.slice(-CLONES).map(makeClone).forEach(c => track.insertBefore(c, track.firstChild));
    originals.slice(0, CLONES).map(makeClone).forEach(c => track.appendChild(c));
  
    const items = Array.from(track.querySelectorAll('.portfolio-item'));
  
    let current = CLONES + Math.floor(L / 2);
    let tx = 0;
    let animating = false;
    let userInteracted = false; // 🔊 od 1. gestu pokażemy kontrolki i włączymy dźwięk
  
    const sliderCenter = () => slider.clientWidth / 2;
    const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;
    const toReal = (gi) => ((gi - CLONES) % L + L) % L;
  
    function applyAspectForActive(i) {
      // Wybór proporcji: data-aspect="16/9" | "9/16" | "4/5" ... lub klasa "landscape"
      const card = items[i];
      const arFromData  = card?.dataset.aspect || '';
      const arFromClass = card?.classList?.contains('landscape') ? '16/9' : '';
      const ratio = arFromData || arFromClass; // puste = użyj CSS domyślnego
    
      // Ustaw aspekt tylko dla AKTYWNEJ karty (reszta wraca do domyślnego z CSS)
      items.forEach((el, j) => {
        const box = el.querySelector('.portfolio-video');
        if (!box) return;
        if (j === i && ratio) box.style.aspectRatio = ratio;
        else box.style.removeProperty('aspect-ratio'); // wraca do .portfolio-video { aspect-ratio: 9/16 }
      });
    
      // (opcjonalnie) klasa na kontenerze – przydaje się w CSS na glow etc.
      container.classList.toggle('mode-16x9', ratio === '16/9');
    }
  
    function setActive(i) {
      items.forEach(el => el.classList.remove('left','active','right'));
      const li = (i - 1 + items.length) % items.length;
      const ri = (i + 1) % items.length;
      items[li]?.classList.add('left');
      items[i]?.classList.add('active');
      items[ri]?.classList.add('right');
    
      // YouTube iframe handling - odtwarzaj tylko aktywny, resztę pauzuj
      const activeContainer = items[i]?.querySelector('.youtube-container');
      if (activeContainer) {
        console.log(`Aktywuję film ${i + 1}`);
        playYouTubeVideo(activeContainer); // Ta funkcja już zatrzymuje wszystkie inne
      }
    
      // proporcje tylko dla aktywnego
      applyAspectForActive(i);
    
      // kropki
      const dots = container.querySelectorAll('.nav-dot');
      const real = toReal(i);
      dots.forEach((d, di) => {
        const on = di === real;
        d.classList.toggle('active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
  
    function recalcTranslateFor(i, animate = true) {
      const target = items[i];
      if (!target) return;
      const delta = Math.round(sliderCenter() - centerOf(target));
      tx = delta;
      if (!animate) {
        track.style.transition = 'none';
        track.style.transform  = `translate3d(${tx}px, 0, 0)`;
        void track.offsetHeight; // reflow
        track.style.transition = '';
      } else {
        track.style.transform  = `translate3d(${tx}px, 0, 0)`;
      }
    }
  
    function normalize(i) {
      if (i < CLONES) {
        // Przejście z lewej strony - idź do prawej (koniec)
        current = i + L;
        // Bez animacji - natychmiastowe przejście
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        // Przywróć animację po reflow
        requestAnimationFrame(() => {
          track.style.transition = '';
        });
        return current;
      }
      if (i >= CLONES + L) {
        // Przejście z prawej strony - idź do lewej (początek)
        current = i - L;
        // Bez animacji - natychmiastowe przejście
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        // Przywróć animację po reflow
        requestAnimationFrame(() => {
          track.style.transition = '';
        });
        return current;
      }
      return i;
    }
  
    function go(delta) {
      if (animating) return;
      animating = true;
      
      const newIndex = current + delta;
      
      // Sprawdź czy potrzebujemy normalizacji
      if (newIndex < CLONES) {
        // Przejście z lewej strony - idź do prawej (koniec)
        current = newIndex + L;
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        setActive(current);
        requestAnimationFrame(() => {
          track.style.transition = '';
          animating = false;
        });
      } else if (newIndex >= CLONES + L) {
        // Przejście z prawej strony - idź do lewej (początek)
        current = newIndex - L;
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        setActive(current);
        requestAnimationFrame(() => {
          track.style.transition = '';
          animating = false;
        });
      } else {
        // Normalne przejście z animacją
        current = newIndex;
        recalcTranslateFor(current, true);
        setActive(current);
        setTimeout(() => { animating = false; }, 50);
      }
    }
  
    // 🔊 1. gest użytkownika – odblokuj dźwięk/kontrolki
    const unlock = () => {
      if (!userInteracted) {
        userInteracted = true;
        setActive(current); // odśwież, żeby centralny dostał controls + unmute
      }
    };
    container.addEventListener('pointerdown', unlock, { once:true });
  
    // YouTube auto-play - bez kliknięć, tylko slider
  
    // dblclick w YouTube container = fullscreen
    track.addEventListener('dblclick', (e) => {
      const youtubeContainer = e.target.closest('.youtube-container');
      if (!youtubeContainer) return;
      
      const iframe = youtubeContainer.querySelector('iframe');
      if (iframe && iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    });
  
    // kropki
    container.querySelectorAll('.nav-dot').forEach((d, di) => {
      d.addEventListener('click', () => {
        if (animating) return;
        const targetIndex = CLONES + di;
        if (targetIndex === current) return; // już jesteśmy na tym slajdzie
        
        current = targetIndex;
        recalcTranslateFor(current, true);
        setActive(current);
      });
    });
  
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(+1));
  
    // drag/swipe
    let startX=0, dx=0, dragging=false;
    
    slider.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; dx = 0;
      slider.setPointerCapture(e.pointerId);
      track.style.transition = 'none';
    });
    
    slider.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = e.clientX - startX;
      
      // Direct update for maximum performance
      track.style.transform = `translate3d(${tx + dx * 0.6}px, 0, 0)`;
    });
    slider.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      if (Math.abs(dx) > 25) {
        // dx < 0 oznacza przeciągnięcie w lewo = następny slajd
        // dx > 0 oznacza przeciągnięcie w prawo = poprzedni slajd
        go(dx < 0 ? 1 : -1);
      } else {
        recalcTranslateFor(current, true);
      }
    });
  
    // wheel snap
    let scrollTimer=null;
    slider.addEventListener('wheel', (e) => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const centerX = sliderCenter();
        let bestI=current, bestD=Infinity;
        items.forEach((el, i) => {
          const cx = centerOf(el) + tx;
          const d  = Math.abs(cx - centerX);
          if (d < bestD) { bestD = d; bestI = i; }
        });
        
        // Sprawdź czy potrzebujemy normalizacji
        if (bestI < CLONES) {
          bestI = bestI + L;
        } else if (bestI >= CLONES + L) {
          bestI = bestI - L;
        }
        
        current = bestI;
        recalcTranslateFor(current, true);
        setActive(current);
      }, 60);
    }, { passive:true });
  
    // start
    requestAnimationFrame(() => {
      recalcTranslateFor(current, false);
      setActive(current);
    });
  
    // recenter po resize
    let rT=null;
    window.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(() => {
        current = normalize(current);
        recalcTranslateFor(current, false);
        setActive(current);
      }, 120);
    });
  
    // --- „kop” po pełnym ułożeniu layoutu, żeby nie trzeba było scrollować ---
    function fixLayout() {
      current = normalize(current);
      recalcTranslateFor(current, false);
      setActive(current);
    }
  
    // Po pełnym load
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(fixLayout);
      });
    });
  
    // Gdy czcionki się dociągną
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fixLayout);
    }
  
    // Gdy metadane wideo (prawdziwe proporcje)
    items.forEach(it => {
      const v = it.querySelector('video');
      if (v) v.addEventListener('loadedmetadata', fixLayout, { once:true });
    });
  
    // Dodatkowy fallback
    requestAnimationFrame(() => requestAnimationFrame(fixLayout));
    setTimeout(fixLayout, 350);
  }

  // ---------- Canvas particles (ULEPSZONE TŁO) - ZAKOMENTOWANE DLA OPTYMALIZACJI ----------
  /*
  function initParticles() {
    // jeśli ktoś nie chce animacji
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // wykryj słabsze urządzenia
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let canvas = $('#particle-canvas');

    // dodaj, jeśli nie ma
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'particle-canvas';
      canvas.className = 'particles-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    let DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;

    function resize() {
      W = innerWidth; H = innerHeight;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // rysujemy w CSS px
      // przeliczenie gęstości po resize
      baseCount = calcCount();
      tunePopulation();
    }
    const calcCount = () => {
      const base = clamp(Math.round((W * H) / 25000), 25, 80);
      return isLowEnd ? Math.floor(base * 0.6) : base; // 40% mniej na słabszych urządzeniach
    };

    // elementy
    let particles = [];
    let linksDist = 140;  // bazowy dystans łączenia (zwiększony dla mniejszej liczby linii)
    let baseCount = calcCount();

    // pointer parallax / repel
    const pointer = { x: W / 2, y: H / 2, active: false };
    const pointerStrength = 0.08; // siła „przyciąg/odpych”
    const parallax = { x: 0, y: 0, k: 0.06 };

    window.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    });
    window.addEventListener('pointerleave', () => pointer.active = false);

    function makeParticle() {
      const speed = 0.25 + Math.random() * 0.6; // px/frame @60fps
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1 + Math.random() * 1.8,
        hue: 190 + Math.random() * 40, // morsko-cyjanowe
        alpha: 0.45 + Math.random() * 0.3
      };
    }

    function tunePopulation() {
      // dostosuj liczbę cząsteczek do baseCount
      if (particles.length < baseCount) {
        while (particles.length < baseCount) particles.push(makeParticle());
      } else if (particles.length > baseCount) {
        particles.length = baseCount;
      }
      // dostosuj dystans łączenia
      linksDist = clamp(Math.sqrt(W * H) / 8, 100, 180);
    }

    resize();
    window.addEventListener('resize', () => { resize(); });

    if (prefersReduce || isLowEnd) {
      // statyczne tło: narysuj delikatne orby i zakończ
      tunePopulation();
      drawStaticBackground(ctx, W, H, particles);
      return;
    }

    // FPS monitor: redukuj gęstość przy niskim FPS
    let last = performance.now();
    let fpsEMA = 60; // wykładnicza średnia
    const fpsAlpha = 0.1;
    let frameSkip = 0; // pomijaj co drugą klatkę na słabszych urządzeniach

    // pauza przy ukrytej karcie
    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = performance.now(); loop(last); }
    });

    // główna pętla
    function loop(now) {
      if (!running) return;
      
      // pomijaj co drugą klatkę na słabszych urządzeniach
      frameSkip++;
      if (isLowEnd && frameSkip % 2 === 0) {
        requestAnimationFrame(loop);
        return;
      }
      
      const dt = Math.min(0.05, (now - last) / 1000); // max 50ms
      last = now;
      const dtScale = dt * 60; // przelicznik do prędkości @60fps

      // FPS adaptacja
      const fps = 1 / dt;
      fpsEMA = fpsEMA * (1 - fpsAlpha) + fps * fpsAlpha;
      if (fpsEMA < 45 && baseCount > 40) {
        baseCount = Math.max(40, Math.round(baseCount * 0.92));
        tunePopulation();
      } else if (fpsEMA > 57 && baseCount < calcCount()) {
        baseCount = Math.min(calcCount(), baseCount + 2);
        tunePopulation();
      }

      // półprzezroczyste czyszczenie (lekki „motion trail”)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.08)'; // tło: bardzo ciemny granat
      ctx.fillRect(0, 0, W, H);

      // tło: powolne „orby” (radialne gradienty)
      drawDriftingOrbs(ctx, W, H, now / 1000);

      // parallax easing
      const targetPX = (pointer.x - W / 2) * 0.02;
      const targetPY = (pointer.y - H / 2) * 0.02;
      parallax.x += (targetPX - parallax.x) * parallax.k;
      parallax.y += (targetPY - parallax.y) * parallax.k;

      // update & draw particles
      // najpierw rysujemy linie łączeń, potem punkty
      // 1) linie
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = (a.x - b.x);
          const dy = (a.y - b.y);
          const d2 = dx*dx + dy*dy;
          if (d2 < linksDist * linksDist) {
            const d = Math.sqrt(d2);
            const t = 1 - d / linksDist; // im bliżej, tym mocniej
            ctx.strokeStyle = `rgba(0, 200, 255, ${0.08 + t * 0.12})`;
            ctx.beginPath();
            ctx.moveTo(a.x + parallax.x, a.y + parallax.y);
            ctx.lineTo(b.x + parallax.x, b.y + parallax.y);
            ctx.stroke();
          }
        }
      }

      // 2) punkty
      for (const p of particles) {
        // wpływ kursora (delikatny repel)
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx*dx + dy*dy;
          const influenceR = 150;
          if (d2 < influenceR * influenceR) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / influenceR) * pointerStrength; // siła maleje z odległością
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // aktualizacja pozycji
        p.x += p.vx * dtScale;
        p.y += p.vy * dtScale;

        // odbicia od krawędzi (miękkie)
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // lekkie „migotanie”
        p.alpha += (Math.random() - 0.5) * 0.02;
        p.alpha = clamp(p.alpha, 0.25, 0.7);

        // rysowanie cząsteczki z radialnym gradientem
        const r = p.r * (1 + (p.alpha - 0.25) * 0.6);
        const gx = p.x + parallax.x;
        const gy = p.y + parallax.y;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 6);
        g.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${p.alpha})`);
        g.addColorStop(1, `hsla(${p.hue}, 95%, 65%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(gx, gy, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(loop);
    }

    // rysowanie statycznego tła (gdy prefers-reduced-motion)
    function drawStaticBackground(ctx, w, h, pool) {
      ctx.clearRect(0, 0, w, h);
      drawDriftingOrbs(ctx, w, h, 0.0);
      // kilka „zamrożonych” punktów
      for (const p of pool) {
        const r = p.r * 3;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, `hsla(${p.hue}, 90%, 70%, 0.35)`);
        g.addColorStop(1, `hsla(${p.hue}, 90%, 70%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // duże powolne gradientowe „orby” w tle
    function drawDriftingOrbs(ctx, w, h, tSec) {
      const orbs = [
        { x: w*0.2 + Math.cos(tSec*0.12)*40, y: h*0.25 + Math.sin(tSec*0.15)*30, r: Math.max(w,h)*0.28, c: 'rgba(0, 180, 255, 0.12)' },
        { x: w*0.75 + Math.cos(tSec*0.10+1)*60, y: h*0.35 + Math.sin(tSec*0.13+2)*40, r: Math.max(w,h)*0.24, c: 'rgba(0, 255, 200, 0.10)' },
        { x: w*0.6 + Math.cos(tSec*0.07+3)*55, y: h*0.75 + Math.sin(tSec*0.09+1)*35, r: Math.max(w,h)*0.30, c: 'rgba(170, 0, 255, 0.08)' }
      ];
      for (const o of orbs) {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // wstępna populacja
    tunePopulation();

    // start pętli
    last = performance.now();
    requestAnimationFrame(loop);
  }
  */


  // ---------- Obsługa formularza kontaktowego ----------
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Walidacja e-mail
    const emailInput = form.querySelector('#email');
    const allowedDomains = [
      'gmail.com','wp.pl','o2.pl','onet.pl','interia.pl','op.pl','poczta.fm',
      'proton.me','yahoo.com','icloud.com','hotmail.com','outlook.com','live.com'
    ];

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        const value = emailInput.value.trim();
        const domain = value.split('@')[1];
        if (domain && !allowedDomains.includes(domain)) {
          emailInput.setCustomValidity('Podaj e-mail z dozwolonej domeny.');
          emailInput.style.border = '1px solid #ff4444';
        } else {
          emailInput.setCustomValidity('');
          emailInput.style.border = '';
        }
      });
    }

    // Obsługa wysyłania formularza
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Sprawdź czy wszystkie pola są wypełnione
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.border = '1px solid #ff4444';
          isValid = false;
        } else {
          field.style.border = '';
        }
      });

      if (!isValid) {
        showFormMessage('Wypełnij wszystkie wymagane pola.', 'error');
        return;
      }

      // Zmień stan przycisku
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Wysyłanie...';
      
      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          showFormMessage('Wiadomość została wysłana! Odpowiem wkrótce.', 'success');
          form.reset();
        } else {
          throw new Error('Błąd wysyłania');
        }
      } catch (error) {
        showFormMessage('Wystąpił błąd. Spróbuj ponownie lub napisz bezpośrednio na e-mail.', 'error');
      } finally {
        // Przywróć przycisk
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });

    // Funkcja do pokazywania komunikatów
    function showFormMessage(message, type) {
      // Usuń poprzednie komunikaty
      const existingMsg = form.querySelector('.form-message');
      if (existingMsg) existingMsg.remove();

      // Stwórz nowy komunikat
      const messageEl = document.createElement('div');
      messageEl.className = `form-message ${type}`;
      messageEl.textContent = message;
      messageEl.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 16px;
        font-size: 14px;
        text-align: center;
        ${type === 'success' 
          ? 'background: rgba(0, 255, 0, 0.1); border: 1px solid rgba(0, 255, 0, 0.3); color: #00ff00;'
          : 'background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); color: #ff4444;'
        }
      `;
      
      form.appendChild(messageEl);
      
      // Usuń komunikat po 5 sekundach
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 5000);
    }
  }

  function initMobileNav() {
    const mobile = document.querySelector('.nav__mobile');
    if (!mobile || mobile.dataset.initialized) return; // idempotencja
    mobile.dataset.initialized = 'true';

    const panel    = mobile.querySelector('.nav__panel');
    const overlay  = mobile.querySelector('.nav__overlay');
    const closeBtn = mobile.querySelector('.nav__close');
    const summary  = mobile.querySelector('.nav__toggle');
    const ANIM_MS  = 280; // dopasuj do CSS (transition .25s)

    function closeMenuAnimated() {
      if (!mobile.open || mobile.hasAttribute('data-closing')) return;
      mobile.setAttribute('data-closing', '');
      const end = () => {
        mobile.removeAttribute('data-closing');
        mobile.open = false;
        document.body.classList.remove('is-menu-open');
      };
      panel?.addEventListener('transitionend', end, { once: true });
      setTimeout(end, ANIM_MS + 80); // awaryjnie
    }

    // klasa na <body> przy otwarciu/zamknięciu
    mobile.addEventListener('toggle', () => {
      if (mobile.open && !mobile.hasAttribute('data-closing')) {
        document.body.classList.add('is-menu-open');
      } else if (!mobile.open) {
        document.body.classList.remove('is-menu-open');
      }
    });

    // klik w burger gdy otwarte -> zamknij płynnie (blokuje natywne toggle)
    summary?.addEventListener('click', (e) => {
      if (mobile.open) { e.preventDefault(); closeMenuAnimated(); }
    });

  // zamykacze
  panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenuAnimated));
  overlay?.addEventListener('click', closeMenuAnimated);
  closeBtn?.addEventListener('click', closeMenuAnimated);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenuAnimated(); });
}

  // ---------- YouTube IFrame Player API (Profesjonalna implementacja) ----------
  let youtubePlayers = new Map();
  let currentActivePlayer = null;

  // Inicjalizacja YouTube API
  function onYouTubeIframeAPIReady() {
    console.log('YouTube API załadowane');
    initializeYouTubePlayers();
  }

  // Inicjalizuj wszystkie YouTube players
  function initializeYouTubePlayers() {
    const containers = document.querySelectorAll('.youtube-container');
    containers.forEach((container, index) => {
      const iframe = container.querySelector('iframe');
      if (!iframe) return;

      const videoId = container.dataset.videoId;
      if (!videoId) return;

      // Dodaj ID do iframe dla YouTube API
      iframe.id = `youtube-player-${index}`;

      // Utwórz nowy player
      const player = new YT.Player(iframe.id, {
        playerVars: {
          autoplay: 0,        // NIE graj automatycznie
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          mute: 1,
          start: 0            // Zaczynaj od początku
        },
        events: {
          onReady: (event) => {
            console.log(`Player ${index + 1} gotowy:`, videoId);
            youtubePlayers.set(container, event.target);
            // Zatrzymaj film po załadowaniu
            event.target.pauseVideo();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              container.classList.add('playing');
            } else {
              container.classList.remove('playing');
            }
          },
          onError: (event) => {
            console.error(`Błąd YouTube player ${index + 1}:`, event.data);
          }
        }
      });
    });
  }

  // Odtwórz film
  function playYouTubeVideo(container) {
    // Najpierw zatrzymaj wszystkie inne filmy
    pauseAllVideosExcept(container);
    
    const player = youtubePlayers.get(container);
    if (player && player.playVideo) {
      player.playVideo();
      currentActivePlayer = player;
      console.log('Odtwarzam film:', container.dataset.videoId);
    }
  }

  // Zatrzymaj film
  function pauseYouTubeVideo(container) {
    const player = youtubePlayers.get(container);
    if (player && player.pauseVideo) {
      player.pauseVideo();
      console.log('Zatrzymuję film:', container.dataset.videoId);
    }
  }

  // Zatrzymaj wszystkie filmy oprócz aktywnego
  function pauseAllVideosExcept(activeContainer) {
    youtubePlayers.forEach((player, container) => {
      if (container !== activeContainer) {
        pauseYouTubeVideo(container);
      }
    });
  }


  // ---------- Viewport height fix dla iOS ----------
  function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Ustaw viewport height
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });

  // ---------- Performance detection ----------
  function isLowEndDevice() {
    // Wykryj słabsze urządzenia
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const isLowMemory = navigator.hardwareConcurrency <= 2;
    const isSlowConnection = navigator.connection && navigator.connection.effectiveType && 
                           ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType);
    
    return isMobile || isFirefox || isLowMemory || isSlowConnection;
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    const lowEnd = isLowEndDevice();
    
    // Podstawowe funkcje zawsze
    initMobileNav();
    initSmoothScroll();
    initStickyNav();
    initContactForm();

    // Funkcje wymagające więcej zasobów - tylko na lepszych urządzeniach
    if (!lowEnd) {
      initHeroVideo();
      initPortfolioSlider();
    } else {
      // Uproszczona wersja dla słabszych urządzeń
      initSimpleHero();
      initSimplePortfolio();
    }

    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  });

  // ---------- Uproszczone wersje dla słabszych urządzeń ----------
  function initSimpleHero() {
    const hv = document.getElementById('hero-video');
    if (hv) {
      hv.muted = true;
      hv.autoplay = false; // Wyłącz autoplay na słabszych urządzeniach
      hv.loop = true;
    }
  }

  function initSimplePortfolio() {
    const container = document.querySelector('.portfolio-slider-container');
    if (!container) return;
    
    const slider = container.querySelector('.portfolio-slider');
    const track = container.querySelector('.portfolio-track');
    
    if (slider && track) {
      const items = Array.from(track.querySelectorAll('.portfolio-item'));
      const dots = container.querySelectorAll('.nav-dot');
      let currentIndex = 0;
      
      // Funkcja do aktualizacji aktywnego elementu
      function updateActiveItem(index) {
        currentIndex = index;
        
        // Aktualizuj kropki
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        
        // Przewiń do aktywnego elementu
        if (items[index]) {
          items[index].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'center'
          });
        }
      }
      
      // Nawigacja kropkami
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          updateActiveItem(index);
        });
      });
      
      // Touch/Swipe support
      let startX = 0;
      let startY = 0;
      let isDragging = false;
      
      slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
      }, { passive: true });
      
      slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = Math.abs(currentX - startX);
        const deltaY = Math.abs(currentY - startY);
        
        // Sprawdź czy to poziome przeciągnięcie (nie pionowe scroll)
        if (deltaX > deltaY && deltaX > 10) {
          e.preventDefault(); // Zablokuj pionowe przewijanie
        }
      }, { passive: false });
      
      slider.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;
        const threshold = 50; // Minimalna odległość dla swipe
        
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            // Swipe w prawo - poprzedni element
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            updateActiveItem(prevIndex);
          } else {
            // Swipe w lewo - następny element
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            updateActiveItem(nextIndex);
          }
        }
      }, { passive: true });
      
      // Strzałki (jeśli są widoczne)
      const prevBtn = container.querySelector('.portfolio-arrow.left');
      const nextBtn = container.querySelector('.portfolio-arrow.right');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          updateActiveItem(prevIndex);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          updateActiveItem(nextIndex);
        });
      }
      
      // Ustaw pierwszy element jako aktywny
      updateActiveItem(0);
    }
  }

  // Fallback dla YouTube API
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
})();
