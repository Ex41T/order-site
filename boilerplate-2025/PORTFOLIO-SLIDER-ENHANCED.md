# 🎬 Portfolio Slider - Enhanced Version

## ✨ Nowe funkcje

### 📱 **Drag & Scroll**
- **Desktop**: Przeciąganie myszką (drag & drop)
- **Mobile**: Przesuwanie palcem (touch swipe)
- Płynne animacje z momentum scrolling
- Automatyczne snap do najbliższego slajdu

### 🎯 **Wyśrodkowanie**
- Każdy aktywny film jest automatycznie wyśrodkowany
- Aktywny film zawsze na środku ekranu
- Nieaktywne filmy są przesuwane do środka niezależnie od kierunku

### 🌫️ **Blur Effect**
- Aktywny film: **bez blur** (100% ostrości)
- Filmy po bokach: **blur proporcjonalny do odległości**
  - 1 slajd od aktywnego: 3px blur
  - 2 slajdy od aktywnego: 6px blur
  - 3+ slajdy od aktywnego: 8px blur (maximum)
- Opacity zmniejsza się dla nieaktywnych filmów (50%)
- Scale transform (0.85) dla efektu głębi

### 📐 **Prostokątne karty**
- **Aspect ratio**: 16:9 (zamiast kwadratowych)
- **Responsywność**:
  - Desktop: `clamp(400px, 45vw, 600px)`
  - Tablet: `clamp(350px, 70vw, 500px)`
  - Mobile: `clamp(280px, 85vw, 400px)`
- Automatyczne dopasowanie do rozmiaru ekranu

### 🎮 **Sterowanie**
1. **Przeciąganie myszką** - kliknij i przeciągnij w lewo/prawo
2. **Touch swipe** - przesuń palcem na mobile
3. **Strzałki** - przyciski ‹ › pod sliderem
4. **Klawiatura** - Arrow Left/Right, Home, End
5. **Mouse wheel** - przewijanie kółkiem myszy
6. **Kropki** - kliknij na wybraną kropkę

## 🔧 Zmiany techniczne

### **JavaScript** (`portfolio.js`)
```javascript
// Nowe funkcje:
- setupDragEvents() - obsługa drag & drop
- centerSlide() - wyśrodkowanie aktywnego slajdu
- updateActiveStates() - blur i opacity dla nieaktywnych
- animation() - momentum scrolling
- getCurrentTranslateValue() - obliczanie pozycji
```

### **CSS** (`index.html`)
```css
.portfolio-item {
  aspect-ratio: 16 / 9;  /* Prostokątne karty */
  filter: blur(3px);      /* Blur dla nieaktywnych */
  opacity: 0.5;
  transform: scale(0.85);
}

.portfolio-item.active {
  filter: blur(0px);      /* Brak blur dla aktywnego */
  opacity: 1;
  transform: scale(1);
}

.portfolio-track {
  cursor: grab;            /* Kursor grab */
  user-select: none;       /* Brak selekcji tekstu */
}
```

### **HTML** (`index.html`)
```html
<div data-portfolio-slider>
  <div data-portfolio-track>
    <!-- Generowane dynamicznie przez JS -->
  </div>
  <div class="portfolio-controls">
    <button data-portfolio-prev>‹</button>
    <div data-portfolio-dots></div>
    <button data-portfolio-next>›</button>
  </div>
</div>
```

## 📊 Dane portfolio

Wszystkie 17 filmów zostały dodane do `portfolioData`:
```javascript
[
  { id: 'uAvKsVxWVwI', title: 'iscrev 1_film' },
  { id: 'jA0rw3rDNxY', title: 'iscrev 2_film' },
  // ... 15 więcej
  { id: 'sVZXze7p6TU', title: 'iscrev 17_film' }
]
```

## 🎨 Efekty wizualne

### **Aktywny film**
- ✨ Pełna ostrość (blur: 0px)
- 🔆 Pełna przezroczystość (opacity: 1)
- 📏 Pełny rozmiar (scale: 1)
- 🎯 Wyśrodkowany
- 💫 Neon border + shadow

### **Nieaktywne filmy**
- 🌫️ Blur 3-8px (zależnie od odległości)
- 🔅 Zmniejszona przezroczystość (opacity: 0.5)
- 📉 Zmniejszony rozmiar (scale: 0.85)
- 🎨 Standardowy border

## 🚀 Performance

- **GPU acceleration** - `transform: translateZ(0)`
- **will-change** - optymalizacja animacji
- **requestAnimationFrame** - płynne 60 FPS
- **No layout shift** - stałe wymiary kart
- **Lazy loading** - iframe ładowane on-demand

## 📱 Mobile optimizations

- Touch-friendly gesture controls
- Reduced blur dla lepszej wydajności
- Mniejsze rozmiary kart
- Zoptymalizowane gap między kartami
- Smooth scrolling z native momentum

## 🎯 User Experience

1. **Intuicyjne** - naturalne gesty drag & swipe
2. **Responsive** - działa na wszystkich urządzeniach
3. **Accessible** - pełna obsługa klawiatury i ARIA
4. **Performant** - płynne 60 FPS animacje
5. **Visual feedback** - blur, scale, opacity transitions

## 🔄 Migration z poprzedniej wersji

### Usunięte:
- ❌ Statyczne portfolio items w HTML
- ❌ Auto-play (wyłączone dla lepszej kontroli)
- ❌ Kwadratowe karty

### Dodane:
- ✅ Dynamiczne generowanie z JavaScript
- ✅ Drag & drop interaction
- ✅ Blur effect na nieaktywnych
- ✅ Prostokątne karty 16:9
- ✅ Center-focused layout

## 🎉 Rezultat

Portfolio slider jest teraz:
- **Prostokątny** (16:9) zamiast kwadratowy
- **Wyśrodkowany** - aktywny film zawsze na środku
- **Interaktywny** - drag myszką i swipe palcem
- **Piękny** - blur effect na filmach po bokach
- **Responsywny** - działa na wszystkich urządzeniach

---

**Aktualizacja**: 30 września 2025  
**Wersja**: 2.0 Enhanced
