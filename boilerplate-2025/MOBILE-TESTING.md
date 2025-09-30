# 🧪 Testowanie na Urządzeniach Mobilnych

## Problem
Strona miała problem z nieskończonym ładowaniem na iPhone 13 Mini w Firefox. Przyczyna: zbyt skomplikowany JavaScript z ciężkimi operacjami (canvas particles, portfolio slider, itp.).

## Rozwiązanie
Stworzona została uproszczona wersja strony z zachowaniem wszystkich funkcjonalności, ale bez problematycznych elementów:

### ✅ Co zostało uproszczone:

1. **JavaScript** (`scripts/app-simple.js`):
   - Usunięto canvas particles (ciężkie obliczenia GPU)
   - Uproszczono portfolio slider
   - Usunięto skomplikowane animacje
   - Dodano optymalizacje dla urządzeń mobilnych
   - Zastosowano throttling dla eventów scroll/resize

2. **CSS** (`styles/style-simple.css`):
   - Usunięto ciężkie operacje `backdrop-filter` na mobile
   - Uproszczono animacje (bez GPU-heavy efektów)
   - Dodano optymalizacje dla `prefers-reduced-motion`
   - Zastosowano prostsze przejścia

3. **HTML** (`index.html`):
   - Wszystkie funkcjonalności zachowane
   - Portfolio z filmami YouTube
   - Formularz kontaktowy
   - Responsywny design
   - Dostępność (ARIA, skip links)

## 🧪 Instrukcja Testowania

### 1. Test na iPhone 13 Mini + Firefox
```bash
# Uruchom lokalny serwer
python -m http.server 8000
# lub
npx serve .
```

**Sprawdź:**
- [ ] Strona ładuje się szybko (< 3 sekundy)
- [ ] Brak nieskończonego ładowania
- [ ] Portfolio slider działa (swipe, strzałki, kropki)
- [ ] Formularz kontaktowy działa
- [ ] Menu mobilne działa
- [ ] Przełączanie motywów działa
- [ ] Filmy YouTube się ładują

### 2. Test na innych urządzeniach
**Android Chrome:**
- [ ] Responsywność
- [ ] Touch events
- [ ] Performance

**Safari iOS:**
- [ ] WebKit compatibility
- [ ] Touch scrolling
- [ ] Form elements

**Desktop Firefox:**
- [ ] Wszystkie funkcje działają
- [ ] Animacje są płynne

### 3. Test Performance
**Chrome DevTools:**
1. Otwórz DevTools (F12)
2. Przełącz na mobile view
3. Wybierz iPhone 13 Mini
4. Sprawdź:
   - [ ] Lighthouse score > 90
   - [ ] LCP < 2.5s
   - [ ] CLS < 0.1
   - [ ] FID < 100ms

### 4. Test Accessibility
**Narzędzia:**
- [ ] axe DevTools
- [ ] WAVE
- [ ] Screen reader (VoiceOver/TalkBack)

**Sprawdź:**
- [ ] Skip links działają
- [ ] ARIA labels są poprawne
- [ ] Kontrast kolorów
- [ ] Keyboard navigation

## 🚀 Deployment na GitHub Pages

### 1. Przygotowanie
```bash
# W folderze boilerplate-2025
git add .
git commit -m "feat: uproszczona wersja dla kompatybilności mobilnej"
git push origin main
```

### 2. GitHub Pages Settings
1. Idź do Settings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)

### 3. Test na GitHub Pages
- URL: `https://username.github.io/order-site/boilerplate-2025/`
- Sprawdź na iPhone 13 Mini + Firefox

## 🔧 Debugging Tips

### Jeśli nadal są problemy:

1. **Sprawdź Console:**
```javascript
// W DevTools Console
console.log('JS loaded:', typeof app !== 'undefined');
console.log('Performance:', performance.now());
```

2. **Sprawdź Network:**
- Czy wszystkie pliki się ładują?
- Czy są błędy 404?
- Czy czas ładowania < 3s?

3. **Sprawdź Mobile Optimizations:**
```css
/* Sprawdź czy te style są aktywne */
.mobile-optimized * {
  backdrop-filter: none !important;
  filter: none !important;
}
```

4. **Test bez JavaScript:**
- Wyłącz JS w DevTools
- Sprawdź czy strona się ładuje
- Sprawdź czy CSS działa

## 📱 Specyficzne Testy Mobile

### iPhone 13 Mini + Firefox
- **Viewport:** 375x812
- **Pixel Ratio:** 3x
- **Touch:** 3D Touch disabled
- **Network:** Throttle to "Slow 3G"

### Test Cases:
1. **Cold Load:** Wyczyść cache, odśwież
2. **Hot Load:** Powróć na stronę
3. **Network Issues:** Symuluj słaby internet
4. **Memory Pressure:** Otwórz wiele kart

## ✅ Checklist Końcowy

- [ ] Strona ładuje się na iPhone 13 Mini + Firefox
- [ ] Wszystkie funkcje działają
- [ ] Performance jest dobra
- [ ] Accessibility jest OK
- [ ] GitHub Pages działa
- [ ] Testy przechodzą na różnych urządzeniach

## 🆘 Jeśli Problem Nadal Występuje

1. **Sprawdź czy używasz najnowszej wersji:**
   - `scripts/app-simple.js`
   - `styles/style-simple.css`
   - `index.html`

2. **Dodaj więcej debugowania:**
```javascript
// Na początku app-simple.js
console.log('🚀 App starting...');
console.log('📱 Mobile detected:', window.innerWidth < 768);
console.log('🌐 User agent:', navigator.userAgent);
```

3. **Sprawdź czy nie ma konfliktów:**
   - Usuń stary `app.js`
   - Sprawdź czy nie ma duplikatów w HTML

4. **Test minimalnej wersji:**
   - Usuń portfolio slider
   - Usuń formularz
   - Zostaw tylko podstawową nawigację

## 📞 Kontakt
Jeśli problem nadal występuje, sprawdź:
- Console errors
- Network failures  
- Memory usage
- JavaScript execution time
