/* ==========================================================================
   PORTFOLIO MODULE
   - Portfolio slider with infinite loop
   - YouTube iframe handling
   - Touch/swipe support
   - Navigation dots
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// YouTube Players Map
let youtubePlayers = new Map();
let currentActivePlayer = null;

window.initPortfolioSlider = function() {
    console.log('đźŽ¬ Initializing FULL portfolio slider');
    const container = document.querySelector('.portfolio-slider-container');
    const slider    = container?.querySelector('.portfolio-slider');
    const track     = container?.querySelector('.portfolio-track');
    if (!container || !slider || !track) {
      console.error('âťŚ Portfolio slider elements not found');
      return;
    }
    console.log('âś… Portfolio slider elements found');
  
    const prev = container.querySelector('.portfolio-arrow.left');
    const next = container.querySelector('.portfolio-arrow.right');
  
    // ORYGINAĹY
    const originals = Array.from(track.querySelectorAll('.portfolio-item'));
    const L = originals.length;
    if (!L) return;
  
    // PÄTLA - wiÄ™cej klonĂłw dla pĹ‚ynniejszego przejĹ›cia
    const CLONES = Math.max(3, Math.ceil(L / 2));
    const makeClone = el => { const c = el.cloneNode(true); c.dataset.clone = 'true'; return c; };
    track.querySelectorAll('.portfolio-item[data-clone="true"]').forEach(n => n.remove());
    originals.slice(-CLONES).map(makeClone).forEach(c => track.insertBefore(c, track.firstChild));
    originals.slice(0, CLONES).map(makeClone).forEach(c => track.appendChild(c));
  
    const items = Array.from(track.querySelectorAll('.portfolio-item'));
  
    let current = CLONES + Math.floor(L / 2);
    let tx = 0;
    let animating = false;
    let userInteracted = false; // đź”Š od 1. gestu pokaĹĽemy kontrolki i wĹ‚Ä…czymy dĹşwiÄ™k
  
    const sliderCenter = () => slider.clientWidth / 2;
    const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;
    const toReal = (gi) => ((gi - CLONES) % L + L) % L;
  
    function applyAspectForActive(i) {
      // WybĂłr proporcji: data-aspect="16/9" | "9/16" | "4/5" ... lub klasa "landscape"
      const card = items[i];
      const arFromData  = card?.dataset.aspect || '';
      const arFromClass = card?.classList?.contains('landscape') ? '16/9' : '';
      const ratio = arFromData || arFromClass; // puste = uĹĽyj CSS domyĹ›lnego
    
      // Ustaw aspekt tylko dla AKTYWNEJ karty (reszta wraca do domyĹ›lnego z CSS)
      items.forEach((el, j) => {
        const box = el.querySelector('.portfolio-video');
        if (!box) return;
        if (j === i && ratio) box.style.aspectRatio = ratio;
        else box.style.removeProperty('aspect-ratio'); // wraca do .portfolio-video { aspect-ratio: 9/16 }
      });
    
      // (opcjonalnie) klasa na kontenerze â€“ przydaje siÄ™ w CSS na glow etc.
      container.classList.toggle('mode-16x9', ratio === '16/9');
    }
  
    function setActive(i) {
      items.forEach(el => el.classList.remove('left','active','right'));
      const li = (i - 1 + items.length) % items.length;
      const ri = (i + 1) % items.length;
      items[li]?.classList.add('left');
      items[i]?.classList.add('active');
      items[ri]?.classList.add('right');
    
      // YouTube iframe handling - odtwarzaj tylko aktywny, resztÄ™ pauzuj
      const activeContainer = items[i]?.querySelector('.youtube-container');
      if (activeContainer) {
        console.log(`AktywujÄ™ film ${i + 1}`);
        playYouTubeVideo(activeContainer); // Ta funkcja juĹĽ zatrzymuje wszystkie inne
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
        // PrzejĹ›cie z lewej strony - idĹş do prawej (koniec)
        current = i + L;
        // Bez animacji - natychmiastowe przejĹ›cie
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        // PrzywrĂłÄ‡ animacjÄ™ po reflow
        requestAnimationFrame(() => {
          track.style.transition = '';
        });
        return current;
      }
      if (i >= CLONES + L) {
        // PrzejĹ›cie z prawej strony - idĹş do lewej (poczÄ…tek)
        current = i - L;
        // Bez animacji - natychmiastowe przejĹ›cie
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        // PrzywrĂłÄ‡ animacjÄ™ po reflow
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
      
      // SprawdĹş czy potrzebujemy normalizacji
      if (newIndex < CLONES) {
        // PrzejĹ›cie z lewej strony - idĹş do prawej (koniec)
        current = newIndex + L;
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        setActive(current);
        requestAnimationFrame(() => {
          track.style.transition = '';
          animating = false;
        });
      } else if (newIndex >= CLONES + L) {
        // PrzejĹ›cie z prawej strony - idĹş do lewej (poczÄ…tek)
        current = newIndex - L;
        track.style.transition = 'none';
        recalcTranslateFor(current, false);
        setActive(current);
        requestAnimationFrame(() => {
          track.style.transition = '';
          animating = false;
        });
      } else {
        // Normalne przejĹ›cie z animacjÄ…
        current = newIndex;
        recalcTranslateFor(current, true);
        setActive(current);
        setTimeout(() => { animating = false; }, 50);
      }
    }
  
    // đź”Š 1. gest uĹĽytkownika â€“ odblokuj dĹşwiÄ™k/kontrolki
    const unlock = () => {
      if (!userInteracted) {
        userInteracted = true;
        setActive(current); // odĹ›wieĹĽ, ĹĽeby centralny dostaĹ‚ controls + unmute
      }
    };
    container.addEventListener('pointerdown', unlock, { once:true });
  
    // YouTube auto-play - bez klikniÄ™Ä‡, tylko slider
  
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
        if (targetIndex === current) return; // juĹĽ jesteĹ›my na tym slajdzie
        
        current = targetIndex;
        recalcTranslateFor(current, true);
        setActive(current);
      });
    });
  
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(+1));
    
    // Touch events dla strzaĹ‚ek (mobile)
    prev?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      go(-1);
    }, { passive: false });
    
    next?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      go(+1);
    }, { passive: false });
  
    // drag/swipe - NAPRAWIONE z touch events
    let startX=0, dx=0, dragging=false;
    
    // Pointer events (desktop)
    slider.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; dx = 0;
      if (slider.setPointerCapture) slider.setPointerCapture(e.pointerId);
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
        // dx < 0 oznacza przeciÄ…gniÄ™cie w lewo = nastÄ™pny slajd
        // dx > 0 oznacza przeciÄ…gniÄ™cie w prawo = poprzedni slajd
        go(dx < 0 ? 1 : -1);
      } else {
        recalcTranslateFor(current, true);
      }
    });
    
    // Touch events (mobile) - FALLBACK
    slider.addEventListener('touchstart', e => {
      console.log('đź‘† Touch start detected');
      if (e.touches.length !== 1) return;
      dragging = true; 
      startX = e.touches[0].clientX; 
      dx = 0;
      track.style.transition = 'none';
      e.preventDefault();
    }, { passive: false });
    
    slider.addEventListener('touchmove', e => {
      if (!dragging || e.touches.length !== 1) return;
      dx = e.touches[0].clientX - startX;
      
      // Direct update for maximum performance
      track.style.transform = `translate3d(${tx + dx * 0.6}px, 0, 0)`;
      e.preventDefault();
    }, { passive: false });
    
    slider.addEventListener('touchend', e => {
      if (!dragging) return;
      console.log('đź‘† Touch end detected, dx:', dx);
      dragging = false;
      track.style.transition = '';
      if (Math.abs(dx) > 25) {
        // dx < 0 oznacza przeciÄ…gniÄ™cie w lewo = nastÄ™pny slajd
        // dx > 0 oznacza przeciÄ…gniÄ™cie w prawo = poprzedni slajd
        console.log('đźŽŻ Swipe detected, going:', dx < 0 ? 'next' : 'prev');
        go(dx < 0 ? 1 : -1);
      } else {
        console.log('đź”„ Returning to current position');
        recalcTranslateFor(current, true);
      }
    }, { passive: true });
  
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
        
        // SprawdĹş czy potrzebujemy normalizacji
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
  
    // --- â€žkopâ€ť po peĹ‚nym uĹ‚oĹĽeniu layoutu, ĹĽeby nie trzeba byĹ‚o scrollowaÄ‡ ---
    function fixLayout() {
      current = normalize(current);
      recalcTranslateFor(current, false);
      setActive(current);
    }
  
    // Po peĹ‚nym load
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(fixLayout);
      });
    });
  
    // Gdy czcionki siÄ™ dociÄ…gnÄ…
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

  // ---------- Canvas particles (ULEPSZONE TĹO) - ZAKOMENTOWANE DLA OPTYMALIZACJI ----------
  /*
  function initParticles() {
    // jeĹ›li ktoĹ› nie chce animacji
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // wykryj sĹ‚absze urzÄ…dzenia
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let canvas = $('#particle-canvas');

    // dodaj, jeĹ›li nie ma
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
      // przeliczenie gÄ™stoĹ›ci po resize
      baseCount = calcCount();
      tunePopulation();
    }
    const calcCount = () => {
      const base = clamp(Math.round((W * H) / 25000), 25, 80);
      return isLowEnd ? Math.floor(base * 0.6) : base; // 40% mniej na sĹ‚abszych urzÄ…dzeniach
    };

    // elementy
    let particles = [];
    let linksDist = 140;  // bazowy dystans Ĺ‚Ä…czenia (zwiÄ™kszony dla mniejszej liczby linii)
    let baseCount = calcCount();

    // pointer parallax / repel
    const pointer = { x: W / 2, y: H / 2, active: false };
    const pointerStrength = 0.08; // siĹ‚a â€žprzyciÄ…g/odpychâ€ť
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
      // dostosuj liczbÄ™ czÄ…steczek do baseCount
      if (particles.length < baseCount) {
        while (particles.length < baseCount) particles.push(makeParticle());
      } else if (particles.length > baseCount) {
        particles.length = baseCount;
      }
      // dostosuj dystans Ĺ‚Ä…czenia
      linksDist = clamp(Math.sqrt(W * H) / 8, 100, 180);
    }

    resize();
    window.addEventListener('resize', () => { resize(); });

    if (prefersReduce || isLowEnd) {
      // statyczne tĹ‚o: narysuj delikatne orby i zakoĹ„cz
      tunePopulation();
      drawStaticBackground(ctx, W, H, particles);
      return;
    }

    // FPS monitor: redukuj gÄ™stoĹ›Ä‡ przy niskim FPS
    let last = performance.now();
    let fpsEMA = 60; // wykĹ‚adnicza Ĺ›rednia
    const fpsAlpha = 0.1;
    let frameSkip = 0; // pomijaj co drugÄ… klatkÄ™ na sĹ‚abszych urzÄ…dzeniach

    // pauza przy ukrytej karcie
    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = performance.now(); loop(last); }
    });

    // gĹ‚Ăłwna pÄ™tla
    function loop(now) {
      if (!running) return;
      
      // pomijaj co drugÄ… klatkÄ™ na sĹ‚abszych urzÄ…dzeniach
      frameSkip++;
      if (isLowEnd && frameSkip % 2 === 0) {
        requestAnimationFrame(loop);
        return;
      }
      
      const dt = Math.min(0.05, (now - last) / 1000); // max 50ms
      last = now;
      const dtScale = dt * 60; // przelicznik do prÄ™dkoĹ›ci @60fps

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

      // pĂłĹ‚przezroczyste czyszczenie (lekki â€žmotion trailâ€ť)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.08)'; // tĹ‚o: bardzo ciemny granat
      ctx.fillRect(0, 0, W, H);

      // tĹ‚o: powolne â€žorbyâ€ť (radialne gradienty)
      drawDriftingOrbs(ctx, W, H, now / 1000);

      // parallax easing
      const targetPX = (pointer.x - W / 2) * 0.02;
      const targetPY = (pointer.y - H / 2) * 0.02;
      parallax.x += (targetPX - parallax.x) * parallax.k;
      parallax.y += (targetPY - parallax.y) * parallax.k;

      // update & draw particles
      // najpierw rysujemy linie Ĺ‚Ä…czeĹ„, potem punkty
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
            const t = 1 - d / linksDist; // im bliĹĽej, tym mocniej
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
        // wpĹ‚yw kursora (delikatny repel)
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx*dx + dy*dy;
          const influenceR = 150;
          if (d2 < influenceR * influenceR) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / influenceR) * pointerStrength; // siĹ‚a maleje z odlegĹ‚oĹ›ciÄ…
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // aktualizacja pozycji
        p.x += p.vx * dtScale;
        p.y += p.vy * dtScale;

        // odbicia od krawÄ™dzi (miÄ™kkie)
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // lekkie â€žmigotanieâ€ť
        p.alpha += (Math.random() - 0.5) * 0.02;
        p.alpha = clamp(p.alpha, 0.25, 0.7);

        // rysowanie czÄ…steczki z radialnym gradientem
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

    // rysowanie statycznego tĹ‚a (gdy prefers-reduced-motion)
    function drawStaticBackground(ctx, w, h, pool) {
      ctx.clearRect(0, 0, w, h);
      drawDriftingOrbs(ctx, w, h, 0.0);
      // kilka â€žzamroĹĽonychâ€ť punktĂłw
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

    // duĹĽe powolne gradientowe â€žorbyâ€ť w tle
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

    // wstÄ™pna populacja
    tunePopulation();

    // start pÄ™tli
    last = performance.now();
    requestAnimationFrame(loop);
  }
  */


  // ---------- ObsĹ‚uga formularza kontaktowego ----------
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

    // ObsĹ‚uga wysyĹ‚ania formularza
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // SprawdĹş czy wszystkie pola sÄ… wypeĹ‚nione
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
        showFormMessage('WypeĹ‚nij wszystkie wymagane pola.', 'error');
        return;
      }

      // ZmieĹ„ stan przycisku
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> WysyĹ‚anie...';
      
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
          showFormMessage('WiadomoĹ›Ä‡ zostaĹ‚a wysĹ‚ana! Odpowiem wkrĂłtce.', 'success');
          form.reset();
        } else {
          throw new Error('BĹ‚Ä…d wysyĹ‚ania');
        }
      } catch (error) {
        showFormMessage('WystÄ…piĹ‚ bĹ‚Ä…d. SprĂłbuj ponownie lub napisz bezpoĹ›rednio na e-mail.', 'error');
      } finally {
        // PrzywrĂłÄ‡ przycisk
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });

    // Funkcja do pokazywania komunikatĂłw
    function showFormMessage(message, type) {
      // UsuĹ„ poprzednie komunikaty
      const existingMsg = form.querySelector('.form-message');
      if (existingMsg) existingMsg.remove();

      // StwĂłrz nowy komunikat
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
      
      // UsuĹ„ komunikat po 5 sekundach
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

    // klasa na <body> przy otwarciu/zamkniÄ™ciu
    mobile.addEventListener('toggle', () => {
      if (mobile.open && !mobile.hasAttribute('data-closing')) {
        document.body.classList.add('is-menu-open');
      } else if (!mobile.open) {
        document.body.classList.remove('is-menu-open');
      }
    });

    // klik w burger gdy otwarte -> zamknij pĹ‚ynnie (blokuje natywne toggle)
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
    console.log('YouTube API zaĹ‚adowane');
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

      // UtwĂłrz nowy player
      const player = new YT.Player(iframe.id, {
        playerVars: {
          autoplay: 0,        // NIE graj automatycznie
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          mute: 1,
          start: 0            // Zaczynaj od poczÄ…tku
        },
        events: {
          onReady: (event) => {
            console.log(`Player ${index + 1} gotowy:`, videoId);
            youtubePlayers.set(container, event.target);
            // Zatrzymaj film po zaĹ‚adowaniu
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
            console.error(`BĹ‚Ä…d YouTube player ${index + 1}:`, event.data);
          }
        }
      });
    });
  }

  // OdtwĂłrz film
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
      console.log('ZatrzymujÄ™ film:', container.dataset.videoId);
    }
  }

  // Zatrzymaj wszystkie filmy oprĂłcz aktywnego
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
    // Wykryj sĹ‚absze urzÄ…dzenia - NAPRAWIONE
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const isLowMemory = navigator.hardwareConcurrency <= 2;
    const isSlowConnection = navigator.connection && navigator.connection.effectiveType && 
                           ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType);
    
    // iPhone 13 i nowsze to nowoczesne urzÄ…dzenia - nie traktuj jako low-end
    const isModerniPhone = /iPhone.*OS (1[5-9]|[2-9][0-9])/i.test(navigator.userAgent);
    const isModernAndroid = /Android.*Chrome\/[8-9][0-9]/i.test(navigator.userAgent);
    
    // Specjalne wykrywanie iPhone 13+ (iOS 15+)
    const isiPhone13Plus = /iPhone.*OS (1[5-9]|[2-9][0-9])/i.test(navigator.userAgent);
    
    // Firefox na nowoczesnych urzÄ…dzeniach teĹĽ nie jest low-end
    const isModernFirefox = isFirefox && (isModerniPhone || isModernAndroid);
    
