/* ==========================================================================
   FPS DEBUG & OPTIMIZATION UTILITIES
   ========================================================================== */

(() => {
  'use strict';

  // ==========================================================================
  // FPS MONITOR
  // ==========================================================================
  class FPSMonitor {
    constructor() {
      this.fps = 0;
      this.frameCount = 0;
      this.lastTime = performance.now();
      this.isMonitoring = false;
      this.callbacks = [];
      
      this.start();
    }

    start() {
      if (this.isMonitoring) return;
      this.isMonitoring = true;
      this.monitor();
    }

    stop() {
      this.isMonitoring = false;
    }

    monitor() {
      if (!this.isMonitoring) return;

      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Notify callbacks
        this.callbacks.forEach(callback => callback(this.fps));
        
        // Auto-adjust performance
        this.adjustPerformance(this.fps);
      }
      
      requestAnimationFrame(() => this.monitor());
    }

    onFPSUpdate(callback) {
      this.callbacks.push(callback);
    }

    adjustPerformance(fps) {
      const body = document.body;
      
      if (fps < 30) {
        body.classList.add('low-performance');
        this.disableHeavyAnimations();
      } else if (fps < 45) {
        body.classList.add('medium-performance');
        this.reduceAnimations();
      } else {
        body.classList.remove('low-performance', 'medium-performance');
        this.enableAllAnimations();
      }
    }

    disableHeavyAnimations() {
      // Disable backdrop-filter
      document.documentElement.style.setProperty('--backdrop-filter', 'none');
      
      // Disable box-shadow animations
      document.documentElement.style.setProperty('--box-shadow', 'none');
      
      // Reduce animation complexity
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    reduceAnimations() {
      // Reduce backdrop-filter blur
      document.documentElement.style.setProperty('--backdrop-filter', 'blur(8px)');
      
      // Reduce box-shadow complexity
      document.documentElement.style.setProperty('--box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
      
      // Faster animations
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }

    enableAllAnimations() {
      document.documentElement.style.removeProperty('--backdrop-filter');
      document.documentElement.style.removeProperty('--box-shadow');
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }

  // ==========================================================================
  // PERFORMANCE OPTIMIZER
  // ==========================================================================
  class PerformanceOptimizer {
    constructor() {
      this.isLowEnd = this.detectLowEndDevice();
      this.init();
    }

    detectLowEndDevice() {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLowMemory = navigator.hardwareConcurrency <= 2;
      const isSlowConnection = navigator.connection && 
                             ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType);
      
      return isMobile && (isLowMemory || isSlowConnection);
    }

    init() {
      if (this.isLowEnd) {
        this.optimizeForLowEnd();
      }
      
      // Always apply these optimizations
      this.enableGPUAcceleration();
      this.optimizeImages();
      this.optimizeAnimations();
    }

    optimizeForLowEnd() {
      console.log('🔧 Optimizing for low-end device');
      
      // Disable particles
      const particles = document.querySelector('.particles-canvas');
      if (particles) particles.style.display = 'none';
      
      // Reduce backdrop-filter usage
      document.documentElement.style.setProperty('--backdrop-filter', 'blur(4px)');
      
      // Simplify animations
      document.documentElement.style.setProperty('--animation-duration', '0.15s');
      
      // Reduce box-shadow complexity
      document.documentElement.style.setProperty('--box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
    }

    enableGPUAcceleration() {
      const elements = [
        '.nav-glass',
        '.hero-title',
        '.portfolio-track',
        '.portfolio-item',
        '.btn-primary',
        '.btn-secondary'
      ];

      elements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
          el.style.willChange = 'transform';
        });
      });
    }

    optimizeImages() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Add loading optimization
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        // Add decoding optimization
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
    }

    optimizeAnimations() {
      // Use CSS custom properties for animation optimization
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      document.documentElement.style.setProperty('--animation-timing', 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    }
  }

  // ==========================================================================
  // THROTTLED EVENT HANDLERS
  // ==========================================================================
  class ThrottledEvents {
    constructor() {
      this.throttleMap = new Map();
    }

    throttle(func, delay) {
      const key = func.toString();
      
      if (!this.throttleMap.has(key)) {
        let timeout;
        let lastExec = 0;
        
        const throttled = function(...args) {
          const now = Date.now();
          
          if (now - lastExec > delay) {
            func.apply(this, args);
            lastExec = now;
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              func.apply(this, args);
              lastExec = Date.now();
            }, delay - (now - lastExec));
          }
        };
        
        this.throttleMap.set(key, throttled);
      }
      
      return this.throttleMap.get(key);
    }

    addThrottledListener(element, event, handler, delay = 16) {
      const throttledHandler = this.throttle(handler, delay);
      element.addEventListener(event, throttledHandler, { passive: true });
      return throttledHandler;
    }
  }

  // ==========================================================================
  // PORTFOLIO SLIDER OPTIMIZATION
  // ==========================================================================
  class OptimizedPortfolioSlider {
    constructor() {
      this.container = document.querySelector('.portfolio-slider-container');
      this.slider = this.container?.querySelector('.portfolio-slider');
      this.track = this.container?.querySelector('.portfolio-track');
      
      if (!this.container || !this.slider || !this.track) return;
      
      this.items = Array.from(this.track.querySelectorAll('.portfolio-item'));
      this.currentIndex = 0;
      this.isAnimating = false;
      this.throttledEvents = new ThrottledEvents();
      
      this.init();
    }

    init() {
      this.setupGPUOptimization();
      this.setupTouchHandlers();
      this.setupKeyboardHandlers();
      this.setupNavigationHandlers();
      this.updateSlider(0);
    }

    setupGPUOptimization() {
      // Enable GPU acceleration
      this.track.style.willChange = 'transform';
      this.track.style.transform = 'translateZ(0)';
      this.track.style.backfaceVisibility = 'hidden';
      
      // Optimize items
      this.items.forEach(item => {
        item.style.willChange = 'opacity, transform';
        item.style.transform = 'translateZ(0)';
        item.style.backfaceVisibility = 'hidden';
      });
    }

    setupTouchHandlers() {
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        this.track.style.transition = 'none';
      };

      const handleTouchMove = (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        this.updateTransform(deltaX);
      };

      const handleTouchEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const deltaX = currentX - startX;
        const threshold = 50;
        
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            this.prevSlide();
          } else {
            this.nextSlide();
          }
        } else {
          this.updateSlider(this.currentIndex);
        }
      };

      this.slider.addEventListener('touchstart', handleTouchStart, { passive: true });
      this.slider.addEventListener('touchmove', handleTouchMove, { passive: true });
      this.slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    setupKeyboardHandlers() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prevSlide();
        if (e.key === 'ArrowRight') this.nextSlide();
      });
    }

    setupNavigationHandlers() {
      const prevBtn = this.container.querySelector('.portfolio-arrow.left');
      const nextBtn = this.container.querySelector('.portfolio-arrow.right');
      const dots = this.container.querySelectorAll('.nav-dot');

      prevBtn?.addEventListener('click', () => this.prevSlide());
      nextBtn?.addEventListener('click', () => this.nextSlide());

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });
    }

    updateTransform(deltaX = 0) {
      const itemWidth = this.items[0]?.offsetWidth || 300;
      const gap = 24;
      const baseTranslate = -(this.currentIndex * (itemWidth + gap));
      const translateX = baseTranslate + deltaX;
      
      this.track.style.transform = `translate3d(${translateX}px, 0, 0)`;
    }

    updateSlider(index, immediate = false) {
      if (this.isAnimating && !immediate) return;
      
      this.currentIndex = Math.max(0, Math.min(index, this.items.length - 1));
      
      this.track.style.transition = immediate ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      this.updateTransform();
      
      // Update active states
      this.items.forEach((item, i) => {
        item.classList.toggle('active', i === this.currentIndex);
        item.classList.toggle('left', i === this.currentIndex - 1);
        item.classList.toggle('right', i === this.currentIndex + 1);
      });
      
      // Update dots
      const dots = this.container.querySelectorAll('.nav-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === this.currentIndex);
      });
      
      if (!immediate) {
        this.isAnimating = true;
        setTimeout(() => this.isAnimating = false, 300);
      }
    }

    nextSlide() {
      this.updateSlider(this.currentIndex + 1);
    }

    prevSlide() {
      this.updateSlider(this.currentIndex - 1);
    }

    goToSlide(index) {
      this.updateSlider(index);
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize performance monitoring
    const fpsMonitor = new FPSMonitor();
    
    // Initialize performance optimizer
    const optimizer = new PerformanceOptimizer();
    
    // Initialize optimized portfolio slider
    const slider = new OptimizedPortfolioSlider();
    
    // FPS display (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const fpsDisplay = document.createElement('div');
      fpsDisplay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
      `;
      document.body.appendChild(fpsDisplay);
      
      fpsMonitor.onFPSUpdate((fps) => {
        fpsDisplay.textContent = `FPS: ${fps}`;
        fpsDisplay.style.color = fps < 30 ? '#ff4444' : fps < 45 ? '#ffaa00' : '#44ff44';
      });
    }
  });

})();
