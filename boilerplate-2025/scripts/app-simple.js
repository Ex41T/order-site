/* ==========================================================================
   PATRYK BOBROWSKI — app.js (simplified for mobile compatibility)
   ========================================================================== */

(() => {
  'use strict';
  
  // ---------- DOM Ready ----------
  function domReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }
  
  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  
  // ---------- Loading Screen ----------
  function hideLoadingScreen() {
    const loadingScreen = $('#loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 300);
      }, 500);
    }
  }
  
  // ---------- Sticky Navigation ----------
  function initStickyNav() {
    const header = $('.nav-glass, .nav');
    if (!header) return;
    
    let ticking = false;
    
    function updateHeader() {
      header.classList.toggle('scrolled', window.scrollY > 10);
      ticking = false;
    }
    
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  
  // ---------- Smooth Scroll ----------
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.length <= 1) return;
        
        const target = $(href);
        if (!target) return;
        
        e.preventDefault();
        
        const headerHeight = $('.nav-glass, .nav')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      });
    });
  }
  
  // ---------- Mobile Menu ----------
  function initMobileMenu() {
    const mobileToggle = $('.nav__mobile summary, .mobile-menu-toggle');
    const mobilePanel = $('.nav__panel');
    
    if (!mobileToggle) return;
    
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isOpen = mobileToggle.closest('details')?.hasAttribute('open') || 
                     mobilePanel?.classList.contains('active');
      
      if (mobilePanel) {
        mobilePanel.classList.toggle('active', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
      }
      
      // Close on outside click
      if (!isOpen) {
        setTimeout(() => {
          document.addEventListener('click', closeOnOutsideClick, { once: true });
        }, 100);
      }
    });
    
    function closeOnOutsideClick(e) {
      if (!mobilePanel.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobilePanel.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    }
    
    // Close menu when clicking nav links
    $$('.nav__panel a, .mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobilePanel) {
          mobilePanel.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });
    });
  }
  
  // ---------- Hero Video ----------
  function initHeroVideo() {
    const heroVideo = $('#hero-video');
    if (!heroVideo) return;
    
    // Click to play/pause
    heroVideo.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
      } else {
        heroVideo.pause();
      }
    });
    
    // Double click for fullscreen
    heroVideo.addEventListener('dblclick', () => {
      if (heroVideo.requestFullscreen) {
        heroVideo.requestFullscreen();
      } else if (heroVideo.webkitRequestFullscreen) {
        heroVideo.webkitRequestFullscreen();
      } else if (heroVideo.mozRequestFullScreen) {
        heroVideo.mozRequestFullScreen();
      } else if (heroVideo.msRequestFullscreen) {
        heroVideo.msRequestFullscreen();
      }
    });
    
    // Pause video when not visible (performance optimization)
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Video is visible, allow playing
            heroVideo.muted = false;
          } else {
            // Video is not visible, pause it
            if (!heroVideo.paused) {
              heroVideo.pause();
            }
          }
        });
      }, { threshold: 0.5 });
      
      videoObserver.observe(heroVideo);
    }
  }
  
  // ---------- Portfolio Slider (Enhanced) ----------
  function initPortfolioSlider() {
    const slider = $('.portfolio-slider-container');
    const track = $('.portfolio-track');
    const items = $$('.portfolio-item');
    const prevBtn = $('.portfolio-arrow.left, [data-portfolio-prev]');
    const nextBtn = $('.portfolio-arrow.right, [data-portfolio-next]');
    const dots = $$('.nav-dot, .portfolio-dot');
    
    if (!slider || !track || !items.length) return;
    
    let currentIndex = 0;
    const totalItems = items.length;
    
    // Auto-advance slider every 4 seconds
    let autoAdvanceInterval;
    
    function updateSlider() {
      const itemWidth = items[0].offsetWidth || 520;
      const gap = 41.6; // 32 * 1.3
      const containerWidth = slider.offsetWidth;
      
      // Zawsze wyśrodkuj aktywny element
      const centerOffset = (containerWidth / 2) - (itemWidth / 2);
      const translateX = centerOffset - (currentIndex * (itemWidth + gap));
      
      // Płynne przesunięcie do środka
      track.style.transform = `translateX(${translateX}px)`;
      
      // Update active states
      items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
      });
      
      // Update dots (nieskończona pętla - kropki się powtarzają)
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
    
    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalItems - 1));
      updateSlider();
      resetAutoAdvance();
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalItems;
      updateSlider();
      resetAutoAdvance();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateSlider();
      resetAutoAdvance();
    }
    
    function startAutoAdvance() {
      autoAdvanceInterval = setInterval(nextSlide, 4000);
    }
    
    function stopAutoAdvance() {
      if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
        autoAdvanceInterval = null;
      }
    }
    
    function resetAutoAdvance() {
      stopAutoAdvance();
      startAutoAdvance();
    }
    
    // Event listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Touch support
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAutoAdvance();
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      const threshold = 80;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      } else {
        resetAutoAdvance();
      }
    }, { passive: true });
    
    // Pause auto-advance on hover
    slider.addEventListener('mouseenter', stopAutoAdvance);
    slider.addEventListener('mouseleave', startAutoAdvance);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      setTimeout(updateSlider, 100);
    });
    
    // Start auto-advance
    startAutoAdvance();
    
    // Initial update
    setTimeout(updateSlider, 100);
  }
  
  // ---------- YouTube Videos ----------
  function initYouTubeVideos() {
    $$('.youtube-container iframe').forEach(iframe => {
      // Add loading="lazy" if not present
      if (!iframe.hasAttribute('loading')) {
        iframe.setAttribute('loading', 'lazy');
      }
      
      // Add width and height if not present
      if (!iframe.hasAttribute('width')) {
        iframe.setAttribute('width', '320');
      }
      if (!iframe.hasAttribute('height')) {
        iframe.setAttribute('height', '568');
      }
    });
  }
  
  // ---------- Form Validation ----------
  function initFormValidation() {
    const form = $('.contact-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      const consent = formData.get('consent');
      
      // Basic validation
      if (!name || name.trim().length < 2) {
        alert('Proszę podać imię i nazwisko (minimum 2 znaki)');
        return;
      }
      
      if (!email || !isValidEmail(email)) {
        alert('Proszę podać prawidłowy adres e-mail');
        return;
      }
      
      if (!message || message.trim().length < 10) {
        alert('Proszę podać wiadomość (minimum 10 znaków)');
        return;
      }
      
      if (!consent) {
        alert('Proszę zaakceptować politykę prywatności');
        return;
      }
      
      // Submit form
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Wysyłanie...';
      submitBtn.disabled = true;
      
      fetch(form.action, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (response.ok) {
          alert('Wiadomość została wysłana! Dziękuję za kontakt.');
          form.reset();
        } else {
          throw new Error('Błąd wysyłania');
        }
      })
      .catch(error => {
        alert('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.');
        console.error('Form submission error:', error);
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
    
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
  
  // ---------- Theme Toggle ----------
  function initThemeToggle() {
    const themeToggle = $('[data-theme-toggle]');
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
      const icon = themeToggle.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
      }
    }
  }
  
  // ---------- Performance Optimization ----------
  function initPerformanceOptimizations() {
    // Disable heavy effects on mobile
    if (window.innerWidth < 768) {
      document.documentElement.classList.add('mobile-optimized');
    }
    
    // Pause videos when not visible
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.play?.();
          } else {
            entry.target.pause?.();
          }
        });
      }, { threshold: 0.5 });
      
      $$('video').forEach(video => {
        videoObserver.observe(video);
      });
    }
  }
  
  // ---------- Initialize Everything ----------
  function init() {
    try {
      // Core functionality
      initStickyNav();
      initSmoothScroll();
      initMobileMenu();
      initHeroVideo();
      initPortfolioSlider();
      initYouTubeVideos();
      initFormValidation();
      initThemeToggle();
      initPerformanceOptimizations();
      
      // Hide loading screen
      hideLoadingScreen();
      
      // Update year in footer
      const yearElement = $('#year, [data-year]');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
      
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization error:', error);
      hideLoadingScreen(); // Always hide loading screen
    }
  }
  
  // Start the app
  domReady(init);
  
  // Also initialize on window load as fallback
  window.addEventListener('load', () => {
    hideLoadingScreen();
  });
  
})();
