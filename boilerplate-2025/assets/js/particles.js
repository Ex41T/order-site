/**
 * Animated Particles Background
 * Creates floating particles effect like stars
 */

(function() {
  'use strict';

  class ParticleBackground {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.particleCount = 80;
      this.running = false;
      
      this.resize();
      this.init();
      
      window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = document.body.scrollHeight;
    }
    
    init() {
      this.particles = [];
      
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    }
    
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(particle => {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 213, 255, ${particle.opacity})`;
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0, 213, 255, 0.5)';
      });
      
      this.ctx.shadowBlur = 0;
    }
    
    update() {
      this.particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
        
        // Pulse opacity
        particle.opacity += (Math.random() - 0.5) * 0.02;
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
      });
    }
    
    animate() {
      if (!this.running) return;
      
      this.update();
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
    
    start() {
      this.running = true;
      this.animate();
    }
    
    stop() {
      this.running = false;
    }
  }
  
  // Initialize on load
  function init() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) {
      console.warn('Particles canvas not found');
      return;
    }
    
    const particles = new ParticleBackground(canvas);
    particles.start();
    
    // Update canvas height on scroll
    let resizeTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        particles.resize();
      }, 100);
    }, { passive: true });
    
    console.log('✨ Particles initialized');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

