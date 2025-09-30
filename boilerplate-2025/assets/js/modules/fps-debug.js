/* ==========================================================================
   FPS DEBUG & OPTIMIZATION MODULE - 2025/2026
   ========================================================================== */

export class FPSDebugger {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.isMonitoring = false;
    this.debugPanel = null;
    this.performanceMetrics = new Map();
    this.optimizationLevel = 'high';
    this.throttledFunctions = new Map();
  }

  async init() {
    if (this.isMonitoring) return;
    
    // Initialize FPS monitoring
    this.initFPSMonitoring();
    
    // Initialize performance metrics
    this.initPerformanceMetrics();
    
    // Initialize optimization system
    this.initOptimizationSystem();
    
    // Create debug panel (development only)
    if (process.env.NODE_ENV === 'development') {
      this.createDebugPanel();
    }
    
    this.isMonitoring = true;
    console.log('🔧 FPS Debugger initialized');
  }

  initFPSMonitoring() {
    const measureFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Auto-optimize based on FPS
        this.autoOptimize();
        
        // Update debug panel
        this.updateDebugPanel();
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  initPerformanceMetrics() {
    // Monitor layout thrashing
    this.monitorLayoutThrashing();
    
    // Monitor paint operations
    this.monitorPaintOperations();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network requests
    this.monitorNetworkRequests();
  }

  monitorLayoutThrashing() {
    let layoutCount = 0;
    let lastLayoutTime = 0;
    
    const originalOffsetHeight = Element.prototype.offsetHeight;
    const originalOffsetWidth = Element.prototype.offsetWidth;
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    
    // Override layout-triggering properties
    Element.prototype.offsetHeight = function() {
      const now = performance.now();
      if (now - lastLayoutTime > 16) { // More than one frame
        layoutCount++;
        lastLayoutTime = now;
      }
      return originalOffsetHeight.call(this);
    };
    
    Element.prototype.offsetWidth = function() {
      const now = performance.now();
      if (now - lastLayoutTime > 16) {
        layoutCount++;
        lastLayoutTime = now;
      }
      return originalOffsetWidth.call(this);
    };
    
    Element.prototype.getBoundingClientRect = function() {
      const now = performance.now();
      if (now - lastLayoutTime > 16) {
        layoutCount++;
        lastLayoutTime = now;
      }
      return originalGetBoundingClientRect.call(this);
    };
    
    // Reset layout count every second
    setInterval(() => {
      this.performanceMetrics.set('layoutCount', layoutCount);
      layoutCount = 0;
    }, 1000);
  }

  monitorPaintOperations() {
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'paint') {
            this.performanceMetrics.set(entry.name, entry.startTime);
          }
        });
      });
      
      try {
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Paint monitoring not supported');
      }
    }
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.performanceMetrics.set('usedJSHeapSize', memory.usedJSHeapSize);
        this.performanceMetrics.set('totalJSHeapSize', memory.totalJSHeapSize);
        this.performanceMetrics.set('jsHeapSizeLimit', memory.jsHeapSizeLimit);
        
        // Calculate memory pressure
        const memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        this.performanceMetrics.set('memoryPressure', memoryPressure);
        
        if (memoryPressure > 0.8) {
          this.handleMemoryPressure();
        }
      }, 5000);
    }
  }

  monitorNetworkRequests() {
    if ('PerformanceObserver' in window) {
      const networkObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            const loadTime = entry.responseEnd - entry.requestStart;
            this.performanceMetrics.set(`resource-${entry.name}`, loadTime);
          }
        });
      });
      
      try {
        networkObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Network monitoring not supported');
      }
    }
  }

  initOptimizationSystem() {
    // Create throttled versions of common functions
    this.throttledFunctions.set('scroll', this.throttle(this.handleScroll.bind(this), 16));
    this.throttledFunctions.set('resize', this.throttle(this.handleResize.bind(this), 250));
    this.throttledFunctions.set('mousemove', this.throttle(this.handleMouseMove.bind(this), 16));
    
    // Apply throttling to global events
    window.addEventListener('scroll', this.throttledFunctions.get('scroll'), { passive: true });
    window.addEventListener('resize', this.throttledFunctions.get('resize'), { passive: true });
    document.addEventListener('mousemove', this.throttledFunctions.get('mousemove'), { passive: true });
  }

  autoOptimize() {
    const previousLevel = this.optimizationLevel;
    
    if (this.fps < 30) {
      this.optimizationLevel = 'low';
    } else if (this.fps < 45) {
      this.optimizationLevel = 'medium';
    } else {
      this.optimizationLevel = 'high';
    }
    
    if (previousLevel !== this.optimizationLevel) {
      this.applyOptimizationLevel();
    }
  }

  applyOptimizationLevel() {
    const root = document.documentElement;
    
    // Remove all optimization classes
    root.classList.remove('low-performance', 'medium-performance', 'high-performance');
    
    // Apply current optimization level
    root.classList.add(`${this.optimizationLevel}-performance`);
    
    // Apply specific optimizations
    switch (this.optimizationLevel) {
      case 'low':
        this.enableLowPerformanceMode();
        break;
      case 'medium':
        this.enableMediumPerformanceMode();
        break;
      case 'high':
        this.enableHighPerformanceMode();
        break;
    }
    
    console.log(`🔧 Performance level: ${this.optimizationLevel} (FPS: ${this.fps})`);
  }

  enableLowPerformanceMode() {
    // Disable heavy effects
    document.documentElement.style.setProperty('--backdrop-filter', 'none');
    document.documentElement.style.setProperty('--box-shadow', 'none');
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--animation-timing', 'linear');
    
    // Reduce animation complexity
    document.documentElement.style.setProperty('--transform-complexity', 'simple');
    
    // Disable parallax effects
    document.documentElement.style.setProperty('--parallax-enabled', 'false');
    
    // Reduce image quality
    document.documentElement.style.setProperty('--image-quality', 'low');
  }

  enableMediumPerformanceMode() {
    // Reduce effects
    document.documentElement.style.setProperty('--backdrop-filter', 'blur(8px)');
    document.documentElement.style.setProperty('--box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    document.documentElement.style.setProperty('--animation-timing', 'ease-out');
    
    // Medium animation complexity
    document.documentElement.style.setProperty('--transform-complexity', 'medium');
    
    // Reduce parallax intensity
    document.documentElement.style.setProperty('--parallax-enabled', 'true');
    document.documentElement.style.setProperty('--parallax-intensity', '0.3');
    
    // Medium image quality
    document.documentElement.style.setProperty('--image-quality', 'medium');
  }

  enableHighPerformanceMode() {
    // Full effects
    document.documentElement.style.removeProperty('--backdrop-filter');
    document.documentElement.style.removeProperty('--box-shadow');
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.style.removeProperty('--animation-timing');
    
    // Full animation complexity
    document.documentElement.style.removeProperty('--transform-complexity');
    
    // Full parallax effects
    document.documentElement.style.removeProperty('--parallax-enabled');
    document.documentElement.style.removeProperty('--parallax-intensity');
    
    // High image quality
    document.documentElement.style.removeProperty('--image-quality');
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
    
    // Reduce animation complexity
    this.optimizationLevel = 'low';
    this.applyOptimizationLevel();
    
    console.warn('⚠️ Memory pressure detected - optimizing');
  }

  createDebugPanel() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'fps-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    document.body.appendChild(this.debugPanel);
    this.updateDebugPanel();
  }

  updateDebugPanel() {
    if (!this.debugPanel) return;
    
    const metrics = this.getPerformanceMetrics();
    const memoryPressure = this.performanceMetrics.get('memoryPressure') || 0;
    const layoutCount = this.performanceMetrics.get('layoutCount') || 0;
    
    this.debugPanel.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>🔧 FPS Debug Panel</strong>
      </div>
      <div>FPS: <span style="color: ${this.fps >= 60 ? '#4ade80' : this.fps >= 30 ? '#fbbf24' : '#ef4444'}">${this.fps}</span></div>
      <div>Performance: <span style="color: ${this.optimizationLevel === 'high' ? '#4ade80' : this.optimizationLevel === 'medium' ? '#fbbf24' : '#ef4444'}">${this.optimizationLevel}</span></div>
      <div>Memory Pressure: <span style="color: ${memoryPressure < 0.5 ? '#4ade80' : memoryPressure < 0.8 ? '#fbbf24' : '#ef4444'}">${(memoryPressure * 100).toFixed(1)}%</span></div>
      <div>Layout Count: <span style="color: ${layoutCount < 5 ? '#4ade80' : layoutCount < 10 ? '#fbbf24' : '#ef4444'}">${layoutCount}</span></div>
      <div>Paint Time: ${metrics.paintTime || 'N/A'}</div>
      <div>Layout Time: ${metrics.layoutTime || 'N/A'}</div>
      <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
        Press F12 to open DevTools for detailed analysis
      </div>
    `;
  }

  getPerformanceMetrics() {
    return {
      fps: this.fps,
      optimizationLevel: this.optimizationLevel,
      memoryPressure: this.performanceMetrics.get('memoryPressure'),
      layoutCount: this.performanceMetrics.get('layoutCount'),
      paintTime: this.performanceMetrics.get('paint'),
      layoutTime: this.performanceMetrics.get('layout')
    };
  }

  // Throttle utility function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Debounce utility function
  debounce(func, wait, immediate) {
    let timeout;
    return function(...args) {
      const context = this;
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

  // Event handlers
  handleScroll() {
    // Optimize scroll handling based on performance level
    if (this.optimizationLevel === 'low') {
      // Skip scroll optimizations in low performance mode
      return;
    }
    
    // Implement scroll optimizations
    this.optimizeScrollHandling();
  }

  handleResize() {
    // Optimize resize handling
    this.optimizeResizeHandling();
  }

  handleMouseMove() {
    // Optimize mouse move handling
    this.optimizeMouseMoveHandling();
  }

  optimizeScrollHandling() {
    // Implement scroll optimizations
    // This would be called by the main application
  }

  optimizeResizeHandling() {
    // Implement resize optimizations
    // This would be called by the main application
  }

  optimizeMouseMoveHandling() {
    // Implement mouse move optimizations
    // This would be called by the main application
  }

  destroy() {
    // Remove debug panel
    if (this.debugPanel) {
      this.debugPanel.remove();
    }
    
    // Remove event listeners
    window.removeEventListener('scroll', this.throttledFunctions.get('scroll'));
    window.removeEventListener('resize', this.throttledFunctions.get('resize'));
    document.removeEventListener('mousemove', this.throttledFunctions.get('mousemove'));
    
    // Clear throttled functions
    this.throttledFunctions.clear();
    
    // Clear performance metrics
    this.performanceMetrics.clear();
    
    this.isMonitoring = false;
    console.log('🔧 FPS Debugger destroyed');
  }
}
