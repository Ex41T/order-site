/* Debug Script - Check if portfolio slider elements exist */

console.log('🔍 Debug: Checking portfolio slider elements...');

// Check if DOM is ready
console.log('Document ready state:', document.readyState);

function checkElements() {
  const container = document.querySelector('[data-portfolio-slider]');
  const track = document.querySelector('[data-portfolio-track]');
  const prevBtn = document.querySelector('[data-portfolio-prev]');
  const nextBtn = document.querySelector('[data-portfolio-next]');
  const dots = document.querySelector('[data-portfolio-dots]');

  console.log('Portfolio container:', container);
  console.log('Portfolio track:', track);
  console.log('Previous button:', prevBtn);
  console.log('Next button:', nextBtn);
  console.log('Dots container:', dots);

  if (container && track) {
    console.log('✅ All required elements found!');
    console.log('Track HTML:', track.innerHTML.substring(0, 200));
  } else {
    console.log('❌ Missing required elements!');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkElements);
} else {
  checkElements();
}
