/* ==========================================================================
   PORTFOLIO SLIDER MODULE - 2025/2026 (Enhanced with Drag & Scroll)
   ========================================================================== */

export class PortfolioSlider {
  constructor() {
    this.container = null;
    this.track = null;
    this.items = [];
    this.currentIndex = 0;
    this.isAnimating = false;
    this.isPaused = false;
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.velocity = 0;
    this.autoPlayInterval = null;
    this.intersectionObserver = null;
    this.portfolioData = [];
    this.rafId = null;
  }

  async init() {
    this.container = document.querySelector('[data-portfolio-slider]');
    if (!this.container) {
      console.warn('Portfolio slider container not found');
      return;
    }

    this.track = this.container.querySelector('[data-portfolio-track]');
    if (!this.track) {
      console.warn('Portfolio track not found');
      return;
    }

    // Load portfolio data
    await this.loadPortfolioData();
    
    // Initialize slider
    this.initializeSlider();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup intersection observer
    this.setupIntersectionObserver();
    
    // Center the first item
    requestAnimationFrame(() => {
      this.centerSlide(0, true);
    });
    
    console.log('🎬 Portfolio slider initialized with drag & scroll');
  }

  async loadPortfolioData() {
    // In a real application, this would fetch from an API
    this.portfolioData = [
      { id: 'uAvKsVxWVwI', title: 'iscrev 1_film', type: 'video', aspectRatio: '16/9' },
      { id: 'jA0rw3rDNxY', title: 'iscrev 2_film', type: 'video', aspectRatio: '16/9' },
      { id: 'T44hbbAmIxU', title: 'iscrev 3_film', type: 'video', aspectRatio: '16/9' },
      { id: 'JvMJ3tRFjb8', title: 'iscrev 4_film', type: 'video', aspectRatio: '16/9' },
      { id: '_isuZRmbA-0', title: 'iscrev 5_film', type: 'video', aspectRatio: '16/9' },
      { id: 'JX7CB-0vY9U', title: 'iscrev 6_film', type: 'video', aspectRatio: '16/9' },
      { id: 'VUc09CIQZHo', title: 'iscrev 7_film', type: 'video', aspectRatio: '16/9' },
      { id: '-yEBfohUgpU', title: 'iscrev 8_film169', type: 'video', aspectRatio: '16/9' },
      { id: 'ieC5mFuB9PQ', title: 'iscrev 9_film169', type: 'video', aspectRatio: '16/9' },
      { id: 'NsQg8y5WrEs', title: 'Memoonte 9_film', type: 'video', aspectRatio: '16/9' },
      { id: 'vhAD6b8ui-Y', title: 'Memoonte 11_film', type: 'video', aspectRatio: '16/9' },
      { id: 'DefN84Im7UU', title: 'aiThenos 12_film', type: 'video', aspectRatio: '16/9' },
      { id: 'SFkLBaFWcGw', title: 'aiThenos 13_film', type: 'video', aspectRatio: '16/9' },
      { id: 'Y6vI3l4zomM', title: 'aiThenos 14_film', type: 'video', aspectRatio: '16/9' },
      { id: 'PUtsLJQWaFQ', title: 'aiThenos 15_film', type: 'video', aspectRatio: '16/9' },
      { id: 'R_fQCIZOfvU', title: 'aiThenos 16_film', type: 'video', aspectRatio: '16/9' },
      { id: 'sVZXze7p6TU', title: 'iscrev 17_film', type: 'video', aspectRatio: '16/9' }
    ];
  }

  initializeSlider() {
    // Clear existing content
    this.track.innerHTML = '';
    
    // Create portfolio items
    this.portfolioData.forEach((item, index) => {
      const portfolioItem = this.createPortfolioItem(item, index);
      this.track.appendChild(portfolioItem);
    });
    
    this.items = Array.from(this.track.querySelectorAll('.portfolio-item'));
    
    // Initialize dots
    this.initializeDots();
  }

  createPortfolioItem(item, index) {
    const itemElement = document.createElement('div');
    itemElement.className = 'portfolio-item';
    itemElement.dataset.index = index;
    
    if (item.type === 'video') {
      itemElement.innerHTML = `
        <div class="youtube-container">
          <iframe 
            src="https://www.youtube.com/embed/${item.id}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&playsinline=1&enablejsapi=1&mute=1"
            title="${item.title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy">
          </iframe>
        </div>
      `;
    }
    
    return itemElement;
  }

  initializeDots() {
    const dotsContainer = this.container.querySelector('[data-portfolio-dots]');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    this.portfolioData.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'portfolio-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Przejdź do slajdu ${index + 1}`);
      
      if (index === 0) {
        dot.classList.add('active');
      }
      
      dot.addEventListener('click', () => this.goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  setupEventListeners() {
    // Navigation buttons
    const prevBtn = this.container.querySelector('[data-portfolio-prev]');
    const nextBtn = this.container.querySelector('[data-portfolio-next]');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Mouse drag events for desktop
    this.setupDragEvents();
    
    // Touch events for mobile
    this.setupTouchEvents();
    
    // Keyboard navigation
    this.setupKeyboardNavigation();
    
    // Mouse wheel navigation
    this.setupWheelNavigation();
    
    // Play button events
    this.setupPlayButtonEvents();
  }

  setupDragEvents() {
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;

    const dragStart = (e) => {
      isDragging = true;
      startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      animationID = requestAnimationFrame(this.animation.bind(this));
      this.track.style.cursor = 'grabbing';
      this.track.style.transition = 'none';
    };

    const dragMove = (e) => {
      if (!isDragging) return;
      
      const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      currentTranslate = prevTranslate + currentPosition - startPos;
      
      // Set transform without smooth animation
      this.track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const dragEnd = () => {
      isDragging = false;
      cancelAnimationFrame(animationID);
      
      this.track.style.cursor = 'grab';
      this.track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      
      // Calculate which slide to snap to
      const movedBy = currentTranslate - prevTranslate;
      
      if (movedBy < -100 && this.currentIndex < this.portfolioData.length - 1) {
        this.currentIndex += 1;
      }
      
      if (movedBy > 100 && this.currentIndex > 0) {
        this.currentIndex -= 1;
      }
      
      this.centerSlide(this.currentIndex);
      prevTranslate = this.getCurrentTranslateValue();
    };

    // Mouse events
    this.track.addEventListener('mousedown', dragStart);
    this.track.addEventListener('mousemove', dragMove);
    this.track.addEventListener('mouseup', dragEnd);
    this.track.addEventListener('mouseleave', () => {
      if (isDragging) dragEnd();
    });
    
    // Touch events
    this.track.addEventListener('touchstart', dragStart, { passive: true });
    this.track.addEventListener('touchmove', dragMove, { passive: true });
    this.track.addEventListener('touchend', dragEnd, { passive: true });
    
    // Prevent context menu on long press
    this.track.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Set initial cursor
    this.track.style.cursor = 'grab';
  }

  animation() {
    // This can be used for momentum scrolling if needed
    if (this.isDragging) {
      requestAnimationFrame(this.animation.bind(this));
    }
  }

  getCurrentTranslateValue() {
    const style = window.getComputedStyle(this.track);
    const matrix = style.transform;
    
    if (matrix === 'none') return 0;
    
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
    return parseFloat(matrixValues[4]);
  }

  setupTouchEvents() {
    // Already handled in setupDragEvents for unified behavior
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.container.matches(':hover') || this.container.contains(document.activeElement)) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.prevSlide();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.nextSlide();
            break;
          case 'Home':
            e.preventDefault();
            this.goToSlide(0);
            break;
          case 'End':
            e.preventDefault();
            this.goToSlide(this.portfolioData.length - 1);
            break;
        }
      }
    });
  }

  setupWheelNavigation() {
    let wheelTimeout;
    
    this.track.addEventListener('wheel', (e) => {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0 || e.deltaX > 0) {
          this.nextSlide();
        } else if (e.deltaY < 0 || e.deltaX < 0) {
          this.prevSlide();
        }
      }, 100);
    }, { passive: false });
  }

  setupPlayButtonEvents() {
    this.track.addEventListener('click', (e) => {
      const playBtn = e.target.closest('.portfolio-play-btn');
      if (!playBtn) return;
      
      const portfolioItem = playBtn.closest('.portfolio-item');
      const iframe = portfolioItem.querySelector('iframe');
      
      if (iframe) {
        // Unmute and play video
        const src = iframe.src;
        iframe.src = src.replace('mute=1', 'mute=0&autoplay=1');
        
        // Hide play button
        playBtn.style.display = 'none';
      }
    });
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.resume();
        } else {
          this.pause();
        }
      });
    }, { threshold: 0.5 });
    
    this.intersectionObserver.observe(this.container);
  }

  centerSlide(index, immediate = false) {
    if (index < 0 || index >= this.items.length) return;
    
    this.currentIndex = index;
    
    // Calculate center position
    const containerWidth = this.container.offsetWidth;
    const item = this.items[index];
    const itemWidth = item.offsetWidth;
    const itemLeft = item.offsetLeft;
    
    // Calculate translate to center the item
    const translateX = containerWidth / 2 - itemLeft - itemWidth / 2;
    
    // Apply transition
    this.track.style.transition = immediate 
      ? 'none' 
      : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Update active states and blur
    this.updateActiveStates();
    
    // Update dots
    this.updateDots();
  }

  updateActiveStates() {
    this.items.forEach((item, i) => {
      const distance = Math.abs(i - this.currentIndex);
      
      if (i === this.currentIndex) {
        item.classList.add('active');
        item.style.filter = 'blur(0px)';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      } else {
        item.classList.remove('active');
        // Apply blur based on distance
        const blurAmount = Math.min(distance * 3, 8);
        item.style.filter = `blur(${blurAmount}px)`;
        item.style.opacity = '0.5';
        item.style.transform = 'scale(0.85)';
      }
    });
  }

  updateDots() {
    const dots = this.container.querySelectorAll('.portfolio-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  goToSlide(index) {
    this.centerSlide(index);
  }

  nextSlide() {
    const nextIndex = this.currentIndex < this.portfolioData.length - 1 
      ? this.currentIndex + 1 
      : 0;
    this.centerSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = this.currentIndex > 0 
      ? this.currentIndex - 1 
      : this.portfolioData.length - 1;
    this.centerSlide(prevIndex);
  }

  startAutoPlay() {
    // Disabled auto-play for better manual control
    return;
  }

  resetAutoPlay() {
    // Disabled auto-play
    return;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  handleResize() {
    // Recalculate and re-center on resize
    requestAnimationFrame(() => {
      this.centerSlide(this.currentIndex, true);
    });
  }

  destroy() {
    // Clear auto-play
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    
    // Disconnect intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    // Clear event listeners
    this.track.innerHTML = '';
    
    console.log('🎬 Portfolio slider destroyed');
  }
}
