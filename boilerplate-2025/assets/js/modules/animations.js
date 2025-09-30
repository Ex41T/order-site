/* ==========================================================================
   ANIMATIONS MODULE - 2025/2026
   ========================================================================== */

export class Animations {
  constructor() {
    this.observers = new Map();
    this.animations = new Map();
    this.isPaused = false;
    this.reducedMotion = false;
  }

  async init() {
    // Check for reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.reducedMotion) {
      console.log('🎭 Reduced motion detected - animations disabled');
      return;
    }
    
    // Initialize scroll-triggered animations
    this.initScrollAnimations();
    
    // Initialize intersection observer animations
    this.initIntersectionAnimations();
    
    // Initialize CSS scroll-driven animations
    this.initScrollDrivenAnimations();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    console.log('🎭 Animations initialized');
  }

  initScrollAnimations() {
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      this.createParallaxEffect(heroSection, 0.5);
    }
    
    // Staggered animation for skill cards
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length > 0) {
      this.createStaggeredAnimation(skillCards, 'fadeInUp', 100);
    }
    
    // Portfolio items animation
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (portfolioItems.length > 0) {
      this.createStaggeredAnimation(portfolioItems, 'fadeInScale', 150);
    }
  }

  initIntersectionAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
      observer.observe(element);
    });
    
    this.observers.set('intersection', observer);
  }

  initScrollDrivenAnimations() {
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      console.log('🎭 Scroll-driven animations not supported');
      return;
    }
    
    // Create scroll-driven animations
    this.createScrollDrivenAnimation('.hero-title', 'fadeInUp');
    this.createScrollDrivenAnimation('.hero-description', 'fadeInUp', 0.2);
    this.createScrollDrivenAnimation('.hero-actions', 'fadeInUp', 0.4);
  }

  createParallaxEffect(element, speed = 0.5) {
    const updateParallax = () => {
      if (this.isPaused) return;
      
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      element.style.transform = `translate3d(0, ${rate}px, 0)`;
    };
    
    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Store cleanup function
    this.animations.set('parallax', () => {
      window.removeEventListener('scroll', handleScroll);
    });
  }

  createStaggeredAnimation(elements, animationType, delay = 100) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            this.animateElement(entry.target, animationType);
          }, index * delay);
        }
      });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
      observer.observe(element);
    });
    
    this.observers.set(`staggered-${animationType}`, observer);
  }

  createScrollDrivenAnimation(selector, animationType, delay = 0) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const keyframes = this.getAnimationKeyframes(animationType);
    const options = {
      duration: 1000,
      delay: delay * 1000,
      fill: 'both',
      animationTimeline: 'scroll()'
    };
    
    const animation = element.animate(keyframes, options);
    this.animations.set(`scroll-driven-${selector}`, animation);
  }

  triggerAnimation(element) {
    const animationType = element.dataset.animate;
    if (animationType) {
      this.animateElement(element, animationType);
    }
  }

  animateElement(element, animationType) {
    const keyframes = this.getAnimationKeyframes(animationType);
    const options = {
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'both'
    };
    
    const animation = element.animate(keyframes, options);
    this.animations.set(`element-${element.id || Math.random()}`, animation);
    
    return animation;
  }

  getAnimationKeyframes(animationType) {
    const keyframes = {
      fadeIn: [
        { opacity: 0, transform: 'translateZ(0)' },
        { opacity: 1, transform: 'translateZ(0)' }
      ],
      fadeInUp: [
        { opacity: 0, transform: 'translateY(2rem) translateZ(0)' },
        { opacity: 1, transform: 'translateY(0) translateZ(0)' }
      ],
      fadeInDown: [
        { opacity: 0, transform: 'translateY(-2rem) translateZ(0)' },
        { opacity: 1, transform: 'translateY(0) translateZ(0)' }
      ],
      fadeInLeft: [
        { opacity: 0, transform: 'translateX(-2rem) translateZ(0)' },
        { opacity: 1, transform: 'translateX(0) translateZ(0)' }
      ],
      fadeInRight: [
        { opacity: 0, transform: 'translateX(2rem) translateZ(0)' },
        { opacity: 1, transform: 'translateX(0) translateZ(0)' }
      ],
      fadeInScale: [
        { opacity: 0, transform: 'scale(0.9) translateZ(0)' },
        { opacity: 1, transform: 'scale(1) translateZ(0)' }
      ],
      slideInUp: [
        { transform: 'translateY(100%) translateZ(0)' },
        { transform: 'translateY(0) translateZ(0)' }
      ],
      slideInDown: [
        { transform: 'translateY(-100%) translateZ(0)' },
        { transform: 'translateY(0) translateZ(0)' }
      ],
      slideInLeft: [
        { transform: 'translateX(-100%) translateZ(0)' },
        { transform: 'translateX(0) translateZ(0)' }
      ],
      slideInRight: [
        { transform: 'translateX(100%) translateZ(0)' },
        { transform: 'translateX(0) translateZ(0)' }
      ],
      scaleIn: [
        { transform: 'scale(0) translateZ(0)' },
        { transform: 'scale(1) translateZ(0)' }
      ],
      rotateIn: [
        { transform: 'rotate(-180deg) scale(0) translateZ(0)' },
        { transform: 'rotate(0deg) scale(1) translateZ(0)' }
      ]
    };
    
    return keyframes[animationType] || keyframes.fadeIn;
  }

  setupPerformanceMonitoring() {
    // Monitor FPS and adjust animations accordingly
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust animations based on FPS
        if (fps < 30) {
          this.enableLowPerformanceMode();
        } else if (fps < 45) {
          this.enableMediumPerformanceMode();
        } else {
          this.enableHighPerformanceMode();
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  enableLowPerformanceMode() {
    // Disable heavy animations
    this.pause();
    document.documentElement.classList.add('low-performance-animations');
  }

  enableMediumPerformanceMode() {
    // Reduce animation complexity
    this.resume();
    document.documentElement.classList.remove('low-performance-animations');
    document.documentElement.classList.add('medium-performance-animations');
  }

  enableHighPerformanceMode() {
    // Enable all animations
    this.resume();
    document.documentElement.classList.remove('low-performance-animations', 'medium-performance-animations');
  }

  pause() {
    this.isPaused = true;
    
    // Pause all animations
    this.animations.forEach(animation => {
      if (animation.pause) {
        animation.pause();
      }
    });
    
    // Disable CSS animations
    document.documentElement.style.setProperty('--animation-play-state', 'paused');
  }

  resume() {
    this.isPaused = false;
    
    // Resume all animations
    this.animations.forEach(animation => {
      if (animation.play) {
        animation.play();
      }
    });
    
    // Enable CSS animations
    document.documentElement.style.removeProperty('--animation-play-state');
  }

  // Public method to create custom animation
  createCustomAnimation(element, keyframes, options = {}) {
    const defaultOptions = {
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'both'
    };
    
    const animation = element.animate(keyframes, { ...defaultOptions, ...options });
    this.animations.set(`custom-${Math.random()}`, animation);
    
    return animation;
  }

  // Public method to remove animation
  removeAnimation(element) {
    const animation = this.animations.get(`element-${element.id}`);
    if (animation) {
      animation.cancel();
      this.animations.delete(`element-${element.id}`);
    }
  }

  destroy() {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Cancel all animations
    this.animations.forEach(animation => {
      if (animation.cancel) {
        animation.cancel();
      }
    });
    this.animations.clear();
    
    console.log('🎭 Animations destroyed');
  }
}
