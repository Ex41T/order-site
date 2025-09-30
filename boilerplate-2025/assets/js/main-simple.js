/* ==========================================================================
   SIMPLIFIED MAIN MODULE - Portfolio Slider Only
   ========================================================================== */

import { PortfolioSlider } from './modules/portfolio.js';

console.log('📦 main-simple.js loaded!');

/* ==========================================================================
   INITIALIZE APP
   ========================================================================== */

function initApp() {
  console.log('🚀 Initializing app...');
  console.log('Document ready state:', document.readyState);
  
  // Check if elements exist
  const container = document.querySelector('[data-portfolio-slider]');
  const track = document.querySelector('[data-portfolio-track]');
  
  console.log('Portfolio container found:', !!container);
  console.log('Portfolio track found:', !!track);
  
  if (!container || !track) {
    console.error('❌ Required elements not found!');
    return;
  }
  
  // Initialize portfolio slider
  console.log('Creating PortfolioSlider instance...');
  const portfolioSlider = new PortfolioSlider();
  
  console.log('Calling init()...');
  portfolioSlider.init().then(() => {
    console.log('✅ Portfolio slider initialized successfully');
    console.log('Items in track:', portfolioSlider.items.length);
  }).catch(error => {
    console.error('❌ Portfolio slider initialization failed:', error);
    console.error('Error stack:', error.stack);
  });
  
  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Initialize when DOM is ready
console.log('Setting up DOMContentLoaded listener...');
if (document.readyState === 'loading') {
  console.log('Document still loading, adding listener...');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('Document already loaded, running init immediately...');
  initApp();
}
