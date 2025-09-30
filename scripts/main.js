/* ==========================================================================
   MAIN JS - ORDER SITE
   Zmodularyzowany i zoptymalizowany JavaScript
   ========================================================================== */

// Import modułów
import { initNavigation } from './modules/navigation.js';
import { initPortfolioSlider } from './modules/portfolio.js';
import { initContactForm } from './modules/contact.js';
import { initHeroVideo } from './modules/video.js';

// Helpers
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

// Inicjalizacja aplikacji
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
      initNavigation();
      initHeroVideo();
      initPortfolioSlider();
      initContactForm();
      
      console.log('✅ Aplikacja zainicjalizowana');
    } catch (error) {
      console.error('❌ Błąd podczas inicjalizacji:', error);
    }
  }
})();

