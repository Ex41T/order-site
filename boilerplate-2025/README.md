# 🚀 Portfolio 2025/2026 - Boilerplate

Nowoczesny boilerplate strony internetowej zgodny ze standardami 2025/2026, zoptymalizowany pod kątem wydajności, dostępności i SEO.

## ✨ Funkcje

### 🎯 **Wydajność**
- ⚡ **LCP < 2.5s** - Critical CSS inline, preload zasobów
- 🎭 **60 FPS** - GPU-friendly animacje, throttling eventów
- 📱 **CLS < 0.1** - Proper dimensions, stable layout
- 🔄 **INP < 200ms** - Optimized interactions, Web Workers

### 🎨 **Nowoczesne Standardy 2025/2026**
- 🏗️ **CSS Cascade Layers** - Organizacja stylów
- 📦 **Container Queries** - Responsive design
- 🎯 **CSS Subgrid** - Zaawansowane layouty
- 🔍 **CSS :has()** - Selektory rodzicielskie
- 🎪 **CSS Scroll-driven Animations** - Animacje napędzane scroll
- 🌊 **CSS View Transitions** - Płynne przejścia
- 📏 **CSS Logical Properties** - Międzynarodowe layouty

### ♿ **Dostępność (WCAG 2.1 AA)**
- 🎯 **ARIA Labels** - Pełne wsparcie screen readerów
- ⌨️ **Keyboard Navigation** - Nawigacja klawiaturą
- 🎨 **High Contrast** - Wsparcie wysokiego kontrastu
- 🔊 **Screen Reader** - Skip links, semantic HTML
- 📱 **Touch Targets** - Minimum 44px touch targets

### 🔧 **Technologie**
- 📱 **PWA** - Service Worker, manifest, offline support
- 🎨 **ES Modules** - Modularny JavaScript
- ⚡ **Web Workers** - Ciężkie operacje w tle
- 📊 **Performance API** - Monitoring wydajności
- 🎭 **Intersection Observer** - Optymalizacja animacji
- 📱 **Responsive Images** - WebP, AVIF, srcset

## 📁 Struktura Projektu

```
boilerplate-2025/
├── index.html                 # Główna strona
├── sw.js                     # Service Worker
├── assets/
│   ├── css/
│   │   ├── main.css          # Główne style
│   │   ├── reset.css         # CSS Reset
│   │   ├── base.css          # Style bazowe
│   │   └── utilities.css     # Klasy utility
│   ├── js/
│   │   ├── main.js           # Główny moduł
│   │   └── modules/          # Moduły JavaScript
│   │       ├── performance.js
│   │       ├── theme.js
│   │       ├── portfolio.js
│   │       ├── contact.js
│   │       ├── navigation.js
│   │       ├── animations.js
│   │       └── fps-debug.js
│   ├── images/               # Obrazy (WebP/AVIF)
│   ├── icons/                # Ikony (SVG)
│   ├── fonts/                # Fonty (subsetowane)
│   └── manifest.json         # PWA manifest
└── README.md
```

## 🚀 Szybki Start

1. **Klonuj repozytorium**
```bash
git clone <repository-url>
cd boilerplate-2025
```

2. **Skonfiguruj assets**
- Dodaj obrazy w formatach WebP/AVIF do `assets/images/`
- Dodaj ikony SVG do `assets/icons/`
- Dodaj fonty subsetowane do `assets/fonts/`

3. **Otwórz w przeglądarce**
```bash
# Użyj lokalnego serwera (np. Live Server w VS Code)
# Lub otwórz index.html bezpośrednio
```

## 📋 Checklista Wdrożenia

### ✅ **HTML (Semantyka & Optymalizacja)**
- [x] Semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `footer`)
- [x] ARIA labels i role
- [x] Skip links dla screen readerów
- [x] Meta tags (viewport, theme-color, robots)
- [x] Lazy loading (`loading="lazy"`, `decoding="async"`)
- [x] Critical CSS inline w `<head>`
- [x] Font optimization (preload tylko krytycznych)
- [x] Non-critical CSS asynchroniczny
- [x] Responsive images (`<picture>`, `srcset`)
- [x] `prefers-color-scheme` support
- [x] `fetchpriority="high"` dla hero images

### ✅ **CSS (Nowoczesne Standardy 2025/2026)**
- [x] CSS Cascade Layers (`@layer reset, base, components, utilities`)
- [x] Container Queries (`@container`)
- [x] CSS Subgrid (`grid-template-rows: subgrid`)
- [x] CSS `:has()` selector
- [x] CSS Logical Properties (`margin-inline`, `padding-block`)
- [x] CSS Custom Properties (CSS Variables)
- [x] CSS Scroll-driven Animations
- [x] CSS View Transitions
- [x] GPU-friendly animacje (`transform`, `opacity`)
- [x] `will-change` dla animowanych elementów
- [x] `backdrop-filter` optymalizacja
- [x] Mobile-first responsive design
- [x] `prefers-reduced-motion` support
- [x] `prefers-contrast` support

### ✅ **JavaScript (Modularność & Wydajność)**
- [x] ES Modules (`import/export`)
- [x] Modularna architektura
- [x] Throttling/debouncing eventów
- [x] `requestAnimationFrame` dla animacji
- [x] Intersection Observer API
- [x] ResizeObserver API
- [x] Performance Observer API
- [x] Web Workers (dla ciężkich operacji)
- [x] Dynamic imports
- [x] Service Worker (PWA)
- [x] Error handling
- [x] Memory leak prevention

### ✅ **Assets (Optymalizacja)**
- [x] Obrazy w formatach WebP/AVIF
- [x] Responsive images (`srcset`, `sizes`)
- [x] Fonty subsetowane i preloadowane
- [x] SVG ikony zamiast PNG
- [x] Lazy loading dla obrazów
- [x] Proper caching headers
- [x] Image optimization
- [x] Font display optimization

### ✅ **UX & Responsywność**
- [x] Mobile-first design
- [x] Touch-friendly interface
- [x] Smooth scrolling
- [x] 60 FPS animations
- [x] No layout shift (CLS < 0.1)
- [x] Fast interactions (INP < 200ms)
- [x] Progressive enhancement
- [x] Offline support (PWA)
- [x] Theme switching
- [x] Accessibility compliance

## 🔧 Narzędzia Debugowania FPS

### Chrome DevTools
1. **Performance Tab**
   - Frame time analysis
   - FPS monitoring
   - CPU/GPU load
   - Memory usage

2. **Rendering Tab**
   - Layer borders
   - Paint flashing
   - FPS meter
   - GPU acceleration

3. **Lighthouse**
   - Core Web Vitals
   - Performance audit
   - Accessibility check
   - SEO analysis

### Performance Monitoring
```javascript
// FPS monitoring
const fpsMonitor = new FPSMonitor();
fpsMonitor.init();

// Performance metrics
const metrics = fpsMonitor.getMetrics();
console.log('FPS:', metrics.fps);
console.log('LCP:', metrics.LCP);
console.log('CLS:', metrics.CLS);
```

## 📊 Core Web Vitals

### LCP (Largest Contentful Paint)
- **Cel**: < 2.5s
- **Optymalizacje**: Critical CSS inline, preload hero images, font optimization

### CLS (Cumulative Layout Shift)
- **Cel**: < 0.1
- **Optymalizacje**: Proper image dimensions, stable layout, font loading

### INP (Interaction to Next Paint)
- **Cel**: < 200ms
- **Optymalizacje**: Throttling events, Web Workers, optimized animations

## 🎨 Theme System

```css
/* Dark theme (default) */
:root {
  --color-bg: #040810;
  --color-text: #e7f1ff;
  --color-primary: #00d5ff;
}

/* Light theme */
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #ffffff;
    --color-text: #1e293b;
    --color-primary: #0ea5e9;
  }
}
```

## 📱 PWA Features

- **Service Worker** - Offline support, caching
- **Web App Manifest** - Installable app
- **Push Notifications** - User engagement
- **Background Sync** - Form submissions
- **App Shortcuts** - Quick actions

## 🔍 SEO Optimization

- **Semantic HTML** - Proper structure
- **Meta tags** - Title, description, Open Graph
- **Structured data** - JSON-LD
- **Sitemap** - XML sitemap
- **Robots.txt** - Crawler instructions

## ♿ Accessibility Features

- **WCAG 2.1 AA** compliance
- **Screen reader** support
- **Keyboard navigation**
- **High contrast** mode
- **Reduced motion** support
- **Focus management**

## 🚀 Performance Tips

1. **Critical CSS** - Inline above-the-fold styles
2. **Lazy Loading** - Images and non-critical resources
3. **Font Optimization** - Subset, preload, font-display
4. **Image Optimization** - WebP/AVIF, responsive images
5. **Code Splitting** - Dynamic imports
6. **Caching** - Service Worker, HTTP caching
7. **Minification** - CSS, JS, HTML
8. **Compression** - Gzip, Brotli

## 📈 Monitoring

### Real User Monitoring (RUM)
```javascript
// Core Web Vitals tracking
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      // Track LCP
      gtag('event', 'web_vitals', {
        metric_name: 'LCP',
        metric_value: entry.startTime
      });
    }
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

### Error Tracking
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  // Send to analytics service
  gtag('event', 'exception', {
    description: event.error.message,
    fatal: false
  });
});
```

## 🎯 Best Practices 2025/2026

1. **Mobile-First** - Design for mobile, enhance for desktop
2. **Progressive Enhancement** - Core functionality works everywhere
3. **Performance Budget** - Set limits for resources
4. **Accessibility First** - Build inclusive experiences
5. **Modern Standards** - Use latest web technologies
6. **User Experience** - Focus on user needs
7. **Sustainability** - Efficient, lightweight code

## 📚 Zasoby

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [CSS Tricks](https://css-tricks.com/)
- [A List Apart](https://alistapart.com/)
- [Smashing Magazine](https://smashingmagazine.com/)

## 📄 Licencja

MIT License - zobacz plik LICENSE dla szczegółów.

## 🤝 Wsparcie

Jeśli masz pytania lub potrzebujesz pomocy, otwórz issue w repozytorium.

---

**Stworzone z ❤️ dla lepszej sieci w 2025/2026**
