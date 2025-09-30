/* ==========================================================================
   PORTFOLIO SLIDER - STANDALONE VERSION (No ES6 Modules)
   ========================================================================== */

(function() {
  'use strict';
  
  console.log('📦 Portfolio standalone loaded!');

  class PortfolioSlider {
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
      this.portfolioData = [];
    }

    async init() {
      console.log('🎬 Initializing portfolio slider...');
      
      this.container = document.querySelector('[data-portfolio-slider]');
      if (!this.container) {
        console.warn('❌ Portfolio slider container not found');
        return;
      }

      this.track = this.container.querySelector('[data-portfolio-track]');
      if (!this.track) {
        console.warn('❌ Portfolio track not found');
        return;
      }

      console.log('✅ Container and track found');

      // Load portfolio data
      this.loadPortfolioData();
      
      // Initialize slider
      this.initializeSlider();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Center the first item
      setTimeout(() => {
        this.centerSlide(0, true);
      }, 100);
      
      console.log('✅ Portfolio slider initialized with', this.portfolioData.length, 'items');
    }

    loadPortfolioData() {
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
      
      console.log('✅ Created', this.items.length, 'portfolio items');
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
      const prevBtn = this.container.querySelector('[data-portfolio-prev]');
      const nextBtn = this.container.querySelector('[data-portfolio-next]');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevSlide());
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextSlide());
      }
      
      this.setupDragEvents();
      this.setupKeyboardNavigation();
      this.setupWheelNavigation();
    }

    setupDragEvents() {
      let isDragging = false;
      let startPos = 0;
      let currentTranslate = 0;
      let prevTranslate = 0;

      const dragStart = (e) => {
        isDragging = true;
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        this.track.style.cursor = 'grabbing';
        this.track.style.transition = 'none';
      };

      const dragMove = (e) => {
        if (!isDragging) return;
        
        const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        currentTranslate = prevTranslate + currentPosition - startPos;
        this.track.style.transform = `translateX(${currentTranslate}px)`;
      };

      const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        this.track.style.cursor = 'grab';
        this.track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -100 && this.currentIndex < this.portfolioData.length - 1) {
          this.currentIndex += 1;
        } else if (movedBy > 100 && this.currentIndex > 0) {
          this.currentIndex -= 1;
        }
        
        this.centerSlide(this.currentIndex);
        prevTranslate = this.getCurrentTranslateValue();
      };

      this.track.addEventListener('mousedown', dragStart);
      this.track.addEventListener('mousemove', dragMove);
      this.track.addEventListener('mouseup', dragEnd);
      this.track.addEventListener('mouseleave', () => {
        if (isDragging) dragEnd();
      });
      
      this.track.addEventListener('touchstart', dragStart, { passive: true });
      this.track.addEventListener('touchmove', dragMove, { passive: true });
      this.track.addEventListener('touchend', dragEnd, { passive: true });
      
      this.track.addEventListener('contextmenu', (e) => e.preventDefault());
      this.track.style.cursor = 'grab';
    }

    getCurrentTranslateValue() {
      const style = window.getComputedStyle(this.track);
      const matrix = style.transform;
      
      if (matrix === 'none') return 0;
      
      const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
      return parseFloat(matrixValues[4]);
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

    centerSlide(index, immediate = false) {
      if (index < 0 || index >= this.items.length) return;
      
      this.currentIndex = index;
      
      const containerWidth = this.container.offsetWidth;
      const item = this.items[index];
      const itemWidth = item.offsetWidth;
      const itemLeft = item.offsetLeft;
      
      const translateX = containerWidth / 2 - itemLeft - itemWidth / 2;
      
      this.track.style.transition = immediate 
        ? 'none' 
        : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      
      this.track.style.transform = `translateX(${translateX}px)`;
      
      this.updateActiveStates();
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
  }

  // Initialize when DOM is ready
  function init() {
    console.log('🚀 Initializing portfolio slider...');
    const slider = new PortfolioSlider();
    slider.init();
    
    // Set current year
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
