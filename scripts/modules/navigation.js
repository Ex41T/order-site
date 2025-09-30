/* ==========================================================================
   NAVIGATION MODULE
   - Smooth scroll
   - Sticky nav (.scrolled)
   - Mobile menu (burger)
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Smooth scroll
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id && id.length > 1 ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Ustaw focus dla a11y
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

// Sticky nav
function initStickyNav() {
  const header = $('.nav-glass');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  
  if (window.addEventListener) {
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    window.attachEvent('onscroll', onScroll);
  }
}

// Mobile menu
function initMobileMenu() {
  const details = $('.nav__mobile');
  const overlay = details?.querySelector('.nav__overlay');
  const closeBtn = details?.querySelector('.nav__close');
  
  if (!details) return;
  
  // Zamknij menu po kliknięciu w overlay
  overlay?.addEventListener('click', () => {
    details.open = false;
  });
  
  // Zamknij menu po kliknięciu w przycisk X
  closeBtn?.addEventListener('click', () => {
    details.open = false;
  });
  
  // Zamknij menu po kliknięciu w link
  $$('.nav__panel a', details).forEach(link => {
    link.addEventListener('click', () => {
      details.open = false;
    });
  });
}

// Eksport funkcji inicjalizującej do window
window.initNavigation = function() {
  console.log('🔗 Inicjalizacja nawigacji...');
  initSmoothScroll();
  initStickyNav();
  initMobileMenu();
  console.log('✅ Nawigacja zainicjalizowana');
}

