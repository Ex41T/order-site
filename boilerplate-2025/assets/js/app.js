/**
 * Main Application JavaScript
 * Handles: theme toggle, loading screen, navigation, form validation, smooth scroll
 */

(function() {
  'use strict';

  // ============================================
  // THEME TOGGLE
  // ============================================
  function initThemeToggle() {
    const themeButtons = document.querySelectorAll('[data-theme-toggle]');
    const html = document.documentElement;
    
    // Load saved theme or detect system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Apply theme
    if (currentTheme === 'light') {
      html.setAttribute('data-theme', 'light');
    }
    
    // Update icons
    function updateThemeIcons(theme) {
      themeButtons.forEach(btn => {
        const icon = btn.querySelector('.theme-icon');
        if (icon) {
          icon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
      });
    }
    
    updateThemeIcons(currentTheme);
    
    // Toggle theme
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (newTheme === 'light') {
          html.setAttribute('data-theme', 'light');
        } else {
          html.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
        console.log('🎨 Theme changed to:', newTheme);
      });
    });
    
    console.log('✅ Theme toggle initialized');
  }

  // ============================================
  // LOADING SCREEN
  // ============================================
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Wait for page to fully load
      window.addEventListener('load', () => {
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            console.log('✅ Loading screen hidden');
          }, 300);
        }, 500);
      });
    }
  }

  // ============================================
  // NAVIGATION SCROLL EFFECT
  // ============================================
  function initNavigationScroll() {
    const nav = document.querySelector('.nav-glass, .nav');
    if (!nav) return;
    
    let lastScrollY = window.scrollY;
    
    function updateNav() {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      
      lastScrollY = currentScrollY;
    }
    
    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNav();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    updateNav(); // Initial check
    console.log('✅ Navigation scroll initialized');
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip empty or just hash links
        if (href === '#' || href === '#!') return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          
          // Close mobile menu if open
          const details = document.querySelector('.nav__mobile details');
          if (details) details.removeAttribute('open');
          
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    console.log('✅ Smooth scroll initialized');
  }

  // ============================================
  // FORM VALIDATION & SUBMISSION
  // ============================================
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = form.querySelector('.form-submit');
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();
      const consent = form.querySelector('#consent').checked;
      
      // Validation
      if (!name || !email || !message || !consent) {
        alert('Proszę wypełnić wszystkie wymagane pola i zaakceptować zgodę na przetwarzanie danych.');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Proszę podać prawidłowy adres e-mail.');
        return;
      }
      
      // Disable button during submission
      submitButton.disabled = true;
      submitButton.textContent = 'Wysyłanie...';
      
      // Simulate form submission (replace with actual backend call)
      try {
        // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) });
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert('Dziękujemy za wiadomość! Odpowiemy najszybciej jak to możliwe.');
        form.reset();
        
        console.log('✅ Form submitted:', { name, email, message });
      } catch (error) {
        console.error('❌ Form submission error:', error);
        alert('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Wyślij wiadomość';
      }
    });
    
    console.log('✅ Contact form initialized');
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  function initMobileMenu() {
    const details = document.querySelector('.nav__mobile details');
    if (!details) return;
    
    const navPanel = details.querySelector('.nav__panel');
    const navLinks = navPanel?.querySelectorAll('a');
    
    // Close menu when clicking on a link
    navLinks?.forEach(link => {
      link.addEventListener('click', () => {
        details.removeAttribute('open');
      });
    });
    
    // Prevent body scroll when menu is open
    details.addEventListener('toggle', () => {
      if (details.open) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    });
    
    console.log('✅ Mobile menu initialized');
  }

  // ============================================
  // LAZY LOAD YOUTUBE IFRAMES
  // ============================================
  function initLazyLoadYouTube() {
    const iframes = document.querySelectorAll('.youtube-container iframe');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            const src = iframe.getAttribute('data-src');
            if (src) {
              iframe.setAttribute('src', src);
              iframe.removeAttribute('data-src');
              observer.unobserve(iframe);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      iframes.forEach(iframe => {
        // Move src to data-src for lazy loading
        const src = iframe.getAttribute('src');
        if (src) {
          iframe.setAttribute('data-src', src);
          iframe.removeAttribute('src');
          observer.observe(iframe);
        }
      });
      
      console.log('✅ Lazy loading initialized for', iframes.length, 'iframes');
    }
  }

  // ============================================
  // UPDATE FOOTER YEAR
  // ============================================
  function updateFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // ============================================
  // INITIALIZE ALL
  // ============================================
  function init() {
    console.log('🚀 Initializing app...');
    
    // Run immediately
    hideLoadingScreen();
    updateFooterYear();
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initNavigationScroll();
        initSmoothScroll();
        initContactForm();
        initMobileMenu();
        // Lazy load will be initialized after portfolio slider creates iframes
        setTimeout(initLazyLoadYouTube, 500);
      });
    } else {
      initThemeToggle();
      initNavigationScroll();
      initSmoothScroll();
      initContactForm();
      initMobileMenu();
      setTimeout(initLazyLoadYouTube, 500);
    }
  }

  // Start the app
  init();

  // Expose for debugging
  window.appDebug = {
    reinitLazyLoad: initLazyLoadYouTube
  };

})();

