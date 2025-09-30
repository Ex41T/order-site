/* ==========================================================================
   MAIN JS - ORDER SITE (Simple Version)
   Ĺaduje wszystkie moduĹ‚y bez ES6 imports
   ========================================================================== */

(() => {
  // Polyfills
  if (!Array.from) {
    Array.from = function(arrayLike) {
      return Array.prototype.slice.call(arrayLike);
    };
  }
  
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
  
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 1000 / 60);
    };
  }
  
  if (!window.performance || !window.performance.now) {
    window.performance = window.performance || {};
    window.performance.now = function() {
      return Date.now();
    };
  }

  // Inicjalizacja po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('🚀 Inicjalizacja aplikacji...');
    
    try {
      // ModuĹ‚y sÄ… Ĺ‚adowane jako osobne skrypty
      // KaĹĽdy moduĹ‚ eksportuje swoje funkcje do window
      
      if (window.initNavigation) window.initNavigation();
      if (window.initHeroVideo) window.initHeroVideo();
      if (window.initPortfolioSlider) window.initPortfolioSlider();
      if (window.initContactForm) window.initContactForm();
      
      // Ustaw rok w stopce
      const yearEl = document.getElementById('year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
      
      console.log('✅ Aplikacja zainicjalizowana');
    } catch (error) {
      console.error('❌ Błąd podczas inicjalizacji:', error);
    }
  }
})();

