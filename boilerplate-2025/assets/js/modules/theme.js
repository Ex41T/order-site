/* ==========================================================================
   THEME MANAGER MODULE - 2025/2026
   ========================================================================== */

export class ThemeManager {
  constructor() {
    this.theme = 'auto';
    this.themeToggle = null;
    this.themeIcon = null;
    this.mediaQuery = null;
    this.isInitialized = false;
  }

  async init() {
    this.themeToggle = document.querySelector('[data-theme-toggle]');
    this.themeIcon = this.themeToggle?.querySelector('.theme-icon');
    
    if (!this.themeToggle) return;
    
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup system theme change listener
    this.setupSystemThemeListener();
    
    this.isInitialized = true;
    console.log('🎨 Theme manager initialized');
  }

  initializeTheme() {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.theme = savedTheme;
    } else {
      // Default to system preference
      this.theme = 'auto';
    }
    
    this.applyTheme();
    this.updateThemeToggle();
  }

  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setupSystemThemeListener() {
    // Listen for system theme changes when theme is set to 'auto'
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.theme === 'auto') {
        this.applyTheme();
      }
    });
  }

  toggleTheme() {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(this.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    this.theme = themes[nextIndex];
    this.applyTheme();
    this.updateThemeToggle();
    this.saveTheme();
  }

  applyTheme() {
    const root = document.documentElement;
    const actualTheme = this.getActualTheme();
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    
    // Add current theme class
    root.classList.add(`theme-${this.theme}`);
    
    // Set data-theme attribute
    root.setAttribute('data-theme', actualTheme);
    
    // Update meta theme-color
    this.updateMetaThemeColor(actualTheme);
    
    // Trigger custom event for other modules
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: this.theme, actualTheme }
    }));
  }

  getActualTheme() {
    if (this.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.theme;
  }

  updateThemeToggle() {
    if (!this.themeIcon) return;
    
    const icons = {
      auto: '🌓',
      light: '☀️',
      dark: '🌙'
    };
    
    this.themeIcon.textContent = icons[this.theme];
    this.themeToggle.setAttribute('aria-label', `Motyw: ${this.getThemeLabel()}`);
  }

  getThemeLabel() {
    const labels = {
      auto: 'Automatyczny',
      light: 'Jasny',
      dark: 'Ciemny'
    };
    return labels[this.theme];
  }

  updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === 'dark' ? '#0b0b0f' : '#ffffff';
    }
  }

  saveTheme() {
    localStorage.setItem('theme', this.theme);
  }

  getTheme() {
    return this.theme;
  }

  setTheme(theme) {
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.theme = theme;
      this.applyTheme();
      this.updateThemeToggle();
      this.saveTheme();
    }
  }

  destroy() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
    
    this.isInitialized = false;
    console.log('🎨 Theme manager destroyed');
  }
}
