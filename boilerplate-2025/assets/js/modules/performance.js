/* ==========================================================================
   PERFORMANCE MONITORING MODULE - 2025/2026
   ========================================================================== */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isMonitoring = false;
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
  }

  async init() {
    if (this.isMonitoring) return;
    
    try {
      // Initialize Core Web Vitals monitoring
      await this.initCoreWebVitals();
      
      // Initialize FPS monitoring
      this.initFPSMonitoring();
      
      // Initialize performance observer
      this.initPerformanceObserver();
      
      // Initialize memory monitoring
      this.initMemoryMonitoring();
      
      this.isMonitoring = true;
      console.log('📊 Performance monitoring initialized');
    } catch (error) {
      console.error('❌ Performance monitoring failed to initialize:', error);
    }
  }

  async initCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('LCP', lastEntry.startTime);
        this.reportMetric('LCP', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('LCP', lcpObserver);
      } catch (error) {
        console.warn('LCP monitoring not supported');
      }
    }

    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.set('FID', entry.processingStart - entry.startTime);
          this.reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('FID', fidObserver);
      } catch (error) {
        console.warn('FID monitoring not supported');
      }
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set('CLS', clsValue);
            this.reportMetric('CLS', clsValue);
          }
        });
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('CLS', clsObserver);
      } catch (error) {
        console.warn('CLS monitoring not supported');
      }
    }

    // INP (Interaction to Next Paint) - 2025 standard
    if ('PerformanceObserver' in window) {
      const inpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.set('INP', entry.processingEnd - entry.startTime);
          this.reportMetric('INP', entry.processingEnd - entry.startTime);
        });
      });
      
      try {
        inpObserver.observe({ entryTypes: ['event'] });
        this.observers.set('INP', inpObserver);
      } catch (error) {
        console.warn('INP monitoring not supported');
      }
    }
  }

  initFPSMonitoring() {
    const measureFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        this.metrics.set('FPS', this.fps);
        this.reportMetric('FPS', this.fps);
        
        // Auto-optimize based on FPS
        this.autoOptimize(this.fps);
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          // Track navigation timing
          if (entry.entryType === 'navigation') {
            this.metrics.set('TTFB', entry.responseStart - entry.requestStart);
            this.metrics.set('DOMContentLoaded', entry.domContentLoadedEventEnd - entry.navigationStart);
            this.metrics.set('LoadComplete', entry.loadEventEnd - entry.navigationStart);
          }
          
          // Track paint timing
          if (entry.entryType === 'paint') {
            this.metrics.set(entry.name, entry.startTime);
            this.reportMetric(entry.name, entry.startTime);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['navigation', 'paint'] });
        this.observers.set('general', observer);
      } catch (error) {
        console.warn('General performance observer not supported');
      }
    }
  }

  initMemoryMonitoring() {
    if ('memory' in performance) {
      const measureMemory = () => {
        const memory = performance.memory;
        this.metrics.set('usedJSHeapSize', memory.usedJSHeapSize);
        this.metrics.set('totalJSHeapSize', memory.totalJSHeapSize);
        this.metrics.set('jsHeapSizeLimit', memory.jsHeapSizeLimit);
        
        // Check for memory pressure
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (memoryUsage > 0.8) {
          this.handleMemoryPressure();
        }
      };
      
      // Measure memory every 30 seconds
      setInterval(measureMemory, 30000);
      measureMemory(); // Initial measurement
    }
  }

  autoOptimize(fps) {
    if (fps < 30) {
      this.enableLowPerformanceMode();
    } else if (fps < 45) {
      this.enableMediumPerformanceMode();
    } else {
      this.enableHighPerformanceMode();
    }
  }

  enableLowPerformanceMode() {
    document.documentElement.classList.add('low-performance');
    
    // Disable heavy effects
    document.documentElement.style.setProperty('--backdrop-filter', 'none');
    document.documentElement.style.setProperty('--box-shadow', 'none');
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    
    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-timing', 'linear');
    
    console.log('🔧 Low performance mode enabled');
  }

  enableMediumPerformanceMode() {
    document.documentElement.classList.add('medium-performance');
    document.documentElement.classList.remove('low-performance');
    
    // Reduce effects
    document.documentElement.style.setProperty('--backdrop-filter', 'blur(8px)');
    document.documentElement.style.setProperty('--box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    
    console.log('⚡ Medium performance mode enabled');
  }

  enableHighPerformanceMode() {
    document.documentElement.classList.remove('low-performance', 'medium-performance');
    
    // Restore full effects
    document.documentElement.style.removeProperty('--backdrop-filter');
    document.documentElement.style.removeProperty('--box-shadow');
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.style.removeProperty('--animation-timing');
    
    console.log('🚀 High performance mode enabled');
  }

  handleMemoryPressure() {
    // Trigger garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.warn('⚠️ Memory pressure detected - optimizing');
  }

  reportMetric(name, value) {
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        metric_rating: this.getMetricRating(name, value)
      });
    }
    
    // Send to custom analytics
    if (typeof window.reportAnalytics === 'function') {
      window.reportAnalytics('performance', { name, value });
    }
  }

  getMetricRating(name, value) {
    const thresholds = {
      'LCP': { good: 2500, poor: 4000 },
      'FID': { good: 100, poor: 300 },
      'CLS': { good: 0.1, poor: 0.25 },
      'INP': { good: 200, poor: 500 },
      'FPS': { good: 60, poor: 30 }
    };
    
    const threshold = thresholds[name];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getFPS() {
    return this.fps;
  }

  destroy() {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear metrics
    this.metrics.clear();
    
    this.isMonitoring = false;
    console.log('📊 Performance monitoring destroyed');
  }
}
