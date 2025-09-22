/* ==========================================================================
   OPTYMALIZOWANY JAVASCRIPT - THROTTLING & PERFORMANCE
   ========================================================================== */

(() => {
  'use strict';

  // ==========================================================================
  // PERFORMANCE UTILITIES
  // ==========================================================================
  
  // Throttle function for high-frequency events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Debounce function for resize events
  function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // RAF-based animation loop
  let rafId = null;
  function requestAnimationLoop(callback) {
    function loop() {
      callback();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  function cancelAnimationLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ==========================================================================
  // SELECTORS (optimized)
  // ==========================================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ==========================================================================
  // STICKY NAVIGATION (throttled)
  // ==========================================================================
  function initStickyNav() {
    const header = $('.nav-glass');
    if (!header) return;

    const updateHeader = throttle(() => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, 16); // ~60fps

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // ==========================================================================
  // OPTIMIZED PORTFOLIO SLIDER
  // ==========================================================================
  function initPortfolioSlider() {
    const container = $('.portfolio-slider-container');
    const slider = $('.portfolio-slider', container);
    const track = $('.portfolio-track', container);
    
    if (!container || !slider || !track) return;

    const items = $$('.portfolio-item', track);
    const dots = $$('.nav-dot', container);
    const prevBtn = $('.portfolio-arrow.left', container);
    const nextBtn = $('.portfolio-arrow.right', container);

    let currentIndex = 0;
    let isAnimating = false;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    // GPU-optimized transform updates
    function updateTransform(index, immediate = false) {
      if (isAnimating && !immediate) return;
      
      const itemWidth = items[0]?.offsetWidth || 300;
      const gap = 24; // gap between items
      const translateX = -(index * (itemWidth + gap));
      
      track.style.transition = immediate ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      
      // Update active states
      items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
        item.classList.toggle('left', i === index - 1);
        item.classList.toggle('right', i === index + 1);
      });
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      if (!immediate) {
        isAnimating = true;
        setTimeout(() => isAnimating = false, 300);
      }
    }

    // Navigation functions
    function goToSlide(index) {
      if (isAnimating) return;
      currentIndex = Math.max(0, Math.min(index, items.length - 1));
      updateTransform(currentIndex);
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Touch/Drag handling with throttling
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.transition = 'none';
    };

    const handleTouchMove = throttle((e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      const itemWidth = items[0]?.offsetWidth || 300;
      const gap = 24;
      const currentTranslate = -(currentIndex * (itemWidth + gap));
      
      track.style.transform = `translate3d(${currentTranslate + deltaX}px, 0, 0)`;
    }, 16);

    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const deltaX = currentX - startX;
      const threshold = 50;
      
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      } else {
        updateTransform(currentIndex);
      }
    };

    // Event listeners
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Button navigation
    prevBtn?.addEventListener('click', prevSlide);
    nextBtn?.addEventListener('click', nextSlide);

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    // Initialize
    updateTransform(0, true);
  }

  // ==========================================================================
  // OPTIMIZED HERO VIDEO
  // ==========================================================================
  function initHeroVideo() {
    const video = $('#hero-video');
    const container = $('.video-container-hero');
    
    if (!video || !container) return;

    // Intersection Observer for video optimization
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Video is visible - can start playing
          if (video.paused && video.readyState >= 3) {
            video.play().catch(() => {});
          }
        } else {
          // Video is not visible - pause to save resources
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: 0.5 });

    videoObserver.observe(video);

    // Click to play/pause
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    // Double click for fullscreen
    video.addEventListener('dblclick', () => {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  // ==========================================================================
  // OPTIMIZED FORM HANDLING
  // ==========================================================================
  function initContactForm() {
    const form = $('.contact-form');
    if (!form) return;

    const submitBtn = $('button[type="submit"]', form);
    const originalBtnText = submitBtn?.textContent;

    // Real-time validation with debouncing
    const emailInput = $('#email', form);
    const validateEmail = debounce((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(value);
      
      emailInput.classList.toggle('invalid', !isValid);
      emailInput.setCustomValidity(isValid ? '' : 'Podaj prawidłowy adres e-mail');
    }, 300);

    emailInput?.addEventListener('input', (e) => {
      validateEmail(e.target.value);
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!submitBtn) return;
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wysyłanie...';
      
      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          showMessage('Wiadomość została wysłana!', 'success');
          form.reset();
        } else {
          throw new Error('Błąd wysyłania');
        }
      } catch (error) {
        showMessage('Wystąpił błąd. Spróbuj ponownie.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });

    function showMessage(text, type) {
      const message = document.createElement('div');
      message.className = `form-message ${type}`;
      message.textContent = text;
      message.style.cssText = `
        padding: 12px 16px;
        margin-top: 16px;
        border-radius: 8px;
        text-align: center;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
        border: 1px solid ${type === 'success' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
        color: ${type === 'success' ? '#00ff00' : '#ff0000'};
      `;
      
      form.appendChild(message);
      setTimeout(() => message.remove(), 5000);
    }
  }

  // ==========================================================================
  // PERFORMANCE MONITORING
  // ==========================================================================
  function initPerformanceMonitoring() {
    // Monitor FPS
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    function measureFPS() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust performance based on FPS
        if (fps < 30) {
          document.body.classList.add('low-performance');
        } else {
          document.body.classList.remove('low-performance');
        }
      }
      
      requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
  }

  // ==========================================================================
  // RESIZE HANDLER (debounced)
  // ==========================================================================
  function initResizeHandler() {
    const handleResize = debounce(() => {
      // Recalculate layout-dependent elements
      const slider = $('.portfolio-slider-container');
      if (slider) {
        // Trigger layout recalculation if needed
        slider.style.height = 'auto';
        slider.offsetHeight; // Force reflow
      }
    }, 250);

    window.addEventListener('resize', handleResize);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initStickyNav();
    initPortfolioSlider();
    initHeroVideo();
    initContactForm();
    initPerformanceMonitoring();
    initResizeHandler();

    // Update year in footer
    const yearEl = $('#year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationLoop();
  });

})();
