/* ==========================================================================
   MODERN JAVASCRIPT 2025/2026 - MAIN MODULE
   ========================================================================== */

// Import modules using ES6 modules
import { PerformanceMonitor } from './modules/performance.js';
import { ThemeManager } from './modules/theme.js';
import { PortfolioSlider } from './modules/portfolio.js';
import { ContactForm } from './modules/contact.js';
import { Navigation } from './modules/navigation.js';
import { Animations } from './modules/animations.js';

/* ==========================================================================
   MAIN APPLICATION CLASS
   ========================================================================== */

class App {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
    this.performanceMonitor = new PerformanceMonitor();
    
    // Bind methods
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.init);
    } else {
      this.init();
    }
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Initialize performance monitoring first
      await this.performanceMonitor.init();
      
      // Initialize core modules
      await this.initializeModules();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('🚀 App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  }

  async initializeModules() {
    const moduleConfigs = [
      { name: 'theme', instance: new ThemeManager() },
      { name: 'navigation', instance: new Navigation() },
      { name: 'portfolio', instance: new PortfolioSlider() },
      { name: 'contact', instance: new ContactForm() },
      { name: 'animations', instance: new Animations() }
    ];

    for (const { name, instance } of moduleConfigs) {
      try {
        await instance.init();
        this.modules.set(name, instance);
        console.log(`✅ ${name} module initialized`);
      } catch (error) {
        console.error(`❌ ${name} module failed to initialize:`, error);
      }
    }
  }

  setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Handle page unload
    window.addEventListener('beforeunload', this.destroy);
    
    // Handle resize with debouncing
    this.debounceResize = this.debounce(this.handleResize.bind(this), 250);
    window.addEventListener('resize', this.debounceResize);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Pause animations and heavy operations
      this.modules.get('animations')?.pause();
      this.modules.get('portfolio')?.pause();
    } else {
      // Resume operations
      this.modules.get('animations')?.resume();
      this.modules.get('portfolio')?.resume();
    }
  }

  handleResize() {
    // Notify modules about resize
    this.modules.forEach(module => {
      if (typeof module.handleResize === 'function') {
        module.handleResize();
      }
    });
  }

  destroy() {
    // Cleanup all modules
    this.modules.forEach(module => {
      if (typeof module.destroy === 'function') {
        module.destroy();
      }
    });
    
    // Remove event listeners
    window.removeEventListener('resize', this.debounceResize);
    window.removeEventListener('beforeunload', this.destroy);
    
    this.modules.clear();
    this.isInitialized = false;
  }

  // Utility method for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Utility method for throttling
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

// Modern DOM utilities
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// Modern event utilities
export const on = (element, event, handler, options = {}) => {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
};

// Modern animation utilities
export const animate = (element, keyframes, options = {}) => {
  return element.animate(keyframes, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'both',
    ...options
  });
};

// Modern intersection observer utility
export const observe = (element, callback, options = {}) => {
  const observer = new IntersectionObserver(callback, {
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  });
  
  if (Array.isArray(element)) {
    element.forEach(el => observer.observe(el));
  } else {
    observer.observe(element);
  }
  
  return observer;
};

// Modern resize observer utility
export const observeResize = (element, callback) => {
  const observer = new ResizeObserver(callback);
  observer.observe(element);
  return observer;
};

// Modern performance observer utility
export const observePerformance = (callback) => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    return observer;
  }
  return null;
};

/* ==========================================================================
   MODERN WEB APIs INTEGRATION
   ========================================================================== */

// View Transitions API support
export const navigate = async (url, options = {}) => {
  if ('startViewTransition' in document) {
    return document.startViewTransition(async () => {
      window.location.href = url;
    });
  } else {
    window.location.href = url;
  }
};

// Web Share API support
export const share = async (data) => {
  if ('share' in navigator) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }
  return false;
};

// Clipboard API support
export const copyToClipboard = async (text) => {
  if ('clipboard' in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }
  return false;
};

// Notification API support
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

/* ==========================================================================
   MODERN ERROR HANDLING
   ========================================================================== */

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send error to analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: event.error.message,
      fatal: false
    });
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send error to analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: event.reason,
      fatal: false
    });
  }
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

// Initialize the application
const app = new App();

// Export for external use
export default app;
export { App };
