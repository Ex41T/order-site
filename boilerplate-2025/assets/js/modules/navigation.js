/* ==========================================================================
   NAVIGATION MODULE - 2025/2026
   ========================================================================== */

export class Navigation {
  constructor() {
    this.nav = null;
    this.mobileMenuToggle = null;
    this.mobileMenu = null;
    this.navLinks = [];
    this.isMenuOpen = false;
    this.scrollThreshold = 10;
    this.lastScrollY = 0;
    this.scrollDirection = 'down';
  }

  async init() {
    this.nav = document.querySelector('.nav');
    this.mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
    this.mobileMenu = document.querySelector('.mobile-menu');
    this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
    
    if (!this.nav) return;
    
    // Initialize navigation state
    this.initializeNavigation();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup scroll behavior
    this.setupScrollBehavior();
    
    // Setup smooth scrolling
    this.setupSmoothScrolling();
    
    console.log('🧭 Navigation initialized');
  }

  initializeNavigation() {
    // Set initial scroll state
    this.handleScroll();
    
    // Close mobile menu if open
    this.closeMobileMenu();
  }

  setupEventListeners() {
    // Mobile menu toggle
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Close mobile menu on link click
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.nav.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        this.closeMobileMenu();
      }
    });
  }

  setupScrollBehavior() {
    // Throttled scroll handler
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      
      scrollTimeout = window.requestAnimationFrame(() => {
        this.handleScroll();
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Determine scroll direction
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    this.lastScrollY = currentScrollY;
    
    // Toggle nav visibility based on scroll
    if (currentScrollY > this.scrollThreshold) {
      this.nav.classList.add('scrolled');
      
      // Hide nav on scroll down, show on scroll up
      if (this.scrollDirection === 'down' && currentScrollY > 100) {
        this.nav.style.transform = 'translateY(-100%)';
      } else {
        this.nav.style.transform = 'translateY(0)';
      }
    } else {
      this.nav.classList.remove('scrolled');
      this.nav.style.transform = 'translateY(0)';
    }
  }

  setupSmoothScrolling() {
    // Handle anchor links
    this.navLinks.forEach(link => {
      if (link.getAttribute('href')?.startsWith('#')) {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.length > 1) {
            e.preventDefault();
            this.smoothScrollTo(href);
          }
        });
      }
    });
  }

  smoothScrollTo(target) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const targetPosition = targetElement.offsetTop - 80; // Account for fixed nav
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime = null;
    
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    this.mobileMenuToggle.classList.add('active');
    
    if (this.mobileMenu) {
      this.mobileMenu.classList.add('active');
    }
    
    // Prevent body scroll
    document.body.classList.add('menu-open');
    
    // Focus first menu item
    const firstMenuItem = this.mobileMenu?.querySelector('.nav-link');
    if (firstMenuItem) {
      firstMenuItem.focus();
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    this.mobileMenuToggle.classList.remove('active');
    
    if (this.mobileMenu) {
      this.mobileMenu.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.classList.remove('menu-open');
  }

  // Public method to programmatically navigate
  navigateTo(section) {
    const target = document.querySelector(section);
    if (target) {
      this.smoothScrollTo(section);
      this.closeMobileMenu();
    }
  }

  // Public method to update active nav item
  updateActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = this.navLinks;
    
    let currentSection = '';
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100) {
        currentSection = section.id;
      }
    });
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleClick);
    
    // Close mobile menu
    this.closeMobileMenu();
    
    console.log('🧭 Navigation destroyed');
  }
}
